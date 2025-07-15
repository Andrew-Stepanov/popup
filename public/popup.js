(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    popupId: 'call-me-button',
    serverUrl: 'https://popup.progkids.com', // <-- фиксируем адрес
    buttonColor: '#007bff',
    position: 'bottom-right'
  };

  // CSS styles
  const styles = `
    .callback-button {
      position: fixed;
      bottom: 32px;
      right: 32px;
      width: 60px;
      height: 60px;
      background: #27ae60;
      border-radius: 50%;
      border: none;
      color: #fff;
      font-size: 28px;
      cursor: pointer;
      box-shadow: 0 4px 24px rgba(39,174,96,0.18);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: box-shadow 0.18s, background 0.18s, transform 0.18s;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(39,174,96,0.18); }
      70% { box-shadow: 0 0 0 12px rgba(39,174,96,0.08); }
      100% { box-shadow: 0 0 0 0 rgba(39,174,96,0.18); }
    }
    .callback-button:hover {
      background: #219150;
      box-shadow: 0 8px 32px rgba(39,174,96,0.22);
      transform: scale(1.07);
    }
    .callback-overlay {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      background: rgba(0,0,0,0.62) !important;
      z-index: 10000 !important;
      opacity: 1 !important;
      transition: opacity 0.2s;
      pointer-events: auto !important;
      display: none;
    }
    .callback-overlay.show { display: block; }
    .callback-modal {
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.45);
      z-index: 10001;
      display: none;
      align-items: center;
      justify-content: center;
      animation: fadeInBg 0.2s;
    }
    .callback-modal.show { display: flex; }
    @keyframes fadeInBg { from { background: rgba(0,0,0,0); } to { background: rgba(0,0,0,0.18); } }
    .callback-form {
      background: #fff;
      padding: 32px 28px 18px 28px;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(39,174,96,0.13);
      max-width: 340px;
      width: 95vw;
      position: relative;
      font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
      animation: popupIn 0.22s cubic-bezier(.68,-0.55,.27,1.55);
      color: #222;
    }
    @keyframes popupIn { from { transform: scale(0.95) translateY(30px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
    .callback-close {
      position: absolute;
      top: 14px;
      right: 16px;
      background: none;
      border: none;
      font-size: 26px;
      color: #b0b0b0;
      cursor: pointer;
      transition: color 0.18s, background 0.18s, transform 0.18s;
      z-index: 2;
      line-height: 1;
      padding: 0 6px;
      border-radius: 50%;
      outline: none;
    }
    .callback-close:hover {
      color: #27ae60;
      background: #f0f6ff;
      transform: scale(1.13);
    }
    .callback-title {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 10px;
      text-align: center;
      color: #222;
      letter-spacing: 0.01em;
    }
    .callback-subtitle {
      font-size: 15px;
      color: #27ae60;
      text-align: center;
      margin-bottom: 18px;
      font-weight: 500;
    }
    .callback-field {
      margin-bottom: 15px;
    }
    .callback-label {
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
      color: #222;
      font-size: 15px;
    }
    .callback-input {
      width: 100%;
      padding: 12px 13px;
      border: 1.5px solid #e2e8f0;
      border-radius: 7px;
      font-size: 16px;
      transition: border-color 0.18s, background 0.18s;
      box-sizing: border-box;
      background: #f8fafc;
      font-family: inherit;
      color: black;
    }
    .callback-input:focus {
      outline: none;
      border-color: #27ae60;
      background: #fff;
    }
    .callback-input.error {
      border-color: #dc3545;
      background: #fff0f3;
    }
    .callback-submit {
      width: 100%;
      padding: 14px 0;
      background: #27ae60;
      color: #fff;
      border: none;
      border-radius: 7px;
      font-size: 17px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.18s, box-shadow 0.18s, transform 0.18s;
      box-shadow: 0 2px 8px rgba(39,174,96,0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      letter-spacing: 0.01em;
      font-family: inherit;
    }
    .callback-submit:hover {
      background: #219150;
      transform: scale(1.03);
      box-shadow: 0 4px 16px rgba(39,174,96,0.13);
    }
    .callback-submit:disabled {
      background: #b5e6c9;
      cursor: not-allowed;
      color: #fff;
      opacity: 0.7;
    }
    .callback-message {
      padding: 13px;
      border-radius: 7px;
      margin-bottom: 14px;
      text-align: center;
      font-weight: 500;
      font-size: 15px;
    }
    .callback-message.success {
      background: #e6f7ed;
      color: #227a4d;
      border: 1px solid #b7e2c7;
    }
    .callback-message.error {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
    .callback-error {
      color: #dc3545;
      font-size: 14px;
      margin-top: 5px;
      display: none;
    }
    .callback-privacy {
      font-size: 12px;
      color: #888;
      text-align: center;
      margin-top: 10px;
      margin-bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
    }
    .callback-privacy svg {
      width: 14px;
      height: 14px;
      margin-right: 3px;
      color: #27ae60;
      flex-shrink: 0;
    }
    .callback-form,
    .callback-title,
    .callback-label,
    .callback-subtitle,
    .callback-message,
    .callback-privacy {
      color: #222 !important;
    }
    .callback-submit {
      color: #fff !important;
    }
    .callback-form input,
    .callback-form input:focus,
    .callback-form input[type="text"],
    .callback-form input[type="tel"] {
      color: #222 !important;
      background: #fff !important;
      font: 16px 'Inter', 'Segoe UI', Arial, sans-serif !important;
      caret-color: #222 !important;
      border: 1.5px solid #e2e8f0 !important;
      box-shadow: none !important;
    }
  `;

  // Create and inject styles
  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = styles;
    document.head.appendChild(style);
  }

  // Подключение libphonenumber-js локально
  function loadLibPhoneNumber(callback) {
    if (window.libphonenumber) return callback();
    const script = document.createElement('script');
    script.src = 'https://popup.progkids.com/libphonenumber-max.js';
    script.onload = callback;
    script.onerror = () => {
      console.error('[Callback Popup] Не удалось загрузить libphonenumber-js локально');
    };
    document.body.appendChild(script);
  }

  let iti = null;

  // Create button
  function createButton() {
    const button = document.createElement('button');
    button.className = 'callback-button';
    button.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.72 19.72 0 0 1 3.08 5.18 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.72c.13 1.05.37 2.06.72 3.03a2 2 0 0 1-.45 2.11l-1.27 1.27a16 16 0 0 0 6.29 6.29l1.27-1.27a2 2 0 0 1 2.11-.45c.97.35 1.98.59 3.03.72A2 2 0 0 1 22 16.92z"></path></svg>';
    button.title = 'Заказать звонок';
    button.addEventListener('click', showModal);
    document.body.appendChild(button);
  }

  // Create modal
  function createModal() {
    const modal = document.createElement('div');
    modal.className = 'callback-modal';
    modal.innerHTML = `
      <div class="callback-form">
        <button class="callback-close" type="button" aria-label="Закрыть">&times;</button>
        <div class="callback-title">Оставьте заявку — мы перезвоним!</div>
        <div class="callback-subtitle">Свяжемся с вами в течение 5 минут</div>
        <div class="callback-message" id="callbackMessage" style="display: none;"></div>
        <form id="callbackForm" autocomplete="off">
          <div class="callback-field">
            <label class="callback-label">Телефон для связи</label>
            <input type="text" class="callback-input" name="phone" required autocomplete="off" maxlength="20" placeholder="+972 56-565-6565">
            <div class="callback-error" id="phoneError"></div>
          </div>
          <button type="submit" class="callback-submit">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="10" fill="#fff"/><path d="M6.5 10.5L9 13L14 8" stroke="#27ae60" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span>Жду звонка</span>
          </button>
        </form>
        <div class="callback-privacy">
          <svg fill="currentColor" viewBox="0 0 20 20"><path d="M10 2C6.13 2 3 5.13 3 9v3.28c0 .53-.21 1.04-.59 1.41l-1.7 1.7A1 1 0 003 17h14a1 1 0 00.71-1.71l-1.7-1.7a2 2 0 01-.59-1.41V9c0-3.87-3.13-7-7-7zm0 2a5 5 0 015 5v3.28c0 1.06.42 2.08 1.17 2.83l.29.29H3.54l.29-.29A4.01 4.01 0 005 10.28V9a5 5 0 015-5zm0 10a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>
          Мы не передаём ваши данные третьим лицам
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('.callback-close').addEventListener('click', hideModal);
    // Подключаем libphonenumber-js
    loadLibPhoneNumber(() => {
      console.log('[Callback Popup] libphonenumber-js инициализирован');
    });
    return modal;
  }

  // Create overlay
  function createOverlay() {
    let overlay = document.querySelector('.callback-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'callback-overlay';
      document.body.appendChild(overlay);
    }
    overlay.addEventListener('click', hideModal);
    return overlay;
  }

  // Show modal
  function showModal() {
    const modal = document.querySelector('.callback-modal');
    const overlay = document.querySelector('.callback-overlay');
    if (modal) {
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
    if (overlay) {
      overlay.classList.add('show');
    }
  }

  // Hide modal
  function hideModal() {
    const modal = document.querySelector('.callback-modal');
    const overlay = document.querySelector('.callback-overlay');
    if (modal) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
      resetForm();
    }
    if (overlay) {
      overlay.classList.remove('show');
    }
  }

  // Reset form
  function resetForm() {
    const form = document.getElementById('callbackForm');
    const message = document.getElementById('callbackMessage');
    const inputs = form.querySelectorAll('input');
    
    form.reset();
    message.style.display = 'none';
    inputs.forEach(input => {
      input.classList.remove('error');
    });
    document.querySelectorAll('.callback-error').forEach(error => {
      error.style.display = 'none';
    });
  }

  // Show message
  function showMessage(text, type = 'success') {
    const message = document.getElementById('callbackMessage');
    message.innerHTML = text;
    message.className = `callback-message ${type}`;
    message.style.display = 'block';
  }

  // Универсальная валидация номера для всех стран
  function validateForm(formData) {
    const errors = {};
    // Только телефон
    if (window.libphonenumber) {
      try {
        const phoneUtil = window.libphonenumber.parsePhoneNumber(formData.phone);
        if (!phoneUtil.isValid()) {
          errors.phone = 'Введите корректный номер телефона (международный формат)';
        }
      } catch (e) {
        errors.phone = 'Введите корректный номер телефона (международный формат)';
      }
    } else {
      if (!/^\+[\d\s\-\(\)]+$/.test(formData.phone) || formData.phone.replace(/\D/g, '').length < 8) {
        errors.phone = 'Введите корректный номер телефона (международный формат)';
      }
    }
    return errors;
  }

  // Функция для получения roistat_visit
  function getRoistatVisit() {
    // 1. Из куки
    const match = document.cookie.match(/(?:^|; )roistat_visit=([^;]*)/);
    if (match) return decodeURIComponent(match[1]);
    // 2. Из URL ?roistat=...
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('roistat')) return urlParams.get('roistat');
    // 3. Из URL ?rs=...
    if (urlParams.get('rs')) return urlParams.get('rs');
    return '';
  }

  // Submit form
  async function submitForm(formData) {
    try {
      const phone = formData.phone;
      const roistat_visit = getRoistatVisit();
      const response = await fetch(`${CONFIG.serverUrl}/api/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          popupId: CONFIG.popupId,
          phone: phone,
          roistat_visit: roistat_visit
        })
      });
      const result = await response.json();
      if (result.success) {
        showMessage('<svg width="24" height="24" fill="none" viewBox="0 0 24 24" style="vertical-align:middle;margin-right:6px;"><circle cx="12" cy="12" r="12" fill="#27ae60"/><path d="M8 12.5l3 3 5-5" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Спасибо! Мы уже набираем ваш номер!', 'success');
        setTimeout(hideModal, 2500);
      } else {
        showMessage(result.error || 'Ошибка отправки заявки', 'error');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      showMessage('Ошибка отправки заявки. Попробуйте позже.', 'error');
    }
  }

  // Initialize
  function init() {
    injectStyles();
    createButton();
    createOverlay();
    createModal();
    
    // Form submission
    document.addEventListener('submit', function(e) {
      if (e.target.id === 'callbackForm') {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = {
          phone: formData.get('phone')
        };
        
        // Validate
        const errors = validateForm(data);
        
        // Сброс ошибок
        e.target.querySelectorAll('.callback-input').forEach(input => input.classList.remove('error'));
        document.querySelectorAll('.callback-error').forEach(error => { error.style.display = 'none'; });

        if (Object.keys(errors).length > 0) {
          // Show errors
          Object.keys(errors).forEach(field => {
            const input = e.target.querySelector(`[name="${field}"]`);
            const errorDiv = document.getElementById(`${field}Error`);
            
            input.classList.add('error');
            errorDiv.textContent = errors[field];
            errorDiv.style.display = 'block';
          });
          // Блокируем кнопку на 1 сек, чтобы избежать спама
          const submitBtn = e.target.querySelector('.callback-submit');
          submitBtn.disabled = true;
          setTimeout(() => { submitBtn.disabled = false; }, 1000);
          return;
        }
        
        // Submit
        submitForm(data);
      }
    });
    
    // Close modal on outside click
    document.addEventListener('click', function(e) {
      if (e.target.classList.contains('callback-modal')) {
        hideModal();
      }
    });
    
    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        hideModal();
      }
    });
  }

  // Make hideModal globally available
  window.hideModal = hideModal;

  // Форматирование номера при потере фокуса
  document.addEventListener('blur', function(e) {
    if (e.target && e.target.name === 'phone' && window.libphonenumber) {
      try {
        const phoneNumber = window.libphonenumber.parsePhoneNumber(e.target.value);
        e.target.value = phoneNumber.formatInternational();
      } catch (e) {}
    }
  }, true);

  // Форматирование номера при вводе (input)
  document.addEventListener('input', function(e) {
    if (e.target && e.target.name === 'phone' && window.libphonenumber) {
      try {
        const phoneNumber = window.libphonenumber.parsePhoneNumber(e.target.value);
        e.target.value = phoneNumber.formatInternational();
      } catch (e) {}
    }
  }, true);

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(); 