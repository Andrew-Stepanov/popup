module.exports = {
  'call-me-button': {
    label: 'Жду звонка',
    fields: ['name', 'phone'],
    position: 'bottom-right',
    color: '#007bff',
    webhook: '/api/webhook', // сейчас у всех один, но можно менять в будущем
  },
  // новые попапы — добавляются сюда
  'call-me-2step': {
    label: 'Двухэтапная форма',
    fields: ['name', 'phone', 'email', 'child_age'],
    position: 'bottom-right',
    color: '#007bff',
    webhook: '/api/webhook',
  },
}; 