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
  constructor({ id, file, map, respawnMin, spritePath, mapPath }) {
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
    this.blink     = false;
    this.spritePath = spritePath || null;
    this.mapPath    = mapPath || null;
  }
  sprite() { return this.spritePath || `./MVP_Giff/${this.file}`; }
  mapImg() { return this.mapPath || `./Maps/${this.map}.gif`; }
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

let timezone = localStorage.getItem('timezone') ||
               Intl.DateTimeFormat().resolvedOptions().timeZone;

let soundEnabled = localStorage.getItem('soundEnabled') !== '0';
const SOUND = typeof Audio !== 'undefined' ? new Audio('./Sound/sound.wav') : null;
const BLINK_KEY = 'blinkOff';
let blinkEnabled = localStorage.getItem(BLINK_KEY) !== '1';
const fmt   = s => `${s < 0 ? '-' : ''}${String(Math.floor(Math.abs(s) / 60)).padStart(2, '0')}:${String(Math.abs(s) % 60).padStart(2, '0')}`;

applyTheme();

// Renderer icin saglanan API mevcut degilse basit bir yedek tanimla
const API = window.api || {
  getMvps: async () => fetch('./mvpData.json').then(r => r.json()).catch(() => []),
  on: () => {},
  openOptions: () => {},
  readTimers: () => null,
  writeTimers: () => {}
};

function getOffsetStr(zone) {
  const str = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'short' }).format(new Date());
  const m = str.match(/GMT([+-]\d+)/);
  if (m) {
    const sign = m[1][0];
    const num  = m[1].slice(1).padStart(2, '0');
    return `GMT${sign}${num}:00`;
  }
  const d   = new Date(new Date().toLocaleString('en-US', { timeZone: zone }));
  const min = -d.getTimezoneOffset();
  const sgn  = min >= 0 ? '+' : '-';
  const val  = Math.abs(min);
  const h    = String(Math.floor(val / 60)).padStart(2, '0');
  const mnt  = String(val % 60).padStart(2, '0');
  return `GMT${sgn}${h}:${mnt}`;
}

function applyTheme(){
  const t = localStorage.getItem('theme') || 'dark';
  document.body.classList.toggle('light', t === 'light');
}
/* ———————————————————  ZAMAN / TZ   ——————————————————— */
function nowTz() { return new Date(new Date().toLocaleString('en-US', { timeZone: timezone })); }
function updateCurrent()  { if (timeDiv) timeDiv.textContent = nowTz().toLocaleTimeString(); }
setInterval(updateCurrent, 1000);
updateCurrent();

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

/* ———————————————————  PANEL YARDIMCILARI ——————————————————— */
function fillList(box, arr, positive) {
  box.innerHTML = '';
  const frag = document.createDocumentFragment();
  arr.forEach(m => frag.append(makeLi(m, positive)));
  box.append(frag);
}

function renderMid(m) {
  if (!m || m.remaining < 0) { UI.clearCurrent(); return; }
  UI.current          = m;
  UI.name.textContent = m.id;
  UI.gif.src          = m.sprite();
  UI.time.textContent = fmt(m.remaining);
  UI.map.src          = m.mapImg();
  UI.mapName.textContent = 'Map: ' + m.map;
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

  render() {
    const pos = MVP_LIST.filter(m => m.remaining >= 0)
                        .sort((a, b) => a.remaining - b.remaining);
    const neg = MVP_LIST.filter(m => m.remaining < 0)
                        .sort((a, b) => a.remaining - b.remaining);

    fillList(this.left,  pos,  true);
    fillList(this.right, neg, false);

    if (selected && selected.remaining >= 0) {
      renderMid(selected);
    } else if (pos[0]) {
      selected = pos[0];
      renderMid(pos[0]);
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
  const frag = document.createDocumentFragment();
  sorted.forEach(m => {
    const row = document.createElement('div');
    row.className = 'kill-row';
    row.innerHTML = `
      <img src="${m.sprite()}" alt="">
      <span class="kname">${m.id}</span>
      <span class="kcount">${m.kills}</span>`;
    frag.append(row);
  });
  killsBox.append(frag);
}

/* ———————————————————  MVP SATIRI OLUŞTUR ——————————————————— */
function makeLi(m, positive) {
  const li = document.createElement('li');

  /* Sınıfları sıfırdan kur: */
  li.className = 'mvp-row';
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

  li.append(img, info, mapT, timeBox, btn, btnKill);
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

function blinkRow(m){

  if(!blinkEnabled) return;

  const li=[...document.querySelectorAll('.mvp-row')]
            .find(el=>el.textContent.includes(m.id));
  if(li) li.classList.add('blink');
  if(UI.current===m){
    const box=document.querySelector('#mid-panel .mvp-stack');
    if(box) box.classList.add('blink');
  }
}

function stopBlink(m){
  const li=[...document.querySelectorAll('.mvp-row')]
            .find(el=>el.textContent.includes(m.id));
  if(li) li.classList.remove('blink');
  if(UI.current===m){
    const box=document.querySelector('#mid-panel .mvp-stack');
    if(box) box.classList.remove('blink');
  }
}


function applyBlink(){
  MVP_LIST.forEach(m=>{
    if(!blinkEnabled) m.blink=false;
    if(m.blink) blinkRow(m); else stopBlink(m);
  });
}


function markKilled(m) {
  TOTAL_KILL++;
  m.kills++;
  KILL_LOG.push({ id: m.id, time: Date.now() });
  m.tomb = false;
  m.tombTime = '';
  m.remaining = m.respawn;
  m.spawnUTC = Date.now() + m.remaining * 1000;
  m.running = true;
  flashRow(m);
  startTimers();
  updateSpawnDates();
  updateKillPanel();
  UI.render();
  saveTimers();
}

function toggleTomb(m) {
  const h = parseInt($('#tombHour').value || 0, 10);
  const mn = parseInt($('#tombMin').value || 0, 10);
  const s = parseInt($('#tombSec').value || 0, 10);
  const str = `${String(h).padStart(2,'0')}:${String(mn).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  if (m.tomb) {
    m.tomb = false;
    m.tombTime = '';
  } else {
    m.tomb = true;
    m.tombTime = str;
    m.remaining = mezarSaatineGoreKalan(str, timezone, m.respawn);
    m.spawnUTC = Date.now() + m.remaining * 1000;
    m.running = true;
  }
  startTimers();
  updateSpawnDates();
  UI.render();
  saveTimers();
}

/* ———————————————————  TIMER DÖNGÜSÜ  ——————————————————— */
function anyRunning() { return MVP_LIST.some(m => m.running); }
function step() {
  MVP_LIST.forEach(m => {
    if (m.running) {
      m.remaining--;

      if (m.remaining === 59) m.blink = true;
      if (m.remaining === 49 || m.remaining === -1) m.blink = false;

      if (m.remaining === 59) blinkRow(m);
      if (m.remaining === 49 || m.remaining === -1) stopBlink(m);

      if (m.remaining === 180 && SOUND && soundEnabled) SOUND.play();
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
  applyBlink();
  if (!anyRunning()) stopTimers();
}
function startTimers() { if (!timerId) timerId = setInterval(step, 1000); }
function stopTimers()  { if (timerId) { clearInterval(timerId); timerId = null; }}

/* ———————————————————  RESET FONKSİYONLARI  ——————————————————— */
function resetMvp(m) {
  m.remaining = m.respawn;
  m.spawnUTC  = Date.now() + m.remaining * 1000;
  m.running   = false;
  m.tomb      = false;
  m.tombTime  = '';
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
  const payload = {
    timers: data,
    killLog: KILL_LOG,
    totalKill: TOTAL_KILL,
    timezone
  };
  if (API.writeTimers) API.writeTimers(payload);
  localStorage.setItem('timers',    JSON.stringify(data));
  localStorage.setItem('killLog',   JSON.stringify(KILL_LOG));
  localStorage.setItem('totalKill', TOTAL_KILL);
  localStorage.setItem('timezone',  timezone);
}
function loadTimers() {
  let stored = API.readTimers ? API.readTimers() : null;
  if (stored) {
    timezone  = stored.timezone || timezone;
    KILL_LOG  = stored.killLog || [];
    TOTAL_KILL = stored.totalKill || 0;
    try {
      (stored.timers || []).forEach(d => {
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
  } else {
    const tz = localStorage.getItem('timezone');
    if (tz) timezone = tz;

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
  }

  if (tzDiv) tzDiv.textContent = `${timezone} (${getOffsetStr(timezone)})`;
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
    o.textContent = `${z} (${getOffsetStr(z)})`;
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
  if (tzDiv) tzDiv.textContent = `${timezone} (${getOffsetStr(timezone)})`;
  updateSpawnDates();
  UI.render();
  saveTimers();
}
if (tzSel) {
  populateTimeZones();
  tzSel.addEventListener('change', handleZoneChange);
}

/* ———————————————————  FETCH & INIT  ——————————————————— */
function buildList(list){
  MVP_LIST.length=0;
  list.forEach(d=>{
    const m=new MVP({
      id: d.name || d.id,
      file: d.file || d.img,
      map: d.map,
      respawnMin: d.respawn,
      spritePath: d.img || d.spritePath,
      mapPath: d.mapImg || d.mapPath
    });
    m.builtIn = d.builtIn;
    MVP_LIST.push(m);
  });
}

async function loadAll(){
  const base = await API.getMvps();
  buildList(base);
  MVP_LIST.forEach(m=>m.running=false);
  loadTimers();
  updateKillPanel();
}

API.on('mvp-update',list=>{
  buildList(list);
  updateSpawnDates();
  UI.render();
  updateKillPanel();
  saveTimers();
});

loadAll();


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

function autoTab(curr, next){
  if(curr&&next)curr.addEventListener('input',()=>{if(curr.value.length>=2)next.focus();});
}
autoTab($('#minInput'), $('#secInput'));
autoTab($('#tombHour'), $('#tombMin'));
autoTab($('#tombMin'), $('#tombSec'));


function autoBack(curr, prev){
  if(curr&&prev)curr.addEventListener('keydown',e=>{
    if(e.key==='Backspace'&&curr.value===''){prev.value=prev.value.slice(0,-1);prev.focus();e.preventDefault();}
  });
}
autoBack($('#secInput'), $('#minInput'));
autoBack($('#tombSec'), $('#tombMin'));
autoBack($('#tombMin'), $('#tombHour'));

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

(() => {
  const mid   = $('#mid');
  const kills = $('#killsWrapper');
  const bar   = document.querySelector('.v-resizer');
  if (!bar) return;
  function sync() {
    const wrap = document.getElementById('wrapper');
    if (!wrap || !mid || !kills) return;
    const kh = wrap.clientHeight - mid.getBoundingClientRect().height;
    document.documentElement.style.setProperty('--kills-h', kh + 'px');
  }
  sync();
  window.addEventListener('resize', sync);
  bar.addEventListener('mousedown', start);
  bar.addEventListener('touchstart', e => start(e.touches[0]));
  function start(e) {
    const startY  = e.clientY;
    const startM  = mid.getBoundingClientRect().height;
    const startK  = kills.getBoundingClientRect().height;
    const total   = startM + startK;
    function move(ev) {
      const dy   = ev.clientY - startY;
      let mH     = Math.max(100, startM + dy);
      let kH     = total - mH;
      if (kH < 100) { kH = 100; mH = total - 100; }
      document.documentElement.style.setProperty('--mid-h', mH + 'px');
      document.documentElement.style.setProperty('--kills-h', kH + 'px');
    }
    function stop() {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup',   stop);
      window.removeEventListener('touchmove', tmv);
      window.removeEventListener('touchend',  stop);
      sync();
      if (window.savePanelHeights) window.savePanelHeights();
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
const blinkBtn  = $('#blinkToggle');
const optionsBtn = $('#optionsBtn');
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

function setBlinkState(){
  if(!blinkBtn) return;
  blinkBtn.textContent = blinkEnabled ? 'Disable Blink' : 'Enable Blink';
}
if(blinkBtn){
  blinkBtn.addEventListener('click', ()=>{
    blinkEnabled=!blinkEnabled;
    localStorage.setItem(BLINK_KEY, blinkEnabled ? '0':'1');
    setBlinkState();

    applyBlink();

  });
  setBlinkState();
}

if(optionsBtn){
  optionsBtn.addEventListener('click', () => {
    if(API && API.openOptions){
      API.openOptions();
    }
  });
}

window.addEventListener('storage', e => {
  if(e.key === 'theme') applyTheme();
  if(e.key === 'soundEnabled') soundEnabled = e.newValue !== '0';
  if(e.key === 'timezone') {
    timezone = e.newValue || timezone;
    if (tzDiv) tzDiv.textContent = `${timezone} (${getOffsetStr(timezone)})`;
    updateSpawnDates();
    UI.render();
    saveTimers();
  }
});

export { MVP_LIST, UI, step, resetMvp, nowTz, markKilled, toggleTomb, MVP, saveTimers, loadTimers, updateSpawnDates, updateKillPanel };
