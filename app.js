/* ═══════════════════════════════════════════════
   FLIP CLOCK — app.js  (Premium Rewrite with Tasks)
   ═══════════════════════════════════════════════ */
'use strict';

const $ = id => document.getElementById(id);
window.onerror = function (m, f, l, c, e) {
  try { require('fs').appendFileSync('error.log', m + '\\n' + f + ':' + l + '\\n' + (e ? e.stack : '') + '\\n\\n'); } catch (err) { }
};
const pad = n => String(n).padStart(2, '0');
const { ipcRenderer } = (typeof require !== 'undefined') ? require('electron') : { ipcRenderer: null };
const fs = (typeof require !== 'undefined') ? require('fs') : null;
const path_ = (typeof require !== 'undefined') ? require('path') : null;


/* ─────────────────────────────────────
   1. CLOCK DISPLAY ENGINE
───────────────────────────────────── */
function convertNum(str, lang) {
  if (lang === 'ar') {
    const arMap = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return String(str).replace(/[0-9]/g, w => arMap[w]);
  }
  return str;
}

function display(hh, mm, ss, anim = true) {
  const h = pad(hh), m = pad(mm), s = pad(ss);

  const scH = $('scH'), scM = $('scM'), scS = $('scS');
  if (scH) scH.textContent = convertNum(h, S.clockLang);
  if (scM) scM.textContent = convertNum(m, S.clockLang);
  if (scS) scS.textContent = convertNum(s, S.clockLang);

  if ($('ic-h')) $('ic-h').textContent = convertNum(h, S.clockLang);
  if ($('ic-m')) $('ic-m').textContent = convertNum(m, S.clockLang);
  if ($('ic-s')) $('ic-s').textContent = convertNum(s, S.clockLang);

  // Update StandBy Widget Date
  const d = new Date();
  const dayNameEn = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][d.getDay()];
  const dayNameAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'][d.getDay()];
  if ($('scDay')) $('scDay').textContent = S.menuLang === 'ar' ? dayNameAr : dayNameEn;
  if ($('scDate')) $('scDate').textContent = convertNum(d.getDate(), S.clockLang);
}


const I18N = {
  ar: {
    music: "المقاطع", searchTrack: "ابحث أو ضع الرابط...", noTrack: "لا يوجد مقطع",
    browseTracks: "تصفح المقاطع بالأسفل", tracks: "مقاطع الصوت", tasks: "المهام",
    addTask: "أضف مهمة...", noTasks: "لا يوجد مهام", clock: "الساعة",
    pomodoro: "بومودورو", counter: "عداد", setTimer: "ضبط العداد",
    hh: "ساعة", mm: "دقيقة", ss: "ثانية", countDown: "عد تنازلي",
    countUp: "عد تصاعدي", start: "بدء", settings: "الإعدادات",
    language: "اللغة", menuLang: "لغة القوائم", clockLang: "أرقام الساعة",
    clockFont: "الخط", clockSep: "شكل الفاصل", customFont: "خط مخصص (رفع ملف...)", now: "الآن", showWidget: "المربع الجانبي", clockSize: "حجم الساعة", clockSpace: "تباعد الأرقام",
    workMin: "العمل (دقيقة)", shortBreak: "استراحة قصيرة (دقيقة)", longBreak: "استراحة طويلة (دقيقة)",
    sessions: "عدد الجلسات للراحة الطويلة", autoStart: "تشغيل تلقائي للجلسة التالية",
    sound: "الصوت", enableSound: "تفعيل الصوت", volume: "مستوى الصوت",
    display: "المظهر", showSec: "إظهار الثواني", accentColor: "لون الواجهة",
    bgColor: "لون الخلفية", numColor: "لون الأرقام", glowColor: "لون التوهج",
    save: "حفظ", localTime: "الساعة",
    fontFolder: "مجلد الخطوط", openFolder: "فتح المجلد", fontHint: "ضع ملفات الخطوط (.ttf/.otf/.woff) في مجلد الخطوط",
    showAmbient: "تأثيرات الخلفية", ambColor: "لون تأثيرات الخلفية", showGlow: "توهج الأرقام"
  },
  en: {
    music: "SoundCloud", searchTrack: "Search (Enter) or paste link…", noTrack: "No track selected",
    browseTracks: "Browse tracks below", tracks: "Tracks", tasks: "Tasks", addTask: "Add a task…",
    noTasks: "No tasks yet", clock: "Clock", pomodoro: "Pomodoro", counter: "Counter",
    setTimer: "Set Timer", hh: "HH", mm: "MM", ss: "SS", countDown: "Count Down", countUp: "Count Up",
    start: "Start", settings: "Settings", language: "Language", menuLang: "Menu Language",
    clockLang: "Clock Numbers", clockAppearance: "Clock Settings",
    clockFont: "Clock Font", clockSep: "Separator", customFont: "Custom Font (Upload...)", now: "Now", showWidget: "Show Side Widget",
    clockSize: "Clock Size", clockSpace: "Number Spacing",
    workMin: "Work (min)", shortBreak: "Short Break (min)", longBreak: "Long Break (min)",
    sessions: "Sessions before Long Break", autoStart: "Auto-start next", sound: "Sound",
    enableSound: "Enable sound", volume: "Volume", display: "Display", showSec: "Show seconds",
    accentColor: "Accent color", bgColor: "Background color", numColor: "Numbers color", glowColor: "Glow color",
    save: "Save", localTime: "Local Time",
    fontFolder: "Fonts Folder", openFolder: "Open Folder", fontHint: "Drop .ttf/.otf/.woff files into the fonts folder",
    showAmbient: "Ambient Background", ambColor: "Ambient Color", showGlow: "Number Glow"
  }
};

function applyLanguage() {
  const lang = S.menuLang || 'en';
  document.body.classList.toggle('rtl', lang === 'ar');
  const dict = I18N[lang] || I18N.en;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) el.textContent = dict[key];
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) el.placeholder = dict[key];
  });
}

/* ─────────────────────────────────────
   FONT MANAGER
───────────────────────────────────── */
const FontManager = {
  fontsDir: null,
  customFonts: [],

  init() {
    if (path_) {
      this.fontsDir = path_.join(__dirname, 'fonts');
      this.scanFonts();
    }
  },

  scanFonts() {
    if (!fs || !this.fontsDir) return;
    this.customFonts = [];
    try {
      if (!fs.existsSync(this.fontsDir)) {
        fs.mkdirSync(this.fontsDir, { recursive: true });
      }
      const files = fs.readdirSync(this.fontsDir);
      const fontExts = ['.ttf', '.otf', '.woff', '.woff2'];
      files.forEach(file => {
        const ext = path_.extname(file).toLowerCase();
        if (fontExts.includes(ext)) {
          const name = path_.basename(file, ext);
          const fullPath = path_.join(this.fontsDir, file);
          this.customFonts.push({ name, file, path: fullPath, ext });
        }
      });
    } catch (e) {
      console.warn('Font scan error:', e);
    }
    this.populateDropdown();
  },

  populateDropdown() {
    const group = $('sClockFont'); // Target the main select directly now
    if (!group) return;
    // We already have the default option in HTML.
    // If we want to allow other local fonts, we can add them here, 
    // but the user said "ONLY available", so I'll just clear and keep the main one.
  },

  getFontFamily(fontValue) {
    if (!fontValue || !fontValue.startsWith('custom:')) return null;
    const fileName = fontValue.substring(7);
    const font = this.customFonts.find(f => f.file === fileName);
    if (!font) return null;
    const safePath = font.path.replace(/\\/g, '/');
    return { family: `"Custom_${font.name}", system-ui, sans-serif`, face: `@font-face { font-family: "Custom_${font.name}"; src: url("file://${safePath}"); }`, name: font.name };
  },

  openFolder() {
    if (this.fontsDir && fs) {
      if (!fs.existsSync(this.fontsDir)) {
        fs.mkdirSync(this.fontsDir, { recursive: true });
      }
      const { shell } = require('electron');
      if (shell) shell.openPath(this.fontsDir);
    }
  }
};

function applyClockAppearance() {
  const familyStr = "'PingAR-Lt-Black', ui-rounded, 'SF Pro Rounded', system-ui, sans-serif";
  document.documentElement.style.setProperty('--clock-font', familyStr);

  // Update Separators
  const sep = (S.clockSep !== undefined) ? S.clockSep : ':';
  document.querySelectorAll('.sc-colon, .ic-sep, #scColonHM, #scColonMS, .idle-colon').forEach(el => el.textContent = sep);

  if (S.clockSize !== undefined) document.documentElement.style.setProperty('--clock-size', S.clockSize + 'px');
  if (S.clockSpace !== undefined) document.documentElement.style.setProperty('--clock-spacing', S.clockSpace + 'px');

  if ($('scWidgetStack')) {
    $('scWidgetStack').style.display = S.showWidget ? 'flex' : 'none';
  }
}

/* ─────────────────────────────────────
   2. AUDIO

───────────────────────────────────── */
const Audio_ = {
  ctx: null,
  on: true,
  vol: 0.7,
  _ctx() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    return this.ctx;
  },
  bell(freq, len, type) {
    if (!this.on) return;
    try {
      const c = this._ctx();
      const o = c.createOscillator();
      const g = c.createGain();
      o.connect(g); g.connect(c.destination);
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, c.currentTime);
      g.gain.setValueAtTime(this.vol, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + len);
      o.start(c.currentTime);
      o.stop(c.currentTime + len);
    } catch (e) { }
  },
  chime() {
    this.bell(880, .8);
    setTimeout(() => this.bell(1100, .8), 200);
    setTimeout(() => this.bell(660, 1.4), 400);
  }
};

/* ─────────────────────────────────────
   3. SETTINGS
───────────────────────────────────── */
const S = {
  workMin: 25, shortBreak: 5, longBreak: 15, sessions: 4,
  autoStart: false, soundOn: true, volume: 70,
  showSec: true, use24h: false,
  accent: '#e74c3c', bgColor: '#0a0a0c', numColor: '#ffffff', glowColor: '#e74c3c',
  ambientOn: true, ambientColor: '#e74c3c', glowOn: true,
  menuLang: 'en', clockLang: 'en', clockSize: 200, clockSpace: 0,
  clockFont: 'PingAR-Lt-Black', clockSep: ':', showWidget: true
};

function loadSettings() {
  try {
    const saved = localStorage.getItem('fc_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.assign(S, parsed);
    }
  } catch (e) { }

  Audio_.on = S.soundOn;
  Audio_.vol = S.volume / 100;
  applyColors();
  if ($('lbl12h')) $('lbl12h').textContent = S.use24h ? '24h' : '12h';
  applyLanguage();
  applyClockAppearance();
}

function persistSettings() {
  localStorage.setItem('fc_settings', JSON.stringify(S));
  if (ipcRenderer) {
    ipcRenderer.send('save-settings', {
      accent: S.accent,
      bgColor: S.bgColor,
      numColor: S.numColor,
      glowColor: S.glowColor,
      clockFont: S.clockFont,
      clockSep: S.clockSep,
      use24h: S.use24h,
      menuLang: S.menuLang,
      clockLang: S.clockLang
    });
  }
}


function applyColors() {
  const c = S.accent || '#e74c3c';
  const r = parseInt(c.slice(1, 3), 16);
  const g = parseInt(c.slice(3, 5), 16);
  const b = parseInt(c.slice(5, 7), 16);

  const gc = S.glowColor || c;
  const gr = parseInt(gc.slice(1, 3), 16);
  const gg = parseInt(gc.slice(3, 5), 16);
  const gb = parseInt(gc.slice(5, 7), 16);

  document.documentElement.style.setProperty('--accent', c);
  document.documentElement.style.setProperty('--accent-g', `rgba(${r},${g},${b},.35)`);
  document.documentElement.style.setProperty('--bg', S.bgColor || '#0a0a0c');
  document.documentElement.style.setProperty('--clock-color', S.numColor || '#ffffff');
  document.documentElement.style.setProperty('--glow-color', gc);
  document.documentElement.style.setProperty('--glow-color-g', `rgba(${gr},${gg},${gb},.35)`);

  const ambientOn = S.ambientOn !== false;
  document.documentElement.style.setProperty('--ambient-opacity', ambientOn ? '0.8' : '0');

  const glowOn = S.glowOn !== false;
  document.documentElement.style.setProperty('--glow-shadow', glowOn ? '0 4px 50px var(--glow-color-g)' : 'none');

  const amb = S.ambientColor || c;
  const ar = parseInt(amb.slice(1, 3), 16);
  const ag = parseInt(amb.slice(3, 5), 16);
  const ab = parseInt(amb.slice(5, 7), 16);
  
  document.documentElement.style.setProperty('--ambient-c1', `rgba(${ar},${ag},${ab},0.15)`);
  document.documentElement.style.setProperty('--ambient-c2', `rgba(${ar},${ag},${ab},0.12)`);
  document.documentElement.style.setProperty('--ambient-c3', `rgba(${ar},${ag},${ab},0.10)`);
}

/* ─────────────────────────────────────
   4. SHOW / HIDE SECONDS
───────────────────────────────────── */
function showSec(show) {
  if ($('scS')) $('scS').style.display = show ? '' : 'none';
  if ($('scColonMS')) $('scColonMS').style.display = show ? '' : 'none';
}

/* ─────────────────────────────────────
   5. CLOCK MODE
───────────────────────────────────── */
let clockTick = null;

function clockStart() {
  stopAll();
  showSec(S.showSec);
  if ($('pomDots')) $('pomDots').innerHTML = '';
  document.body.classList.remove('break-mode');

  if ($('scExtraInfo')) {
    $('scExtraInfo').textContent = (S.menuLang === 'ar' ? "في وضع الاستعداد" : "Standby");
  }

  const tick = () => {
    const d = new Date();
    let hh = d.getHours();
    const mm = d.getMinutes();
    const ss = d.getSeconds();
    if (!S.use24h) {
      hh = hh % 12 || 12;
    }
    display(hh, mm, ss);
  };
  tick();
  clockTick = setInterval(tick, 1000);
}

/* ─────────────────────────────────────
   6. POMODORO
───────────────────────────────────── */
const Pomo = {
  done: 0,
  phase: 'work',
  running: false,
  rem: 0,
  _iv: null,

  restart() {
    clearInterval(this._iv);
    this.done = 0;
    this.phase = 'work';
    this.running = false;
    this.rem = S.workMin * 60;
    document.body.classList.remove('break-mode');
    this._render();
  },
  start() {
    if (this.running) return;
    this.running = true;
    this._iv = setInterval(() => this._tick(), 1000);
    this._render();
  },
  pause() {
    this.running = false;
    clearInterval(this._iv);
  },
  skip() {
    clearInterval(this._iv);
    this._advance();
  },
  _tick() {
    if (this.rem <= 0) { this._advance(); return; }
    this.rem--;
    this._render();
    if (this.rem === 0) Audio_.chime();
  },
  _advance() {
    clearInterval(this._iv);
    this.running = false;
    if (this.phase === 'work') {
      this.done++;
      const isLong = (this.done % S.sessions) === 0;
      this.phase = isLong ? 'long' : 'short';
      this.rem = (isLong ? S.longBreak : S.shortBreak) * 60;
      document.body.classList.add('break-mode');
    } else {
      this.phase = 'work';
      this.rem = S.workMin * 60;
      document.body.classList.remove('break-mode');
    }
    this._render();
    if (S.autoStart) this.start();
  },
  _render() {
    const h = Math.floor(this.rem / 3600);
    const m = Math.floor((this.rem % 3600) / 60);
    const s = this.rem % 60;
    display(h, m, s);

    // Update StandBy Extra Widget with Pomodoro time
    if ($('scExtraInfo')) {
      const ph = h > 0 ? h + ':' : '';
      $('scExtraInfo').textContent = convertNum(ph + pad(m) + ':' + pad(s) + (S.menuLang === 'ar' ? ' بومودورو' : ' Pomodoro'), S.clockLang);
    }

    /* dots */
    if ($('pomDots')) {
      const c = $('pomDots'); c.innerHTML = '';
      for (let i = 0; i < S.sessions; i++) {
        const d = document.createElement('div');
        d.className = 'pdot';
        if (i < this.done) d.classList.add('done');
        else if (i === this.done && this.phase === 'work') d.classList.add('current');
        c.appendChild(d);
      }
    }
  }
};

/* ─────────────────────────────────────
   7. COUNTER
───────────────────────────────────── */
const Counter = {
  running: false, rem: 0, elapsed: 0,
  dir: 'down', total: 0, _iv: null,

  setup(h, m, s, dir) {
    clearInterval(this._iv);
    this.running = false;
    this.dir = dir;
    this.total = h * 3600 + m * 60 + s;
    this.rem = this.total;
    this.elapsed = 0;
    this._render();
  },
  start() {
    if (this.running) return;
    this.running = true;
    this._iv = setInterval(() => this._tick(), 1000);
  },
  pause() {
    this.running = false;
    clearInterval(this._iv);
  },
  reset() {
    clearInterval(this._iv);
    this.running = false;
    this.rem = this.total;
    this.elapsed = 0;
    this._render();
  },
  _tick() {
    if (this.dir === 'down') {
      if (this.rem <= 0) { Audio_.chime(); clearInterval(this._iv); this.running = false; return; }
      this.rem--;
    } else {
      this.elapsed++;
    }
    this._render();
  },
  _render() {
    const t = this.dir === 'down' ? this.rem : this.elapsed;
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = t % 60;
    display(h, m, s);

    if ($('scExtraInfo')) {
      const ph = h > 0 ? h + ':' : '';
      $('scExtraInfo').textContent = convertNum(ph + pad(m) + ':' + pad(s) + (S.menuLang === 'ar' ? ' مؤقت' : ' Timer'), S.clockLang);
    }
  }
};

/* ─────────────────────────────────────
   8. MODE SWITCH
───────────────────────────────────── */
let mode = 'clock';

function stopAll() {
  clearInterval(clockTick); clockTick = null;
  Pomo.pause();
  Counter.pause();
}

function setPlay(playing) {
  if ($('ico-play')) $('ico-play').style.display = playing ? 'none' : '';
  if ($('ico-pause')) $('ico-pause').style.display = playing ? '' : 'none';
}

function switchMode(m) {
  mode = m;

  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.dataset.mode === m);
  });

  const timer = m === 'pomodoro' || m === 'counter';
  if ($('btnPlay')) $('btnPlay').style.display = timer ? 'flex' : 'none';
  if ($('btnReset')) $('btnReset').style.display = timer ? 'flex' : 'none';
  if ($('btnSkip')) $('btnSkip').style.display = m === 'pomodoro' ? 'flex' : 'none';
  if ($('btn12h')) $('btn12h').style.display = m === 'clock' ? 'flex' : 'none';
  setPlay(false);

  /* close counter overlay if switching away */
  if ($('counterOverlay')) $('counterOverlay').classList.remove('open');

  if (m === 'clock') {
    clockStart();
  } else if (m === 'pomodoro') {
    stopAll();
    showSec(true);
    Pomo.restart();
  } else {
    stopAll();
    showSec(true);
    if ($('pomDots')) $('pomDots').innerHTML = '';
    document.body.classList.remove('break-mode');
    display(0, 5, 0, false);
    if ($('counterOverlay')) $('counterOverlay').classList.add('open');
  }
}

function playPause() {
  if (mode === 'pomodoro') {
    if (Pomo.running) { Pomo.pause(); setPlay(false); }
    else { Pomo.start(); setPlay(true); }
  } else if (mode === 'counter') {
    if (Counter.running) { Counter.pause(); setPlay(false); }
    else { Counter.start(); setPlay(true); }
  }
}

function resetTimer() {
  setPlay(false);
  if (mode === 'pomodoro') Pomo.restart();
  else if (mode === 'counter') Counter.reset();
}

/* ─────────────────────────────────────
   9. FULLSCREEN
───────────────────────────────────── */
function toggleFs() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => { });
  } else {
    document.exitFullscreen().catch(() => { });
  }
}
document.addEventListener('fullscreenchange', () => {
  const fs = !!document.fullscreenElement;
  if ($('ico-expand')) $('ico-expand').style.display = fs ? 'none' : '';
  if ($('ico-compress')) $('ico-compress').style.display = fs ? '' : 'none';
});

/* ─────────────────────────────────────
   DYNAMIC ISLAND
───────────────────────────────────── */
let isIsland = false;
function toggleDynamicIsland(forceState) {
  if (!ipcRenderer) return;
  isIsland = (typeof forceState === 'boolean') ? forceState : !isIsland;
  document.body.classList.toggle('dynamic-island', isIsland);
  document.documentElement.classList.toggle('dynamic-island', isIsland);
  ipcRenderer.send('toggle-dynamic-island', isIsland);
}


/* ─────────────────────────────────────
   10. SETTINGS
   ───────────────────────────────────── */
function openSettings() {
  $('sMenuLang').value = S.menuLang || 'en';
  $('sClockLang').value = S.clockLang || 'en';
  if ($('sClockFont')) {
    FontManager.scanFonts();
    $('sClockFont').value = S.clockFont || 'system';
  }
  if ($('sClockSep')) $('sClockSep').value = (S.clockSep !== undefined) ? S.clockSep : ':';
  if ($('sShowWidget')) $('sShowWidget').checked = (S.showWidget !== false);
  $('sClockSize').value = S.clockSize || 200;
  $('sClockSpace').value = S.clockSpace || 0;
  $('swm').value = S.workMin;
  $('ssb').value = S.shortBreak;
  $('slb').value = S.longBreak;
  $('sns').value = S.sessions;
  $('sas').checked = S.autoStart;
  $('svol').value = S.volume;
  $('ssec').checked = S.showSec;
  $('sacc').value = S.accent;
  $('sambient').checked = S.ambientOn !== false;
  $('sglowOn').checked = S.glowOn !== false;
  $('sAmbColor').value = S.ambientColor || S.accent;
  $('sBgColor').value = S.bgColor || '#0a0a0c';
  $('sNumColor').value = S.numColor || '#ffffff';
  $('sGlowColor').value = S.glowColor || S.accent;
  $('settingsOverlay').classList.add('open');
}

function saveSettings() {
  S.menuLang = $('sMenuLang').value;
  S.clockLang = $('sClockLang').value;
  if ($('sClockFont')) S.clockFont = $('sClockFont').value;
  if ($('sClockSep')) S.clockSep = $('sClockSep').value;
  if ($('sShowWidget')) S.showWidget = $('sShowWidget').checked;
  S.clockSize = parseInt($('sClockSize').value) || 200;
  S.clockSpace = parseInt($('sClockSpace').value) || 0;
  S.workMin = Math.max(1, parseInt($('swm').value) || 25);
  S.shortBreak = Math.max(1, parseInt($('ssb').value) || 5);
  S.longBreak = Math.max(1, parseInt($('slb').value) || 15);
  S.sessions = Math.max(1, parseInt($('sns').value) || 4);
  S.autoStart = $('sas').checked;
  S.soundOn = $('ssnd').checked;
  S.volume = parseInt($('svol').value);
  const oldShowSec = S.showSec;
  S.showSec = $('ssec').checked;
  S.ambientOn = $('sambient').checked;
  S.glowOn = $('sglowOn').checked;
  S.ambientColor = $('sAmbColor').value;
  S.accent = $('sacc').value;
  S.bgColor = $('sBgColor').value;
  S.numColor = $('sNumColor').value;
  S.glowColor = $('sGlowColor').value;

  Audio_.on = S.soundOn;
  Audio_.vol = S.volume / 100;
  applyColors();
  persistSettings();
  applyLanguage();
  applyClockAppearance();

  if (oldShowSec !== S.showSec) {
    showSec(S.showSec);
  }

  if (mode === 'clock') {
    const d = new Date();
    let hr = d.getHours();
    if (!S.use24h) hr = hr % 12 || 12;
    display(hr, d.getMinutes(), d.getSeconds());
  }

  $('settingsOverlay').classList.remove('open');
}

/* ─────────────────────────────────────
   11. TASKS
───────────────────────────────────── */
let tasks = [];

function loadTasks() {
  try {
    const saved = localStorage.getItem('fc_tasks');
    if (saved) tasks = JSON.parse(saved);
  } catch (e) { }
  renderTasks();
}

function saveTasks() {
  localStorage.setItem('fc_tasks', JSON.stringify(tasks));
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  let hh = parseInt(h);
  const ampm = hh >= 12 ? 'PM' : 'AM';
  hh = hh % 12 || 12;
  return `${hh}:${m} ${ampm}`;
}

function renderTasks() {
  const list = $('taskList');
  const empty = $('taskEmpty');
  if (!list || !empty) return;

  list.innerHTML = '';

  if (tasks.length === 0) {
    empty.style.display = 'flex';
  } else {
    empty.style.display = 'none';
    tasks.forEach((t, i) => {
      const li = document.createElement('li');
      li.className = `task-item ${t.done ? 'done' : ''}`;

      let timeText = '';
      if (t.start || t.end) {
        let labelStart = t.start ? formatTime(t.start) : (S.menuLang === 'ar' ? 'الآن' : 'Now');
        let labelEnd = t.end ? formatTime(t.end) : '';
        timeText = `<div class="task-time-disp">${labelStart} ${labelEnd ? '- ' + labelEnd : ''}</div>`;
      }

      li.innerHTML = `
        <button class="task-check" title="Toggle status">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
        </button>
        <div class="task-text-wrap">
          <div class="task-text">${t.text}</div>
          ${timeText}
        </div>
        <button class="task-del" title="Delete">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      `;

      li.querySelector('.task-check').addEventListener('click', () => {
        t.done = !t.done;
        saveTasks();
        renderTasks();
      });

      li.querySelector('.task-del').addEventListener('click', () => {
        tasks.splice(i, 1);
        saveTasks();
        renderTasks();
      });

      list.appendChild(li);
    });
  }

  // Update Progress Bar
  const tpProgress = $('tpProgress');
  const tpCount = $('tpCount');
  if (tpProgress && tpCount) {
    if (tasks.length === 0) {
      tpProgress.style.width = '0%';
      tpCount.textContent = '0/0';
    } else {
      const doneCount = tasks.filter(t => t.done).length;
      tpProgress.style.width = (doneCount / tasks.length * 100) + '%';
      tpCount.textContent = `${doneCount}/${tasks.length}`;
    }
  }
}

function getTargetTimeMs(timeStr, baseDate, isEnd, startMs) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':').map(Number);
  let target = new Date(baseDate);
  target.setHours(h, m, 0, 0);

  if (isEnd && startMs && target.getTime() < startMs) {
    target.setDate(target.getDate() + 1);
  } else if (!isEnd && target.getTime() < baseDate.getTime() - 60000) {
    target.setDate(target.getDate() + 1);
  }
  return target.getTime();
}

function addTask() {
  const inp = $('taskInput');
  const startInp = $('taskStart');
  const endInp = $('taskEnd');
  if (!inp) return;
  const val = inp.value.trim();
  if (val) {
    const now = new Date();
    const startStr = startInp ? startInp.value : '';
    const endStr = endInp ? endInp.value : '';

    let startMs = getTargetTimeMs(startStr, now, false, null);
    let endMs = getTargetTimeMs(endStr, now, true, startMs || now.getTime());

    tasks.push({
      id: Date.now().toString(),
      text: val,
      done: false,
      start: startStr,
      end: endStr,
      startMs: startMs,
      endMs: endMs,
      startNotified: false,
      endNotified: false
    });
    inp.value = '';
    if (startInp) startInp.value = '';
    if (endInp) endInp.value = '';
    saveTasks();
    renderTasks();
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }
}

function checkTaskNotifications() {
  const now = Date.now();
  let changed = false;

  tasks.forEach(t => {
    if (t.done) return;

    if (t.startMs && !t.startNotified && now >= t.startMs) {
      showNotification('Task Started', t.text);
      t.startNotified = true;
      changed = true;
    }

    if (t.endMs && !t.endNotified && now >= t.endMs) {
      showNotification('Task Ended', t.text + ' time is up!');
      t.endNotified = true;
      changed = true;
    }
  });

  if (changed) saveTasks();
}

function updateSideClock() {
  const d = new Date();
  let h = d.getHours();
  const m = pad(d.getMinutes());
  if (!S.use24h) h = h % 12 || 12;
  const val = convertNum(pad(h) + ':' + m, S.clockLang);
  if ($('scRealTimeValue')) $('scRealTimeValue').textContent = val;
}
updateSideClock();
setInterval(updateSideClock, 1000);

function showNotification(title, body) {
  if (Notification.permission === 'granted') {
    new Notification(title, { body });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(title, { body });
      }
    });
  }
}

setInterval(checkTaskNotifications, 5000);

function clearDoneTasks() {
  tasks = tasks.filter(t => !t.done);
  saveTasks();
  renderTasks();
}

/* ─────────────────────────────────────
   12. SOUNDCLOUD MUSIC PLAYER
───────────────────────────────────── */
let scClientId = '';
async function getSCClientId() {
  if (scClientId) return scClientId;
  try {
    const res = await fetch('https://soundcloud.com');
    const text = await res.text();
    const scripts = text.match(/<script crossorigin src="(https:\/\/a-v2\.sndcdn\.com\/assets\/[^"]+)"/g) || [];
    for (let scriptTag of scripts) {
      const urlMatch = scriptTag.match(/src="([^"]+)"/);
      if (!urlMatch) continue;
      const jsRes = await fetch(urlMatch[1]);
      const jsText = await jsRes.text();
      const match = jsText.match(/client_id:"([^"]+)"/);
      if (match) {
        scClientId = match[1];
        return scClientId;
      }
    }
  } catch (e) { console.error('SC fetch error', e); }
  return 'LBCYWmYBCOUCGbkUwnT18OalK8Q12Eow';
}

const MusicPlayer = {
  searchResults: [],
  showingSearch: false,
  tracks: [],
  currentIndex: -1,
  isPlaying: false,
  widget: null,
  iframe: null,
  isLooping: false,
  progressInterval: null,

  init() {
    this.loadTracks();
    this.renderList();
    this._bindControls();
    if ($('mlCount')) $('mlCount').textContent = this.tracks.length;
  },

  loadTracks() {
    try {
      const saved = localStorage.getItem('fc_sc_tracks');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.tracks = parsed;
        }
      }
    } catch (e) { }
  },

  saveTracks() {
    localStorage.setItem('fc_sc_tracks', JSON.stringify(this.tracks));
  },

  async addFromUrl(url, presetTitle = 'Loading...', presetArtist = 'SoundCloud', presetDur = 'Saved') {
    const existingIdx = this.tracks.findIndex(t => t.url === url);
    if (existingIdx !== -1 && !url.includes('/sets/')) {
      this.play(existingIdx);
      if ($('musicSearch')) $('musicSearch').value = '';
      return;
    }

    // Check if it's a playlist (SoundCloud playlists usually have /sets/)
    if (url.includes('/sets/')) {
      try {
        const cid = await getSCClientId();
        const res = await fetch(`https://api-v2.soundcloud.com/resolve?url=${encodeURIComponent(url)}&client_id=${cid}`);
        const data = await res.json();
        if (data && data.tracks) {
          data.tracks.forEach(t => {
            if (!this.tracks.find(tr => tr.url === t.permalink_url)) {
              this.tracks.unshift({
                title: t.title,
                artist: t.user ? t.user.username : 'Unknown',
                url: t.permalink_url,
                dur: t.duration ? this._fmt(t.duration / 1000) : 'Saved'
              });
            }
          });
          this.saveTracks();
          this.renderList();
          this.play(0);
          if ($('musicSearch')) $('musicSearch').value = '';
          return;
        }
      } catch (e) { console.error('Playlist expansion failed', e); }
    }

    const track = {
      title: presetTitle,
      artist: presetArtist,
      url: url,
      dur: presetDur
    };
    this.tracks.unshift(track);
    this.saveTracks();
    this.renderList();
    this.play(0);
    if ($('musicSearch')) $('musicSearch').value = '';
  },

  renderList(filter = '') {
    const list = $('musicList');
    if (!list) return;
    list.innerHTML = '';
    const filterLow = filter.toLowerCase();

    const sourceArr = this.showingSearch ? this.searchResults : this.tracks;
    let count = 0;

    sourceArr.forEach((t, i) => {
      if (filter && !this.showingSearch && !t.title.toLowerCase().includes(filterLow) && !t.artist.toLowerCase().includes(filterLow)) return;
      count++;

      const isActive = (!this.showingSearch && i === this.currentIndex) ||
        (this.showingSearch && this.currentIndex >= 0 && this.tracks[this.currentIndex] && this.tracks[this.currentIndex].url === t.url);

      const li = document.createElement('li');
      li.className = `track-item ${isActive ? 'active' : ''}`;
      li.innerHTML = `
        <div class="track-art">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
            <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
          </svg>
        </div>
        <div class="track-info">
          <div class="track-title">${t.title}</div>
          <div class="track-artist">${t.artist}</div>
        </div>
        <span class="track-dur">${t.dur || ''}</span>
      `;
      li.addEventListener('click', () => {
        if (this.showingSearch) {
          if (t.url) {
            this.addFromUrl(t.url, t.title, t.artist, t.dur);
            this.showingSearch = false;
            if ($('musicSearch')) $('musicSearch').value = '';
            this.renderList();
          }
        } else {
          this.play(i);
        }
      });
      list.appendChild(li);
    });

    if ($('mlCount')) $('mlCount').textContent = count;
  },

  _createWidget(url) {
    /* Remove old iframe */
    if (this.iframe) {
      this.iframe.remove();
      this.widget = null;
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'sc-widget';
    iframe.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;';
    iframe.allow = 'autoplay';
    iframe.src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=true&visual=false&show_comments=false&show_user=false&show_reposts=false`;
    document.body.appendChild(iframe);
    this.iframe = iframe;

    /* Use SoundCloud Widget API */
    if (window.SC && window.SC.Widget) {
      this._attachWidget(iframe);
    } else {
      /* Load API script */
      const script = document.createElement('script');
      script.src = 'https://w.soundcloud.com/player/api.js';
      script.onload = () => this._attachWidget(iframe);
      document.head.appendChild(script);
    }
  },

  _attachWidget(iframe) {
    try {
      const widget = SC.Widget(iframe);
      this.widget = widget;

      widget.bind(SC.Widget.Events.READY, () => {
        widget.play();
        widget.setVolume(($('mpVolume') ? parseInt($('mpVolume').value) : 60));
        this._startProgress();

        widget.getCurrentSound(sound => {
          if (sound && this.currentIndex >= 0 && this.tracks[this.currentIndex]) {
            const t = this.tracks[this.currentIndex];
            if (t.title === 'Loading...') {
              t.title = sound.title || 'Unknown Track';
              t.artist = (sound.user && sound.user.username) ? sound.user.username : 'Unknown Artist';
              this.saveTracks();
              this.renderList($('musicSearch') ? $('musicSearch').value : '');
              if ($('npTitle')) $('npTitle').textContent = t.title;
              if ($('npArtist')) $('npArtist').textContent = t.artist;
            }
          }
        });
      });

      widget.bind(SC.Widget.Events.FINISH, () => {
        if (this.isLooping) {
          this.play(this.currentIndex);
        } else {
          this.next();
        }
      });

      widget.bind(SC.Widget.Events.ERROR, () => {
        /* If a track fails, skip to next */
        setTimeout(() => this.next(), 1000);
      });
    } catch (e) {
      console.warn('SoundCloud Widget API not available, using fallback audio.');
    }
  },

  play(index) {
    if (index < 0 || index >= this.tracks.length) return;
    this.currentIndex = index;
    this.isPlaying = true;
    const track = this.tracks[index];

    /* Update UI */
    if ($('npTitle')) $('npTitle').textContent = track.title;
    if ($('npArtist')) $('npArtist').textContent = track.artist;
    if ($('npArt')) $('npArt').classList.add('playing');
    if ($('mpWaveIcon')) $('mpWaveIcon').classList.add('playing');
    this._setPlayIcon(true);

    /* Update active state in list */
    document.querySelectorAll('.track-item').forEach((el, i) => {
      /* Find the actual track index from the list */
      el.classList.toggle('active', el === document.querySelectorAll('.track-item')[this._getFilteredVisualIndex(index)]);
    });
    this.renderList($('musicSearch') ? $('musicSearch').value : '');

    /* Create SoundCloud widget */
    this._createWidget(track.url);
  },

  _getFilteredVisualIndex(trackIndex) {
    const filter = ($('musicSearch') ? $('musicSearch').value : '').toLowerCase();
    let vi = 0;
    for (let i = 0; i < this.tracks.length; i++) {
      const t = this.tracks[i];
      if (filter && !t.title.toLowerCase().includes(filter) && !t.artist.toLowerCase().includes(filter)) continue;
      if (i === trackIndex) return vi;
      vi++;
    }
    return -1;
  },

  togglePlay() {
    if (this.currentIndex < 0) {
      this.play(0);
      return;
    }
    if (this.widget) {
      if (this.isPlaying) {
        this.widget.pause();
        this.isPlaying = false;
        this._setPlayIcon(false);
        if ($('npArt')) $('npArt').classList.remove('playing');
        if ($('mpWaveIcon')) $('mpWaveIcon').classList.remove('playing');
        clearInterval(this.progressInterval);
      } else {
        this.widget.play();
        this.isPlaying = true;
        this._setPlayIcon(true);
        if ($('npArt')) $('npArt').classList.add('playing');
        if ($('mpWaveIcon')) $('mpWaveIcon').classList.add('playing');
        this._startProgress();
      }
    }
  },

  next() {
    const nextIdx = (this.currentIndex + 1) % this.tracks.length;
    this.play(nextIdx);
  },

  prev() {
    const prevIdx = (this.currentIndex - 1 + this.tracks.length) % this.tracks.length;
    this.play(prevIdx);
  },

  toggleLoop() {
    this.isLooping = !this.isLooping;
    if ($('btnMLoop')) $('btnMLoop').classList.toggle('active', this.isLooping);
  },

  setVolume(val) {
    if (this.widget) {
      this.widget.setVolume(val);
    }
  },

  seek(pct) {
    if (this.widget) {
      this.widget.getDuration(duration => {
        this.widget.seekTo(duration * pct);
      });
    }
  },

  _startProgress() {
    clearInterval(this.progressInterval);
    this.progressInterval = setInterval(() => {
      if (!this.widget) return;
      this.widget.getPosition(pos => {
        this.widget.getDuration(dur => {
          if (dur <= 0) return;
          const pct = (pos / dur) * 100;
          if ($('mpBar')) $('mpBar').style.width = pct + '%';
          if ($('mpTimeCur')) $('mpTimeCur').textContent = this._fmt(pos / 1000);
          if ($('mpTimeDur')) $('mpTimeDur').textContent = this._fmt(dur / 1000);
        });
      });
    }, 500);
  },

  _fmt(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ':' + String(s).padStart(2, '0');
  },

  _setPlayIcon(playing) {
    if ($('ico-mplay')) $('ico-mplay').style.display = playing ? 'none' : '';
    if ($('ico-mpause')) $('ico-mpause').style.display = playing ? '' : 'none';
  },

  _bindControls() {
    if ($('btnMPlay')) $('btnMPlay').addEventListener('click', () => this.togglePlay());
    if ($('btnMNext')) $('btnMNext').addEventListener('click', () => this.next());
    if ($('btnMPrev')) $('btnMPrev').addEventListener('click', () => this.prev());
    if ($('btnMLoop')) $('btnMLoop').addEventListener('click', () => this.toggleLoop());
    if ($('mpVolume')) $('mpVolume').addEventListener('input', e => this.setVolume(parseInt(e.target.value)));
    if ($('mpBarWrap')) $('mpBarWrap').addEventListener('click', e => {
      const rect = $('mpBarWrap').getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      this.seek(Math.max(0, Math.min(1, pct)));
    });
    if ($('musicSearch')) {
      let searchTimeout = null;
      const doSearch = async (val) => {
        if (!val) {
          this.showingSearch = false;
          this.renderList();
          return;
        }
        if (val.match(/^https?:\/\/(www\.)?(soundcloud\.com|on\.soundcloud\.com)\//)) {
          this.addFromUrl(val);
          if ($('musicSearch')) $('musicSearch').value = '';
          return;
        }

        this.showingSearch = true;
        this.searchResults = [{ title: 'Searching...', artist: 'Please wait', url: '', dur: '' }];
        this.renderList();

        try {
          const cid = await getSCClientId();
          const res = await fetch(`https://api-v2.soundcloud.com/search?q=${encodeURIComponent(val)}&client_id=${cid}&limit=15`);
          if (!res.ok) throw new Error('Search failed');
          const data = await res.json();
          if (data && data.collection && data.collection.length > 0) {
            this.searchResults = data.collection.map(t => {
              let typeLabel = '';
              let title = t.title || t.username || 'Unknown';
              let artist = t.user ? t.user.username : (t.full_name || 'SoundCloud');

              if (t.kind === 'user') typeLabel = '👤 Account';
              else if (t.kind === 'playlist') typeLabel = '🎵 Playlist';
              else typeLabel = '🎧 Track';

              return {
                title: `${typeLabel} | ${title}`,
                artist: artist,
                url: t.permalink_url,
                dur: t.duration ? Math.floor(t.duration / 60000) + ':' + String(Math.floor((t.duration % 60000) / 1000)).padStart(2, '0') : 'N/A'
              };
            });
          } else {
            this.searchResults = [{ title: 'No results found', artist: 'Try differently', url: '', dur: '' }];
          }
        } catch (err) {
          this.searchResults = [{ title: 'Search error', artist: 'Network issue', url: '', dur: '' }];
        }
        this.renderList();
      };

      if ($('musicSearch')) {
        $('musicSearch').addEventListener('input', e => {
          clearTimeout(searchTimeout);
          const val = e.target.value.trim();
          searchTimeout = setTimeout(() => doSearch(val), 600);
        });
        $('musicSearch').addEventListener('keydown', e => {
          if (e.key === 'Enter') {
            clearTimeout(searchTimeout);
            doSearch(e.target.value.trim());
          }
        });
      }
    }
  }
};

/* ─────────────────────────────────────
   13. INIT
───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  /* Mode tabs */
  document.querySelectorAll('.tab').forEach(t =>
    t.addEventListener('click', () => switchMode(t.dataset.mode))
  );

  /* Playback */
  if ($('btnPlay')) $('btnPlay').addEventListener('click', playPause);
  if ($('btnReset')) $('btnReset').addEventListener('click', resetTimer);
  if ($('btnSkip')) $('btnSkip').addEventListener('click', () => {
    if (mode === 'pomodoro') { Pomo.skip(); setPlay(Pomo.running); }
  });

  /* 12/24h */
  if ($('btn12h')) $('btn12h').addEventListener('click', () => {
    S.use24h = !S.use24h;
    if ($('lbl12h')) $('lbl12h').textContent = S.use24h ? '24h' : '12h';
    if (mode === 'clock') clockStart();
  });

  /* Fullscreen */
  if ($('btnFs')) $('btnFs').addEventListener('click', toggleFs);

  /* Settings */
  if ($('btnSettings')) $('btnSettings').addEventListener('click', openSettings);
  if ($('btnCloseSettings')) $('btnCloseSettings').addEventListener('click', () => $('settingsOverlay').classList.remove('open'));
  if ($('settingsOverlay')) $('settingsOverlay').addEventListener('click', e => {
    if (e.target === $('settingsOverlay')) $('settingsOverlay').classList.remove('open');
  });
  if ($('btnSave')) $('btnSave').addEventListener('click', saveSettings);

  /* Live updates for styles */
  if ($('sacc')) $('sacc').addEventListener('input', e => applyAccent(e.target.value));
  if ($('svol')) $('svol').addEventListener('input', e => { Audio_.vol = parseInt(e.target.value) / 100; });
  if ($('sClockSize')) $('sClockSize').addEventListener('input', e => document.documentElement.style.setProperty('--clock-size', e.target.value + 'px'));
  if ($('sClockSpace')) $('sClockSpace').addEventListener('input', e => document.documentElement.style.setProperty('--clock-spacing', e.target.value + 'px'));
  if ($('sMenuLang')) $('sMenuLang').addEventListener('change', e => { S.menuLang = e.target.value; applyLanguage(); });
  if ($('sClockLang')) $('sClockLang').addEventListener('change', e => { S.clockLang = e.target.value; if (mode === 'clock') { const d = new Date(); let hr = d.getHours(); if (!S.use24h) hr = hr % 12 || 12; display(hr, d.getMinutes(), d.getSeconds()); } });
  if ($('sClockSep')) $('sClockSep').addEventListener('change', e => { S.clockSep = e.target.value; applyClockAppearance(); persistSettings(); });
  if ($('sClockFont')) $('sClockFont').addEventListener('change', e => {
    S.clockFont = e.target.value;
    applyClockAppearance();
    persistSettings();
  });
  if ($('sShowWidget')) $('sShowWidget').addEventListener('change', e => { S.showWidget = e.target.checked; applyClockAppearance(); persistSettings(); });
  if ($('btnOpenFontFolder')) $('btnOpenFontFolder').addEventListener('click', () => { FontManager.openFolder(); });

  /* Counter setup */
  if ($('btnStartCounter')) $('btnStartCounter').addEventListener('click', () => {
    const h = parseInt($('inpH').value) || 0;
    const m = parseInt($('inpM').value) || 0;
    const s = parseInt($('inpS').value) || 0;
    const dirInput = document.querySelector('input[name="dir"]:checked');
    const dir = dirInput ? dirInput.value : 'down';
    Counter.setup(h || 0, m || (h === 0 && s === 0 ? 5 : m), s || 0, dir);
    if ($('counterOverlay')) $('counterOverlay').classList.remove('open');
    Counter.start();
    setPlay(true);
  });

  /* Counter overlay: close on backdrop click */
  if ($('counterOverlay')) $('counterOverlay').addEventListener('click', e => {
    if (e.target === $('counterOverlay')) $('counterOverlay').classList.remove('open');
  });

  /* Tasks */
  if ($('btnAddTask')) $('btnAddTask').addEventListener('click', addTask);
  if ($('btnClearDone')) $('btnClearDone').addEventListener('click', clearDoneTasks);
  const handleTaskEnter = e => { if (e.key === 'Enter') addTask(); };
  if ($('taskInput')) $('taskInput').addEventListener('keydown', handleTaskEnter);
  if ($('taskStart')) $('taskStart').addEventListener('keydown', handleTaskEnter);
  if ($('taskEnd')) $('taskEnd').addEventListener('keydown', handleTaskEnter);

  if ($('btnTaskNow')) $('btnTaskNow').addEventListener('click', () => {
    const d = new Date();
    if ($('taskStart')) $('taskStart').value = pad(d.getHours()) + ':' + pad(d.getMinutes());
    if ($('taskEnd')) $('taskEnd').focus();
  });
  loadTasks();

  /* Keyboard */
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    switch (e.code) {
      case 'Space': e.preventDefault(); if (mode !== 'clock') playPause(); break;
      case 'KeyR': if (mode !== 'clock') resetTimer(); break;
      case 'KeyF': toggleFs(); break;
      case 'KeyI': toggleDynamicIsland(); break;
      case 'Digit1': switchMode('clock'); break;
      case 'Digit2': switchMode('pomodoro'); break;
      case 'Digit3': switchMode('counter'); break;
    }
  });

  /* Island Mode */
  if ($('btnIsland')) $('btnIsland').addEventListener('click', () => toggleDynamicIsland());
  if ($('btnExitIsland')) $('btnExitIsland').addEventListener('click', () => toggleDynamicIsland(false));
  if ($('islandClock')) $('islandClock').addEventListener('dblclick', () => toggleDynamicIsland(false));

  /* Titlebar Controls */

  if (ipcRenderer) {
    if ($('tb-min')) $('tb-min').addEventListener('click', () => ipcRenderer.send('window-minimize'));
    if ($('tb-max')) $('tb-max').addEventListener('click', () => ipcRenderer.send('window-maximize'));
    if ($('tb-close')) $('tb-close').addEventListener('click', () => ipcRenderer.send('window-close'));

    ipcRenderer.on('window-state-changed', (event, state) => {
      document.documentElement.classList.toggle('is-maximized', state === 'maximized');
      document.documentElement.classList.toggle('is-fullscreen', state === 'fullscreen');
      document.body.classList.toggle('is-fullscreen', state === 'fullscreen');
      if (state === 'maximized' || state === 'fullscreen') {
        if (isIsland) toggleDynamicIsland(false);
      }
    });
  }

  /* Boot */
  FontManager.init();
  loadSettings();
  MusicPlayer.init();
  switchMode('clock');

  /* Hide cursor at top edge */
  const cursorStyle = document.createElement('style');
  cursorStyle.id = 'hide-cursor-style';
  document.head.appendChild(cursorStyle);

  const checkCursorHide = (e) => {
    const isAtTopEdge = (e.clientY <= 10) || (e.target && e.target.id === 'top-edge-detector');
    const isOverControls = e.target && !!e.target.closest('.titlebar-controls');

    if (isAtTopEdge && !isOverControls) {
      cursorStyle.textContent = '* { cursor: none !important; }';
    } else {
      cursorStyle.textContent = '';
    }
  };

  document.addEventListener('mousemove', checkCursorHide);
  document.addEventListener('mouseover', checkCursorHide);
});
