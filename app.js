(function () {
  'use strict';

  // --- DIFESA CLICKJACKING SINCRONA ---
  try {
    if (window.top !== window.self) {
      window.top.location = window.self.location;
    }
  } catch (err) {
    document.documentElement.style.display = 'none';
    return;
  }

  // --- STATO DELL'APPLICAZIONE (SOLO IN MEMORIA, ZERO STORAGE) ---
  const state = {
    noDodges: 0,
    maxDodges: 3,
    activity: '',
    place: '',
    dateISO: '',     // YYYY-MM-DD
    timeStr: '17:30' // HH:MM
  };

  // --- RIFERIMENTI DOM ---
  const body = document.body;
  const ambientBg = document.getElementById('ambientBg');

  const screens = {
    step1: document.getElementById('step1'),
    step2: document.getElementById('step2'),
    step3: document.getElementById('step3'),
    stepTicket: document.getElementById('stepTicket')
  };

  // Step 1
  const btnYes = document.getElementById('btnYes');
  const btnNo = document.getElementById('btnNo');
  const step1MainControls = document.getElementById('step1MainControls');
  const dodgeHint = document.getElementById('dodgeHint');
  const confirmNoBox = document.getElementById('confirmNoBox');
  const surrenderBox = document.getElementById('surrenderBox');
  const btnReconsider = document.getElementById('btnReconsider');
  const btnConfirmNoFinal = document.getElementById('btnConfirmNoFinal');
  const btnYesAfterSurrender = document.getElementById('btnYesAfterSurrender');
  const btnBackToStart = document.getElementById('btnBackToStart');

  // Step 2
  const btnBackToStep1 = document.getElementById('btnBackToStep1');
  const optionBtns = document.querySelectorAll('.option-btn[data-activity]');
  const btnOtherOption = document.getElementById('btnOtherOption');
  const customDrawer = document.getElementById('customDrawer');
  const customActivityInput = document.getElementById('customActivityInput');
  const customPlaceInput = document.getElementById('customPlaceInput');
  const btnConfirmCustom = document.getElementById('btnConfirmCustom');

  // Step 3
  const btnBackToStep2Top = document.getElementById('btnBackToStep2Top');
  const step3ChoicePreview = document.getElementById('step3ChoicePreview');
  const btnBackToStep2 = document.getElementById('btnBackToStep2');
  const dateInput = document.getElementById('dateInput');
  const timeInput = document.getElementById('timeInput');
  const humanDatePreview = document.getElementById('humanDatePreview');
  const dateErrorMsg = document.getElementById('dateErrorMsg');
  const btnGenerateTicket = document.getElementById('btnGenerateTicket');

  // Ticket Finale
  const btnBackToStep3 = document.getElementById('btnBackToStep3');
  const ticketActivity = document.getElementById('ticketActivity');
  const ticketPlace = document.getElementById('ticketPlace');
  const ticketDate = document.getElementById('ticketDate');
  const ticketTime = document.getElementById('ticketTime');
  const btnWhatsapp = document.getElementById('btnWhatsapp');
  const btnGoogleCal = document.getElementById('btnGoogleCal');
  const btnCopySummary = document.getElementById('btnCopySummary');
  const btnEditActivity = document.getElementById('btnEditActivity');
  const btnRestartAll = document.getElementById('btnRestartAll');
  const toast = document.getElementById('toast');

  // --- CUORI FLUTTUANTI DI SFONDO ---
  function spawnHeart() {
    const heart = document.createElement('span');
    heart.className = 'floating-heart';
    const isSoft = body.classList.contains('soft-theme');
    const symbols = isSoft ? ['🌸', '💕', '✨', '🤍'] : ['❤️', '💖', '💕', '✨'];
    heart.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    heart.style.left = Math.random() * 96 + 'vw';
    heart.style.fontSize = (14 + Math.random() * 14) + 'px';
    const duration = 7 + Math.random() * 6;
    heart.style.animationDuration = duration + 's';
    ambientBg.appendChild(heart);
    setTimeout(() => heart.remove(), duration * 1000);
  }
  setInterval(spawnHeart, 1300);
  for (let i = 0; i < 5; i++) setTimeout(spawnHeart, i * 350);

  // --- NAVIGAZIONE TRA STEP ---
  function showScreen(name) {
    Object.values(screens).forEach((s) => s.classList.remove('active'));
    screens[name].classList.add('active');

    if (name !== 'step1') {
      btnNo.style.display = 'none';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- LOGICA STEP 1: PULSANTE "NO" CHE SCAPPA 3 VOLTE ---
  const dodgePhrases = [
    'Ops, troppo lenta! 😜',
    'Ci hai quasi preso... riprova! 👀',
    'Ultimo scatto! Adesso non scappo più...'
  ];

  function getSafeViewportSize() {
    const vw = Math.min(window.innerWidth, document.documentElement.clientWidth || window.innerWidth);
    const vh = Math.min(window.innerHeight, document.documentElement.clientHeight || window.innerHeight);
    return { vw, vh };
  }

  function moveNoButtonRandomly() {
    if (btnNo.parentElement !== body) {
      body.appendChild(btnNo);
    }

    btnNo.classList.add('escaping');

    const { vw, vh } = getSafeViewportSize();
    const btnRect = btnNo.getBoundingClientRect();
    const yesRect = btnYes.getBoundingClientRect();

    const pad = 20;
    const maxX = Math.max(pad, vw - btnRect.width - pad);
    const maxY = Math.max(pad, vh - btnRect.height - pad);

    let targetX = pad;
    let targetY = pad;
    let attempts = 0;

    do {
      targetX = pad + Math.random() * (maxX - pad);
      targetY = pad + Math.random() * (maxY - pad);
      attempts++;

      const distFromCurrent = Math.hypot(targetX - btnRect.left, targetY - btnRect.top);
      const overlapsYes = !(
        targetX + btnRect.width + 14 < yesRect.left ||
        targetX - 14 > yesRect.right ||
        targetY + btnRect.height + 14 < yesRect.top ||
        targetY - 14 > yesRect.bottom
      );

      if (distFromCurrent > 80 && !overlapsYes) break;
    } while (attempts < 30);

    btnNo.style.left = Math.round(targetX) + 'px';
    btnNo.style.top = Math.round(targetY) + 'px';

    dodgeHint.textContent = dodgePhrases[state.noDodges] || '';
    state.noDodges++;

    if (state.noDodges >= state.maxDodges) {
      setTimeout(() => {
        btnNo.classList.add('caught');
        dodgeHint.textContent = 'Ok, mi sono fermato. Ora puoi cliccarlo... se vuoi 😅';
      }, 300);
    }
  }

  function handleNoAttempt(e) {
    if (state.noDodges < state.maxDodges) {
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
      moveNoButtonRandomly();
    }
  }

  btnNo.addEventListener('mouseenter', handleNoAttempt);
  btnNo.addEventListener('touchstart', handleNoAttempt, { passive: false });

  btnNo.addEventListener('click', (e) => {
    if (state.noDodges < state.maxDodges) {
      handleNoAttempt(e);
      return;
    }
    btnNo.style.display = 'none';
    step1MainControls.style.display = 'none';
    dodgeHint.textContent = '';
    confirmNoBox.classList.add('active');
  });

  window.addEventListener('resize', () => {
    if (!btnNo.classList.contains('escaping') || btnNo.style.display === 'none') return;
    const { vw, vh } = getSafeViewportSize();
    const rect = btnNo.getBoundingClientRect();
    const pad = 16;
    const clampedX = Math.min(Math.max(pad, rect.left), Math.max(pad, vw - rect.width - pad));
    const clampedY = Math.min(Math.max(pad, rect.top), Math.max(pad, vh - rect.height - pad));
    btnNo.style.left = Math.round(clampedX) + 'px';
    btnNo.style.top = Math.round(clampedY) + 'px';
  });

  function resetStep1() {
    state.noDodges = 0;
    confirmNoBox.classList.remove('active');
    surrenderBox.classList.remove('active');
    step1MainControls.style.display = 'flex';
    dodgeHint.textContent = '';

    btnNo.classList.remove('escaping', 'caught');
    btnNo.style.left = '';
    btnNo.style.top = '';
    btnNo.style.display = 'inline-flex';
    if (btnNo.parentElement !== step1MainControls) {
      step1MainControls.appendChild(btnNo);
    }
  }

  function goBackToStep1() {
    body.classList.remove('soft-theme');
    resetStep1();
    showScreen('step1');
  }

  btnReconsider.addEventListener('click', resetStep1);
  btnBackToStart.addEventListener('click', resetStep1);
  btnBackToStep1.addEventListener('click', goBackToStep1);

  btnConfirmNoFinal.addEventListener('click', () => {
    confirmNoBox.classList.remove('active');
    surrenderBox.classList.add('active');
  });

  function goToStep2() {
    body.classList.add('soft-theme');
    btnNo.style.display = 'none';
    for (let i = 0; i < 8; i++) setTimeout(spawnHeart, i * 100);
    showScreen('step2');
  }

  btnYes.addEventListener('click', goToStep2);
  btnYesAfterSurrender.addEventListener('click', goToStep2);

  // --- LOGICA STEP 2: SCELTA ATTIVITÀ ---
  function sanitizeText(str) {
    return str.trim().replace(/\s+/g, ' ');
  }

  optionBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      optionBtns.forEach((b) => b.classList.remove('selected'));
      btnOtherOption.classList.remove('selected');
      btn.classList.add('selected');
      customDrawer.classList.remove('open');

      state.activity = btn.dataset.activity;
      state.place = btn.dataset.place;
      proceedToStep3();
    });
  });

  btnOtherOption.addEventListener('click', () => {
    optionBtns.forEach((b) => b.classList.remove('selected'));
    btnOtherOption.classList.add('selected');
    customDrawer.classList.add('open');
    customActivityInput.focus();
  });

  function validateCustomInputs() {
    const actOk = sanitizeText(customActivityInput.value).length > 0;
    const placeOk = sanitizeText(customPlaceInput.value).length > 0;
    btnConfirmCustom.disabled = !(actOk && placeOk);
  }

  customActivityInput.addEventListener('input', validateCustomInputs);
  customPlaceInput.addEventListener('input', validateCustomInputs);

  btnConfirmCustom.addEventListener('click', () => {
    const act = sanitizeText(customActivityInput.value);
    const plc = sanitizeText(customPlaceInput.value);
    if (!act || !plc) return;
    state.activity = act;
    state.place = plc;
    proceedToStep3();
  });

  function proceedToStep3() {
    const label = state.activity.toLowerCase().includes(state.place.toLowerCase())
      ? state.activity
      : `${state.activity} • ${state.place}`;
    step3ChoicePreview.textContent = `✨ ${label}`;
    showScreen('step3');
  }

  btnBackToStep2.addEventListener('click', () => showScreen('step2'));
  btnBackToStep2Top.addEventListener('click', () => showScreen('step2'));

  // --- LOGICA STEP 3: CALENDARIO DINAMICO ---
  const MAX_DATE_ISO = '2028-12-31';

  function getTodayLocalISO() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function formatItalianDate(isoDate) {
    if (!isoDate) return '';
    const [y, m, d] = isoDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const formatted = dateObj.toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  function initCalendarBounds() {
    const todayISO = getTodayLocalISO();
    dateInput.min = todayISO;
    dateInput.max = MAX_DATE_ISO;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tY = tomorrow.getFullYear();
    const tM = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const tD = String(tomorrow.getDate()).padStart(2, '0');
    const tomorrowISO = `${tY}-${tM}-${tD}`;

    dateInput.value = tomorrowISO <= MAX_DATE_ISO ? tomorrowISO : todayISO;
    state.dateISO = dateInput.value;
    state.timeStr = timeInput.value || '17:30';
    updateDatePreview();
  }

  function isDateWithinRange(iso) {
    const todayISO = getTodayLocalISO();
    return Boolean(iso) && iso >= todayISO && iso <= MAX_DATE_ISO;
  }

  function isValidTime(t) {
    return /^\d{2}:\d{2}$/.test(t);
  }

  function updateDatePreview() {
    const val = dateInput.value;
    const time = timeInput.value;
    state.dateISO = val;
    state.timeStr = time;

    if (!isDateWithinRange(val)) {
      humanDatePreview.textContent = '⚠️ Seleziona una data valida';
      dateErrorMsg.textContent = 'Scegli una data da oggi in poi 📅';
      dateErrorMsg.style.display = 'block';
      btnGenerateTicket.disabled = true;
      return;
    }

    if (!isValidTime(time)) {
      humanDatePreview.textContent = '⚠️ Seleziona un orario valido';
      dateErrorMsg.textContent = 'Inserisci ora e minuti per l’appuntamento 🕒';
      dateErrorMsg.style.display = 'block';
      btnGenerateTicket.disabled = true;
      return;
    }

    dateErrorMsg.style.display = 'none';
    btnGenerateTicket.disabled = false;
    humanDatePreview.textContent = `📅 ${formatItalianDate(val)} • 🕒 Ore ${time}`;
  }

  dateInput.addEventListener('change', updateDatePreview);
  dateInput.addEventListener('input', updateDatePreview);
  timeInput.addEventListener('change', updateDatePreview);
  timeInput.addEventListener('input', updateDatePreview);

  initCalendarBounds();

  // --- GENERAZIONE BIGLIETTO FINALE & CONDIVISIONE ---
  function buildSummaryText() {
    const niceDate = formatItalianDate(state.dateISO);
    return [
      "Ehi! Ho accettato l'invito 💕",
      `✨ Attività: ${state.activity}`,
      `📍 Luogo: ${state.place}`,
      `📅 Data: ${niceDate}`,
      `🕒 Orario: ${state.timeStr}`,
      'Ci vediamo lì! 😊'
    ].join('\n');
  }

  function buildCalendarDates() {
    const [y, m, d] = state.dateISO.split('-').map(Number);
    const [hh, mm] = state.timeStr.split(':').map(Number);
    const start = new Date(y, m - 1, d, hh, mm, 0);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

    const pad = (n) => String(n).padStart(2, '0');
    const toCalStamp = (dt) =>
      `${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}T${pad(dt.getHours())}${pad(dt.getMinutes())}00`;

    return { startStamp: toCalStamp(start), endStamp: toCalStamp(end) };
  }

  btnGenerateTicket.addEventListener('click', () => {
    if (!isDateWithinRange(state.dateISO) || !isValidTime(state.timeStr)) {
      updateDatePreview();
      return;
    }

    const niceDate = formatItalianDate(state.dateISO);
    ticketActivity.textContent = state.activity;
    ticketPlace.textContent = state.place;
    ticketDate.textContent = niceDate;
    ticketTime.textContent = `Ore ${state.timeStr}`;

    // Link WhatsApp dinamico (nessun numero di telefono salvato nel codice)
    const encodedSummary = encodeURIComponent(buildSummaryText());
    btnWhatsapp.href = `https://wa.me/?text=${encodedSummary}`;

    // Link Google Calendar dinamico
    const { startStamp, endStamp } = buildCalendarDates();
    const title = encodeURIComponent(`${state.activity} (${state.place})`);
    const location = encodeURIComponent(state.place);
    const details = encodeURIComponent(`Appuntamento confermato: ${state.activity} a ${state.place}.`);
    btnGoogleCal.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStamp}/${endStamp}&location=${location}&details=${details}`;

    showScreen('stepTicket');
  });

  btnWhatsapp.addEventListener('click', (e) => {
    if (!btnWhatsapp.href.startsWith('https://wa.me/?text=')) {
      e.preventDefault();
    }
  });

  btnGoogleCal.addEventListener('click', (e) => {
    if (!btnGoogleCal.href.startsWith('https://calendar.google.com/calendar/render?')) {
      e.preventDefault();
    }
  });

  // Pulsanti Indietro dalla schermata finale
  btnBackToStep3.addEventListener('click', () => showScreen('step3'));
  btnEditActivity.addEventListener('click', () => showScreen('step2'));
  btnRestartAll.addEventListener('click', goBackToStep1);

  // Copia negli appunti
  btnCopySummary.addEventListener('click', async () => {
    const text = buildSummaryText();
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        showToast('Riepilogo copiato! Incollalo su WhatsApp 💌');
        return;
      } catch (err) {
        // Fallback se i permessi clipboard sono negati
      }
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    showToast('Riepilogo copiato! 💌');
  });

  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
  }
})();
