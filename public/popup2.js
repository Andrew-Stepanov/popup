(function() {
  'use strict';

  // Конфиг для нового попапа
  const CONFIG = {
    popupId: 'call-me-2step', // Новый уникальный popupId для двухэтапного попапа
    serverUrl: 'https://popup.progkids.com',
    buttonColor: '#007bff',
    position: 'bottom-right'
  };

  // --- Стили (минимально для примера, можно доработать) ---
  const styles = `
    .twostep-popup-wrapper { position: fixed; bottom: 32px; right: 32px; z-index: 10000; }
    .twostep-popup-btn { width: 60px; height: 60px; border-radius: 50%; background: #27ae60; color: #fff; border: none; font-size: 28px; cursor: pointer; box-shadow: 0 4px 24px rgba(39,174,96,0.18); display: flex; align-items: center; justify-content: center; }
    .twostep-modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.62); z-index: 10000; display: none; }
    .twostep-modal-overlay.show { display: block; }
    .twostep-modal { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; display: none; align-items: center; justify-content: center; z-index: 10001; }
    .twostep-modal.show { display: flex; }
    .twostep-form { background: #fff; padding: 32px 28px 18px 28px; border-radius: 16px; box-shadow: 0 8px 32px rgba(39,174,96,0.13); max-width: 340px; width: 95vw; position: relative; font-family: 'Inter', 'Segoe UI', Arial, sans-serif; color: #222; }
    .twostep-close { position: absolute; top: 14px; right: 16px; background: none; border: none; font-size: 26px; color: #b0b0b0; cursor: pointer; }
    .twostep-title { font-size: 20px; font-weight: 700; margin-bottom: 18px; text-align: center; }
    .twostep-field { margin-bottom: 15px; }
    .twostep-input { width: 100%; padding: 12px 13px; border: 1.5px solid #e2e8f0; border-radius: 7px; font-size: 16px; background: #f8fafc; color: black; }
    .twostep-input.error { border-color: #dc3545; background: #fff0f3; }
    .twostep-submit { width: 100%; padding: 14px 0; background: #27ae60; color: #fff; border: none; border-radius: 7px; font-size: 17px; font-weight: 600; cursor: pointer; }
    .twostep-message { padding: 13px; border-radius: 7px; margin-bottom: 14px; text-align: center; font-weight: 500; font-size: 15px; display: none; }
    .twostep-message.success { background: #e6f7ed; color: #227a4d; border: 1px solid #b7e2c7; display: block; }
    .twostep-message.error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; display: block; }
    .twostep-success-block { text-align: center; margin: 0 0 18px 0; }
    .twostep-success-thank { color: #27ae60; font-size: 22px; font-weight: 800; margin-top: 10px; margin-bottom: 8px; }
    .twostep-success-desc { color: #888; font-size: 15px; font-weight: 500; margin-bottom: 10px; }
  `;

  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = styles;
    document.head.appendChild(style);
  }

  function loadLibPhoneNumber(callback) {
    if (window.libphonenumber) return callback();
    const script = document.createElement('script');
    script.src = 'https://popup.progkids.com/libphonenumber-max.js';
    script.onload = callback;
    script.onerror = () => { console.error('[TwoStepPopup] Не удалось загрузить libphonenumber-js'); };
    document.body.appendChild(script);
  }

  // --- UI ---
  function createButton() {
    const wrapper = document.createElement('div');
    wrapper.className = 'twostep-popup-wrapper';
    const button = document.createElement('button');
    button.className = 'twostep-popup-btn';
    button.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.72 19.72 0 0 1 3.08 5.18 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.72c.13 1.05.37 2.06.72 3.03a2 2 0 0 1-.45 2.11l-1.27 1.27a16 16 0 0 0 6.29 6.29l1.27-1.27a2 2 0 0 1 2.11-.45c.97.35 1.98.59 3.03.72A2 2 0 0 1 22 16.92z"></path></svg>';
    button.title = 'Оставить заявку';
    button.addEventListener('click', showModal);
    wrapper.appendChild(button);
    document.body.appendChild(wrapper);
  }

  function createOverlay() {
    let overlay = document.querySelector('.twostep-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'twostep-modal-overlay';
      document.body.appendChild(overlay);
    }
    overlay.addEventListener('click', hideModal);
    return overlay;
  }

  function createModal() {
    if (document.querySelector('.twostep-modal')) return;
    const modal = document.createElement('div');
    modal.className = 'twostep-modal';
    modal.innerHTML = `
      <div class="twostep-form" id="twostepFormContainer"></div>
    `;
    document.body.appendChild(modal);
    return modal;
  }

  function showModal() {
    const modal = document.querySelector('.twostep-modal');
    const overlay = document.querySelector('.twostep-modal-overlay');
    if (modal) {
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
    if (overlay) {
      overlay.classList.add('show');
    }
    renderStep1();
  }

  function hideModal() {
    const modal = document.querySelector('.twostep-modal');
    const overlay = document.querySelector('.twostep-modal-overlay');
    if (modal) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
      renderStep1();
    }
    if (overlay) {
      overlay.classList.remove('show');
    }
  }

  // --- State ---
  let savedPhone = '';
  let savedPage = '';
  let savedTimezone = '';

  // Универсальная функция отправки webhook
  async function sendWebhook(data) {
    try {
      const response = await fetch(`${CONFIG.serverUrl}/api/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      let result = {};
      try { result = await response.json(); } catch (e) {}
      if (!response.ok || (result && result.success === false)) {
        return { success: false, error: result.error || 'Ошибка отправки заявки. Попробуйте позже.' };
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Ошибка отправки заявки. Попробуйте позже.' };
    }
  }

  // --- Step 1 ---
  function renderStep1() {
    const container = document.getElementById('twostepFormContainer');
    if (!container) return;
    container.innerHTML = `
      <button class="twostep-close" type="button" aria-label="Закрыть">&times;</button>
      <div class="twostep-title">Введите ваш номер телефона</div>
      <div class="twostep-message" id="twostepMessage1"></div>
      <form id="twostepForm1" autocomplete="off">
        <div class="twostep-field">
          <input type="text" class="twostep-input" name="phone" required autocomplete="off" maxlength="20" placeholder="+7 999 123-45-67">
        </div>
        <button type="submit" class="twostep-submit">Далее</button>
      </form>
    `;
    container.querySelector('.twostep-close').addEventListener('click', hideModal);
    document.getElementById('twostepForm1').addEventListener('submit', onStep1Submit);
  }

  function validatePhone(phone) {
    if (window.libphonenumber) {
      try {
        const phoneUtil = window.libphonenumber.parsePhoneNumber(phone);
        if (!phoneUtil.isValid()) return false;
      } catch (e) { return false; }
    } else {
      if (!/^\+[\d\s\-\(\)]+$/.test(phone) || phone.replace(/\D/g, '').length < 8) return false;
    }
    return true;
  }

  function showMessage1(text, type = 'error') {
    const msg = document.getElementById('twostepMessage1');
    if (!msg) return;
    msg.textContent = text;
    msg.className = `twostep-message ${type}`;
    msg.style.display = 'block';
  }

  async function onStep1Submit(e) {
    e.preventDefault();
    const phone = e.target.phone.value.trim();
    if (!validatePhone(phone)) {
      showMessage1('Введите корректный номер телефона (международный формат)', 'error');
      e.target.phone.classList.add('error');
      return;
    }
    e.target.phone.classList.remove('error');
    showMessage1('', '');
    // Сохраняем телефон и инфо
    savedPhone = phone;
    savedPage = window.location.href;
    savedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // Отправляем первый этап (только телефон, страница, таймзона)
    const result = await sendWebhook({
      popupId: CONFIG.popupId,
      phone: phone,
      site_url: savedPage,
      timezone: savedTimezone
    });
    if (!result.success) {
      showMessage1(result.error, 'error');
      return;
    }
    // Переходим ко второму этапу только если всё ок
    renderStep2();
  }

  // --- Step 2 ---
  function renderStep2() {
    const container = document.getElementById('twostepFormContainer');
    if (!container) return;
    container.innerHTML = `
      <button class="twostep-close" type="button" aria-label="Закрыть">&times;</button>
      <div class="twostep-title">Пару уточняющих вопросов</div>
      <div class="twostep-message" id="twostepMessage2"></div>
      <form id="twostepForm2" autocomplete="off">
        <div class="twostep-field">
          <input type="text" class="twostep-input" name="name" required placeholder="Ваше имя">
        </div>
        <div class="twostep-field">
          <input type="email" class="twostep-input" name="email" required placeholder="Email">
        </div>
        <div class="twostep-field">
          <input type="number" class="twostep-input" name="child_age" required min="1" max="25" placeholder="Сколько лет ребенку?">
        </div>
        <button type="submit" class="twostep-submit">Отправить</button>
      </form>
    `;
    container.querySelector('.twostep-close').addEventListener('click', hideModal);
    document.getElementById('twostepForm2').addEventListener('submit', onStep2Submit);
  }

  function showMessage2(text, type = 'error') {
    const msg = document.getElementById('twostepMessage2');
    if (!msg) return;
    msg.textContent = text;
    msg.className = `twostep-message ${type}`;
    msg.style.display = 'block';
  }

  async function onStep2Submit(e) {
    e.preventDefault();
    const name = e.target.name.value.trim();
    const email = e.target.email.value.trim();
    const child_age = e.target.child_age.value.trim();
    if (!name) { showMessage2('Введите имя', 'error'); e.target.name.classList.add('error'); return; }
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { showMessage2('Введите корректный email', 'error'); e.target.email.classList.add('error'); return; }
    if (!child_age || isNaN(child_age) || child_age < 1 || child_age > 25) { showMessage2('Введите возраст ребенка от 1 до 25', 'error'); e.target.child_age.classList.add('error'); return; }
    e.target.name.classList.remove('error');
    e.target.email.classList.remove('error');
    e.target.child_age.classList.remove('error');
    showMessage2('', '');
    // Формируем comment
    const comment = `Возраст ребёнка: ${child_age}`;
    // Логируем отправляемые данные
    const dataToSend = {
      popupId: CONFIG.popupId,
      phone: savedPhone,
      name: name,
      email: email,
      child_age: child_age,
      comment: comment,
      site_url: savedPage,
      timezone: savedTimezone
    };
    console.log('[popup2.js] Отправка данных второго этапа:', dataToSend);
    // Отправляем второй этап (все поля)
    const result = await sendWebhook(dataToSend);
    if (!result.success) {
      showMessage2(result.error, 'error');
      return;
    }
    // Показываем успех
    renderSuccess();
  }

  function renderSuccess() {
    const container = document.getElementById('twostepFormContainer');
    if (!container) return;
    container.innerHTML = `
      <div class="twostep-success-block">
        <div class="twostep-success-thank">Спасибо!</div>
        <div class="twostep-success-desc">Ваша заявка успешно отправлена.<br>Мы свяжемся с вами в ближайшее время.</div>
      </div>
      <button class="twostep-submit" onclick="window.location.reload()">Закрыть</button>
    `;
  }

  // --- Init ---
  function init() {
    injectStyles();
    createButton();
    createOverlay();
    createModal();
    loadLibPhoneNumber(() => {});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(); 