# 🚀 Сервис обратного звонка

MVP сервис для добавления формы обратного звонка на любой сайт с помощью одного скрипта.

## 📋 Возможности

- ✅ Плавающая кнопка в правом нижнем углу
- ✅ Модальное окно с формой
- ✅ Валидация обязательных полей (имя, телефон)
- ✅ Отправка данных через Webhook
- ✅ Rate limiting и защита от флуда
- ✅ Красивый современный UI
- ✅ Простое подключение одним скриптом
- ✅ Автоматическое отслеживание fbclid для Facebook рекламы
- ✅ Поддержка двухэтапных форм
- ✅ Интеграция с amoCRM через дополнительные поля

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Запуск сервера

```bash
npm start
```

Сервер запустится на порту 3000 (или PORT из переменных окружения).

### 3. Подключение на сайт

Добавьте на любую страницу:

```html
<script src="http://yourdomain.com:3000/popup.js" async></script>
```

## 📁 Структура проекта

```
callback-form-service/
├── server.js          # Основной сервер
├── data/
│   └── popups.js     # Конфигурация попапов
├── public/
│   └── popup.js      # Скрипт для встраивания
├── package.json
└── README.md
```

## ⚙️ Конфигурация

### Настройка попапов

Отредактируйте `data/popups.js`:

```javascript
module.exports = {
  'call-me-button': {
    label: 'Жду звонка',
    fields: ['name', 'phone'],
    position: 'bottom-right',
    color: '#007bff',
    webhook: '/api/webhook',
  },
  // Добавьте новые попапы здесь
};
```

### Переменные окружения

- `PORT` - порт сервера (по умолчанию 3000)
- `ROISTAT_WEBHOOK_URL` — URL для отправки webhook (обязателен)

Создайте файл `.env` на основе `.env.example` и укажите ваш URL.

## 🔧 API

### POST /api/webhook

Отправляет данные формы в Roistat.

**Тело запроса:**
```json
{
  "popupId": "call-me-button",
  "name": "Иван Иванов",
  "phone": "+79876543210",
  "fbclid": "IwAR123456789"
}
```

**Ответ:**
```json
{
  "success": true,
  "message": "Заявка отправлена успешно!"
}
```

### GET /health

Проверка состояния сервера.

## 🛡️ Безопасность

- Rate limiting: 100 запросов с IP за 15 минут
- Валидация обязательных полей
- Защита от XSS через helmet
- CORS настройки
- Таймаут для внешних запросов (10 сек)

## 🎨 Кастомизация

### Изменение стилей

Отредактируйте CSS в `public/popup.js`:

```javascript
const styles = `
  .callback-button {
    background: #your-color;
    // ваши стили
  }
`;
```

### Добавление новых попапов

1. Добавьте конфигурацию в `data/popups.js`
2. Измените `popupId` в `public/popup.js`

## 📊 Мониторинг

### Логи

Сервер логирует:
- Успешные отправки webhook
- Ошибки валидации
- Ошибки внешних запросов

### Health check

```bash
curl http://localhost:3000/health
```

## 🚀 Развертывание

### PM2 (рекомендуется)

```bash
npm install -g pm2
pm2 start server.js --name callback-service
pm2 save
pm2 startup
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔄 Расширяемость

Сервис готов к расширению:

- ✅ Множественные попапы
- ✅ Уникальные webhook для каждого попапа
- ✅ UI-редактор конфигурации
- ✅ База данных для хранения заявок
- ✅ Аналитика и статистика

## 📊 Отслеживание рекламных кампаний

### Facebook реклама (fbclid)

Сервис автоматически отслеживает параметр `fbclid` из URL и передает его в amoCRM:

```javascript
// Автоматически извлекается из URL:
// https://example.com/?fbclid=IwAR123456789
```

### Настройка в amoCRM

1. Создайте дополнительное поле типа "Текст"
2. Название: `fbclid`
3. Код поля: `fbclid`

### Примеры URL с fbclid

```
https://your-site.com/?fbclid=IwAR123456789
https://your-site.com/page#fbclid=IwAR123456789
```

Подробная документация: [FBCLID_INTEGRATION.md](./FBCLID_INTEGRATION.md)

## 📞 Поддержка

При возникновении проблем:

1. Проверьте логи сервера
2. Убедитесь в доступности внешнего webhook
3. Проверьте CORS настройки
4. Убедитесь в корректности данных формы

## 📄 Лицензия

MIT 

## 📦 Деплой и обновление popup.js

1. **Редактируйте** файл `callback-form-service/public/popup.js` в проекте.
2. **После изменений** скопируйте его в папку, которую раздаёт ваш веб-сервер для popup.progkids.com:
   ```bash
   cp /root/callback-form-service/public/popup.js /var/www/popup.progkids.com/public/popup.js
   ```
3. **Проверьте**, что по адресу  
   `https://popup.progkids.com/popup.js`  
   загружается актуальная версия файла.

--- 