require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const path = require('path');
const cookieParser = require('cookie-parser');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./submissions.db');

db.run(`
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT,
    popupId TEXT,
    roistat_visit TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT,
    webhook_response TEXT,
    full_json TEXT
  )
`);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Load popups configuration
const popups = require('./data/popups');

// Webhook endpoint
app.post('/api/webhook', async (req, res) => {
  try {
    const { popupId, name, phone, email, comment } = req.body;
    
    // Validation
    if (!phone) {
      return res.status(400).json({ 
        success: false, 
        error: 'Поле "Телефон" обязательно для заполнения.' 
      });
    }

    // Get popup configuration
    const popupConfig = popups[popupId];
    if (!popupConfig) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid popup ID' 
      });
    }

    // Prepare webhook data
    const roistat_visit = req.body.roistat_visit || req.cookies?.roistat_visit || '';
    const webhookData = {
      title: `Заявка с ${popupConfig.label}`,
      name: name,
      email: email || '',
      phone: phone,
      comment: comment || '',
      roistat_visit: roistat_visit,
      fields: {
        site: req.headers.referer || 'unknown',
        source: popupId,
        popup_label: popupConfig.label
      }
    };

    // Сохраняем заявку в базу
    const submission = {
      phone,
      popupId,
      roistat_visit,
      created_at: new Date().toISOString(),
      status: 'pending',
      webhook_response: '',
      full_json: JSON.stringify(req.body)
    };
    db.run(
      `INSERT INTO submissions (phone, popupId, roistat_visit, created_at, status, webhook_response, full_json)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [submission.phone, submission.popupId, submission.roistat_visit, submission.created_at, submission.status, submission.webhook_response, submission.full_json],
      function(err) {
        if (err) {
          console.error('[DB] Ошибка сохранения заявки:', err.message);
        } else {
          console.log('[DB] Заявка сохранена, id:', this.lastID);
        }
      }
    );

    // Send to external webhook
    const webhookUrl = process.env.ROISTAT_WEBHOOK_URL;
    if (!webhookUrl) {
      console.error('[WEBHOOK] Не задан ROISTAT_WEBHOOK_URL');
      return res.status(500).json({
        success: false,
        error: 'Webhook URL не настроен на сервере.'
      });
    }
    console.log('[WEBHOOK] Отправка запроса:', {
      url: webhookUrl,
      data: webhookData
    });
    try {
      const webhookResponse = await axios.post(
        webhookUrl,
        webhookData,
        {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'CallbackFormService/1.0'
          },
          timeout: 10000
        }
      );
      console.log('[WEBHOOK] Ответ получен:', {
        status: webhookResponse.status,
        data: webhookResponse.data
      });
      // success:
      db.run(
        `UPDATE submissions SET status = ?, webhook_response = ? WHERE phone = ? AND created_at = ?`,
        ['sent', JSON.stringify(webhookResponse.data), phone, submission.created_at]
      );
      res.json({ success: true, message: 'Заявка отправлена успешно!' });
    } catch (error) {
      if (error.response) {
        // Сервер ответил с ошибкой
        console.error('[WEBHOOK] Ошибка ответа:', {
          status: error.response.status,
          data: error.response.data
        });
        // error:
        db.run(
          `UPDATE submissions SET status = ?, webhook_response = ? WHERE phone = ? AND created_at = ?`,
          ['error', JSON.stringify(error.response.data), phone, submission.created_at]
        );
      } else if (error.request) {
        // Нет ответа
        console.error('[WEBHOOK] Нет ответа от сервера:', error.message);
        // error:
        db.run(
          `UPDATE submissions SET status = ?, webhook_response = ? WHERE phone = ? AND created_at = ?`,
          ['error', JSON.stringify({ message: error.message }), phone, submission.created_at]
        );
      } else {
        // Ошибка настройки
        console.error('[WEBHOOK] Ошибка настройки запроса:', error.message);
        // error:
        db.run(
          `UPDATE submissions SET status = ?, webhook_response = ? WHERE phone = ? AND created_at = ?`,
          ['error', JSON.stringify({ message: error.message }), phone, submission.created_at]
        );
      }
      console.error('[WEBHOOK] Stacktrace:', error.stack);
      res.status(500).json({ 
        success: false, 
        error: 'Ошибка отправки заявки. Попробуйте позже.' 
      });
    }

  } catch (error) {
    console.error('Webhook error:', error.message);
    
    // Don't expose internal errors to client
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка отправки заявки. Попробуйте позже.' 
    });
  }
});

// Serve popup.js
app.get('/popup.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'public', 'popup.js'));
});

// Demo page
app.get('/demo', (req, res) => {
  res.sendFile(path.join(__dirname, 'example.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Callback form service running on port ${PORT}`);
  console.log(`📋 Available popups: ${Object.keys(popups).join(', ')}`);
}); 