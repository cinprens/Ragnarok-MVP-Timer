/**********************************************************************
 *  RAGNAROK MVP TIMER   – UPDATED (eksiye düşenler sağ panele gider) *
 *********************************************************************/

if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
  Notification.requestPermission();
}

/* —————————————————  YARDIMCI FONKSİYONLAR  ————————————————— */
function ozelZamanaGoreKalan(minutes = 0, seconds = 0) {
  return minutes * 60 + seconds;
}
function mezarSaatineGoreKalan(tombStr, tz = 'Asia/Kuching', respawnSec = 3600) {
  const [h, m, s] = tombStr.split(':').map(Number);
  const now  = new Date(new Date().toLocaleString('en-US', { timeZone: tz }));
  const tomb = new Date(now);
  tomb.setHours(h, m, s, 0);
  if (tomb > now) tomb.setDate(tomb.getDate() - 1);
  const elapsed   = (now - tomb) / 1000;
  const remaining = respawnSec - (elapsed % respawnSec);
  return Math.floor(remaining);
}
if (typeof window !== 'undefined') {
  window.ozelZamanaGoreKalan   = ozelZamanaGoreKalan;
  window.mezarSaatineGoreKalan = mezarSaatineGoreKalan;
}

/* ———————————————————  VERİ YAPISI  ——————————————————— */
class MVP {
  constructor({ id, file, map, respawnMin }) {
    this.id       = id;
    this.file     = file;
    this.map      = map;
    this.respawn  = respawnMin * 60;
    this.remaining = this.respawn;
    this.tomb      = false;
    this.tombTime  = '';
    this.spawnUTC  = Date.now() + this.remaining * 1000;
    this.running   = false;
    this.kills     = 0;
  }
  sprite() { return `./MVP_Giff/${this.file}`; }
  mapImg() { return `./Maps/${this.map}.gif`; }
}

/* ———————————————————  GLOBAL DEĞİŞKENLER  ——————————————————— */
let MVP_LIST    = [];
let KILL_LOG    = [];
let TOTAL_KILL  = 0;
let selected    = null;
let timerId     = null;
let autoReturnId = null;

const $        = s => document.querySelector(s);
const tzSel    = $('#tzSelect');
const tzDiv    = $('#currentTZ');
const timeDiv  = $('#currentTime');
const offsetDiv = $('#tzOffset');

let timezone = localStorage.getItem('timezone') ||
               Intl.DateTimeFormat().resolvedOptions().timeZone;

const SOUND = typeof Audio !== 'undefined' ? new Audio('./Sound/sound.wav') : null;
const fmt   = s => `${s < 0 ? '-' : ''}${String(Math.floor(Math.abs(s) / 60)).padStart(2, '0')}:${String(Math.abs(s) % 60).padStart(2, '0')}`;

/* ———————————————————  ZAMAN / TZ   ——————————————————— */
function nowTz() { return new Date(new Date().toLocaleString('en-US', { timeZone: timezone })); }
function updateCurrent()  { if (timeDiv) timeDiv.textContent = nowTz().toLocaleTimeString(); }
function updateOffset() {
  if (!offsetDiv) return;
  const min  = -nowTz().getTimezoneOffset();
  const sign = min >= 0 ? '+' : '-';
  const val  = Math.abs(min);
  const h    = String(Math.floor(val / 60)).padStart(2, '0');
  const m    = String(val % 60).padStart(2, '0');
  offsetDiv.textContent = `UTC ${sign}${h}:${m}`;
}
setInterval(updateCurrent, 1000);
updateCurrent();
updateOffset();

/* Spawn tarihlerini canlı tut */
function updateSpawnDates() {
  MVP_LIST.forEach(m => {
    let next = m.spawnUTC || Date.now() + m.remaining * 1000;
    if (m.remaining < 0) {
      const cycles = Math.floor(-m.remaining / m.respawn) + 1;
      next += cycles * m.respawn * 1000;
    }
    m.spawnDate = new Date(new Date(next).toLocaleString('en-US', { timeZone: timezone }));
  });
}

/* ———————————————————  UI NESNESİ  ——————————————————— */
const UI = {
  gif     : $('#mvpGif'),
  name    : $('#mvpName'),
  time    : $('#mvpTime'),
  map     : $('#mvpMap'),
  mapName : $('#mapName'),
  left    : $('#positiveList'),
  right   : $('#right #negativeList'),

  /* === ANA RENDER === */
  render() {
    const pos = MVP_LIST.filter(m => m.remaining >= 0)
                        .sort((a, b) => a.remaining - b.remaining);
    const neg = MVP_LIST.filter(m => m.remaining < 0)
                        .sort((a, b) => a.remaining - b.remaining);

    this.left.innerHTML  = '';
    this.right.innerHTML = '';
    pos.forEach(m => this.left .append(makeLi(m, true )));
    neg.forEach(m => this.right.append(makeLi(m, false)));

    if (selected && selected.remaining >= 0) {
      this.setCurrent(selected);
    } else if (pos[0]) {
      selected = pos[0];
      this.setCurrent(pos[0]);
    } else {
      selected = null;
      this.clearCurrent();
    }
  },

  setCurrent(m) {
    /* Negatif kalan bir MVP aktif seçiliyse mid paneli temizle */
    if (m.remaining < 0) { this.clearCurrent(); return; }

    this.current          = m;
    this.name.textContent = m.id;
    this.gif .src         = m.sprite();
    this.time.textContent = fmt(m.remaining);
    this.map .src         = m.mapImg();
    this.mapName.textContent = 'Map: ' + m.map;
  },

  clearCurrent() {
    this.current       = null;
    this.name.textContent = '';
    this.gif .src         = '';
    this.time.textContent = '';
    this.map .src         = '';
    this.mapName.textContent = '';
  }
};

/* ———————————————————  LISTE / KILL PANEL  ——————————————————— */
const killsBox   = $('#killsPanel');
const killsTitle = $('#killsTitle');
function updateKillPanel() {
  if (!killsBox) return;
  killsTitle.textContent = `Ben\u202fKestim\u202f(${TOTAL_KILL})`;
  const sorted = MVP_LIST.filter(x => x.kills > 0)
                         .sort((a, b) => b.kills - a.kills);
  killsBox.innerHTML = '';
  sorted.forEach(m => {
    const row = document.createElement('div');
    row.className = 'kill-row';
    row.innerHTML = `
      <img src="${m.sprite()}" alt="">
      <span class="kname">${m.id}</span>
      <span class="kcount">${m.kills}</span>`;
    killsBox.append(row);
  });
}

/* ———————————————————  MVP SATIRI OLUŞTUR ——————————————————— */
function makeLi(m, positive) {
  const li = document.createElement('li');

  /* Sınıfları sıfırdan kur: */
  li.className = 'mvp-row' + (m.tomb ? ' tomb-active' : '');
  li.classList.add(m.remaining >= 0 ? 'positive' : 'negative');
  if (selected === m) li.classList.add('selected');

  /* Seçim */
  li.onclick = () => selectMvp(m);

  /* İçerik */
  const img   = new Image(); img.className = 'sprite'; img.src = m.sprite();
  const info  = document.createElement('div');
  info.className = 'mvp-info';
  info.innerHTML = `<strong>${m.id}</strong><span>${m.map}</span>`;
  const mapT  = new Image(); mapT.className = 'mvp-mapThumb'; mapT.src = m.mapImg();

  /* Sayaç + sonraki spawn bilgisi */
  const timeBox = document.createElement('div'); timeBox.className = 'mvp-timer';
  const remain  = document.createElement('div'); remain.textContent = fmt(m.remaining);
  timeBox.append(remain);

  if (m.remaining < 0) {
    const next   = m.spawnDate;
    const sd     = document.createElement('div');
    sd.className = 'spawn-date';
    sd.textContent = next.toLocaleString();
    timeBox.append(sd);
  }

  /* Tomb-Time */
  const tombTime   = document.createElement('div');
  tombTime.className = 'tomb-time';
  tombTime.textContent = m.tombTime;

  /* Tomb Icon */
  const tombI  = new Image();
  tombI.className = 'tomb';
  tombI.src = './MVP_Giff/MOB_TOMB.gif';

  /* Start/Stop or Reset  */
  const btn = document.createElement('button');
  if (m.remaining < 0) {
    btn.textContent = 'Reset';
    btn.onclick = e => { e.stopPropagation(); resetMvp(m); };
  } else {
    btn.textContent = m.running ? 'Stop' : 'Start';
    btn.onclick = e => {
      e.stopPropagation();
      if (m.running) {
        m.remaining = Math.floor((m.spawnUTC - Date.now()) / 1000);
        m.running   = false;
        if (!anyRunning()) stopTimers();
      } else {
        m.spawnUTC = Date.now() + m.remaining * 1000;
        m.running  = true;
        startTimers();
      }
      UI.render();
      saveTimers();
    };
  }

  /* I KILL Butonu */
  const btnKill = document.createElement('button');
  btnKill.textContent = 'I KILL';
  btnKill.onclick = e => { e.stopPropagation(); markKilled(m); };

  li.append(img, info, mapT, timeBox, tombTime, tombI, btn, btnKill);
  return li;
}

/* ———————————————————  MVP SEÇ / FLASH vs.  ——————————————————— */
function selectMvp(m) {
  const old = document.querySelector('.mvp-row.selected');
  if (old) old.classList.remove('selected');
  selected = m;
  clearTimeout(autoReturnId);
  autoReturnId = setTimeout(() => { selected = null; UI.render(); }, 600000);
  UI.render();
}
function flashRow(m) {
  setTimeout(() => {
    const li = [...document.querySelectorAll('.mvp-row')]
                .find(el => el.textContent.includes(m.id));
    if (li) {
      li.classList.add('flash');
      setTimeout(() => li.classList.remove('flash'), 300);
    }
  }, 20);
}

/* ———————————————————  TIMER DÖNGÜSÜ  ——————————————————— */
function anyRunning() { return MVP_LIST.some(m => m.running); }
function step() {
  MVP_LIST.forEach(m => {
    if (m.running) {
      m.remaining--;
      if (m.remaining === 180 && SOUND) SOUND.play();
      if (m.remaining === -1 &&
          typeof Notification !== 'undefined' &&
          Notification.permission === 'granted') {
        new Notification(m.id, { body: `${m.map} haritasında` });
      }
    }
  });

  updateSpawnDates();
  if (UI.current) UI.time.textContent = fmt(UI.current.remaining);
  UI.render();
  if (!anyRunning()) stopTimers();
}
function startTimers() { if (!timerId) timerId = setInterval(step, 1000); }
function stopTimers()  { if (timerId) { clearInterval(timerId); timerId = null; }}

/* ———————————————————  RESET FONKSİYONLARI  ——————————————————— */
function resetMvp(m) {
  m.remaining = m.respawn;
  m.spawnUTC  = Date.now() + m.remaining * 1000;
  m.running   = false;
  updateSpawnDates();
  UI.render();
  saveTimers();
}
function resetAll() {
  MVP_LIST.forEach(resetMvp);
  updateSpawnDates();
  UI.render();
  saveTimers();
}

/* ———————————————————  VERİ YÜKLE / KAYDET  ——————————————————— */
function saveTimers() {
  const data = MVP_LIST.map(m => ({
    id: m.id,
    remaining: m.remaining,
    running: m.running,
    spawnUTC: m.spawnUTC,
    kills: m.kills
  }));
  localStorage.setItem('timers',    JSON.stringify(data));
  localStorage.setItem('killLog',   JSON.stringify(KILL_LOG));
  localStorage.setItem('totalKill', TOTAL_KILL);
  localStorage.setItem('timezone',  timezone);
}
function loadTimers() {
  const tz = localStorage.getItem('timezone');
  if (tz) timezone = tz;

  if (tzDiv) tzDiv.textContent = timezone;
  updateOffset();

  const kl = localStorage.getItem('killLog');
  const tk = localStorage.getItem('totalKill');
  if (kl) { KILL_LOG   = JSON.parse(kl); TOTAL_KILL = parseInt(tk || 0, 10); }

  const str = localStorage.getItem('timers');
  if (str) {
    try {
      JSON.parse(str).forEach(d => {
        const m = MVP_LIST.find(x => x.id === d.id);
        if (!m) return;
        m.kills   = d.kills || 0;
        m.running = !!d.running;
        m.spawnUTC = d.spawnUTC || Date.now() + m.remaining * 1000;

        if (m.running) {
          m.remaining = Math.floor((m.spawnUTC - Date.now()) / 1000);
        } else if (typeof d.remaining === 'number') {
          m.remaining = d.remaining;
          m.spawnUTC  = Date.now() + m.remaining * 1000;
        }
      });
      if (anyRunning()) startTimers();
    } catch (_) {}
  }

  updateSpawnDates();
  UI.render();
  updateKillPanel();
}

/* ———————————————————  ZAMAN DİLİMİ SEÇİCİ  ——————————————————— */
function populateTimeZones() {
  const zones = Intl.supportedValuesOf('timeZone');
  zones.forEach(z => {
    const o      = document.createElement('option');
    o.value      = z;
    o.textContent = z;
    if (z === timezone) o.selected = true;
    tzSel.append(o);
  });
  const opt = document.createElement('option');
  opt.value = 'custom';
  opt.textContent = 'Özel...';
  tzSel.append(opt);
}
function handleZoneChange() {
  if (tzSel.value === 'custom') {
    const z = prompt('Zaman Dilimi:', timezone);
    if (z) timezone = z;
  } else {
    timezone = tzSel.value;
  }
  if (tzDiv) tzDiv.textContent = timezone;
  updateOffset();
  updateSpawnDates();
  UI.render();
  saveTimers();
}
if (tzSel) {
  populateTimeZones();
  tzSel.addEventListener('change', handleZoneChange);
}

/* ———————————————————  FETCH & INIT  ——————————————————— */
fetch('mvpData.json')
  .then(r => r.json())
  .then(arr => {
    MVP_LIST = arr.map(d => new MVP({
      id        : d.name,
      file      : d.img.replace('MVP_Giff/', ''),
      map       : d.map,
      respawnMin: d.respawn / 60
    }));
    MVP_LIST.forEach(m => m.running = false);
    loadTimers();
    updateKillPanel();
  });

/* ———————————————————  BUTON BAĞLANTILARI  ——————————————————— */
$('#setBtn'  ).onclick = () => {
  if (!selected) { alert('Önce bir MVP seç'); return; }
  const dk = parseInt($('#minInput').value || 0, 10);
  const sn = parseInt($('#secInput').value || 0, 10);
  if (isNaN(dk) || isNaN(sn) || sn < 0 || sn > 59) { alert('Geçersiz süre'); return; }
  selected.remaining = ozelZamanaGoreKalan(dk, sn);
  selected.spawnUTC  = Date.now() + selected.remaining * 1000;
  selected.tomb      = false;
  selected.running   = true;
  startTimers();
  updateSpawnDates();
  UI.render();
  saveTimers();
};
$('#startBtn').onclick = startTimers;
$('#stopBtn' ).onclick = stopTimers;
$('#tombBtn' ).onclick = () => {
  if (!selected) { alert('Önce bir MVP seç'); return; }
  toggleTomb(selected);
};

/* ———————————————————  SCROLL BUTONLARI  ——————————————————— */
document.querySelectorAll('.scroll-up').forEach(b => {
  b.addEventListener('click', () => {
    const ul = document.getElementById(b.dataset.target);
    ul.scrollTop -= 100;
  });
});
document.querySelectorAll('.scroll-down').forEach(b => {
  b.addEventListener('click', () => {
    const ul = document.getElementById(b.dataset.target);
    ul.scrollTop += 100;
  });
});
document.querySelectorAll('#left, #right').forEach(panel => {
  panel.addEventListener('wheel', e => {
    panel.scrollBy({ top: e.deltaY, behavior: 'smooth' });
  });
});

/* ———————————————————  PANELLERDE RESIZER  ——————————————————— */
(() => {
  const left  = $('#left');
  const right = $('#right');
  document.querySelectorAll('.resizer').forEach(bar => {
    bar.addEventListener('mousedown', start);
    bar.addEventListener('touchstart', e => start(e.touches[0]));
  });
  function start(e) {
    const side       = e.target.dataset.side;      // 'left' | 'right'
    const startX     = e.clientX;
    const startLeft  = left .getBoundingClientRect().width;
    const startRight = right.getBoundingClientRect().width;

    function move(ev) {
      const dx = ev.clientX - startX;
      if (side === 'left') {
        const newW = Math.max(180, startLeft + dx);
        left.style.width = newW + 'px';
        document.documentElement.style.setProperty('--left-w', newW + 'px');
      } else {
        const newW = Math.max(180, startRight - dx);
        right.style.width = newW + 'px';
        document.documentElement.style.setProperty('--right-w', newW + 'px');
      }
    }
    function stop() {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup',   stop);
      window.removeEventListener('touchmove', tmv);
      window.removeEventListener('touchend',  stop);
      if (window.savePanelWidths) window.savePanelWidths();
    }
    const tmv = ev => move(ev.touches[0]);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup',   stop);
    window.addEventListener('touchmove', tmv);
    window.addEventListener('touchend',  stop);
  }
})();

/* ———————————————————  BANNER GİZLE / GÖSTER  ——————————————————— */
const bannerBtn = $('#bannerToggle');
function setBannerState() {
  const hidden = localStorage.getItem('bannerHidden') === '1';
  document.body.classList.toggle('banners-hidden', hidden);
  if (bannerBtn) bannerBtn.textContent = hidden ? 'Show Banners' : 'Hide Banners';
}
if (bannerBtn) {
  bannerBtn.addEventListener('click', () => {
    const now = document.body.classList.toggle('banners-hidden');
    localStorage.setItem('bannerHidden', now ? '1' : '0');
    bannerBtn.textContent = now ? 'Show Banners' : 'Hide Banners';
  });
  setBannerState();
}
