/**********************************************************************
 *  RAGNAROK MVP TIMER   – UPDATED (eksiye düşenler sağ panele gider) *
 *********************************************************************/

if (typeof Notification !== "undefined" && Notification.permission === "default") {
  Notification.requestPermission();
}

/* —————————————————  YARDIMCI FONKSİYONLAR  ————————————————— */
function ozelZamanaGoreKalan(minutes = 0, seconds = 0) {
  return minutes * 60 + seconds;
}
function mezarSaatineGoreKalan(tombStr, tz = "Asia/Kuching", respawnSec = 3600) {
  const [h, m, s] = tombStr.split(":").map(Number);
  const now  = new Date(new Date().toLocaleString("en-US", { timeZone: tz }));
  const tomb = new Date(now);
  tomb.setHours(h, m, s, 0);
  if (tomb > now) tomb.setDate(tomb.getDate() - 1);
  const elapsed   = (now - tomb) / 1000;
  const remaining = respawnSec - (elapsed % respawnSec);
  return Math.floor(remaining);
}
if (typeof window !== "undefined") {
  window.ozelZamanaGoreKalan   = ozelZamanaGoreKalan;
  window.mezarSaatineGoreKalan = mezarSaatineGoreKalan;
}

/* ———————————————————  VERİ YAPISI  ——————————————————— */
class MVP {
  constructor({ id, uid, file, map, respawnMin, spritePath, mapPath }) {
    this.id       = id;      // display name
    this.uid      = uid;     // unique identifier
    this.file     = file;
    this.map      = map;
    this.respawn  = respawnMin * 60;
    this.remaining = this.respawn;
    this.tomb      = false;
    this.tombTime  = "";
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
let rafId       = null;  // requestAnimationFrame döngü ID'si
let lastFrame   = 0;     // Son frame zamanı
let accum       = 0;     // Biriken süre (saniye)
let autoReturnId = null;

const $        = s => document.querySelector(s);
const tzSel    = $("#tzSelect");
const tzDiv    = () => document.getElementById("currentTZ");
const timeDiv  = $("#currentTime");

let timezone = localStorage.getItem("timezone") ||
               Intl.DateTimeFormat().resolvedOptions().timeZone;

let soundEnabled = localStorage.getItem("soundEnabled") !== "0";
const SOUND = typeof Audio !== "undefined" ? new Audio("./Sound/sound.wav") : null;
const BLINK_KEY = "blinkOff";
let blinkEnabled = localStorage.getItem(BLINK_KEY) !== "1";
const fmt   = s => `${s < 0 ? "-" : ""}${String(Math.floor(Math.abs(s) / 60)).padStart(2, "0")}:${String(Math.abs(s) % 60).padStart(2, "0")}`;

function updateTimeColor(rem) {
  if (!UI.time) return;
  UI.time.classList.toggle("negative", rem < 0);
  UI.time.classList.toggle("positive", rem >= 0);
}

applyTheme();

// Renderer icin saglanan API mevcut degilse basit bir yedek tanimla
const API = window.api || {
  getMvps: async () => fetch("./mvpData.json").then(r => r.json()).catch(() => []),
  on: () => {},
  openOptions: () => {},
  readTimers: () => null,
  writeTimers: () => {}
};

if (!window.api) {
  console.warn("Preload API missing: options menu will not open");
}

function getOffsetStr(zone) {
  const str = new Intl.DateTimeFormat("en-US", { timeZone: zone, timeZoneName: "short" }).format(new Date());
  const m = str.match(/GMT([+-]\d+)/);
  if (m) {
    const sign = m[1][0];
    const num  = m[1].slice(1).padStart(2, "0");
    return `GMT${sign}${num}:00`;
  }
  const d   = new Date(new Date().toLocaleString("en-US", { timeZone: zone }));
  const min = -d.getTimezoneOffset();
  const sgn  = min >= 0 ? "+" : "-";
  const val  = Math.abs(min);
  const h    = String(Math.floor(val / 60)).padStart(2, "0");
  const mnt  = String(val % 60).padStart(2, "0");
  return `GMT${sgn}${h}:${mnt}`;
}

function applyTheme(){
  const t = localStorage.getItem("theme") || "dark";
  document.body.classList.toggle("light", t === "light");
}

/* ———————————————————  ZAMAN / TZ   ——————————————————— */
function nowTz() { return new Date(new Date().toLocaleString("en-US", { timeZone: timezone })); }
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
    m.spawnDate = new Date(new Date(next).toLocaleString("en-US", { timeZone: timezone }));
  });
}

/* ———————————————————  PANEL YARDIMCILARI ——————————————————— */
function fillList(box, arr, positive) {
  if(!box) return;
  box.innerHTML = "";
  const frag = document.createDocumentFragment();
  arr.forEach(m => frag.append(makeLi(m, positive)));
  box.append(frag);
}

function renderMid(m) {
  // Seçili MVP'yi orta panelde gösterir. Süre eksiye düşmüş olsa bile
  // bilgiler ekranda yer almaya devam eder.
  if (!m) { UI.clearCurrent(); return; }
  UI.current          = m;
  if(UI.name) UI.name.textContent = m.id;
  if(UI.gif)  UI.gif.src = m.sprite();
  if(UI.time) UI.time.textContent = fmt(m.remaining);
  updateTimeColor(m.remaining);
  if(UI.map) UI.map.src = m.mapImg();
  if(UI.mapName) UI.mapName.textContent = "Map: " + m.map;
  if(UI.stack) UI.stack.classList.add("active");
  if(UI.killBtn){
    UI.killBtn.onclick = () => markKilled(m);
    UI.killBtn.classList.add("show");
    UI.killBtn.classList.remove("hidden");
  }
}

/* ———————————————————  UI NESNESİ  ——————————————————— */
const UI = {
  gif     : $("#mvpGif"),
  name    : $("#mvpName"),
  time    : $("#mvpTime"),
  map     : $("#mvpMap"),
  mapName : $("#mapName"),
  stack   : document.querySelector("#mid-panel .mvp-stack"),
  left    : $("#positiveList"),
  right   : $("#right #negativeList"),
  actions : $("#midActions"),
  killBtn : $("#killBtn"),
  start   : $("#startSel"),
  stop    : $("#stopSel"),
  reset   : $("#resetSel"),

  render() {
    const pos = MVP_LIST.filter(m => m.remaining >= 0)
                        .sort((a, b) => a.remaining - b.remaining);
    const neg = MVP_LIST.filter(m => m.remaining < 0)
                        .sort((a, b) => a.remaining - b.remaining);

    fillList(this.left,  pos,  true);
    fillList(this.right, neg, false);

    if (selected) {
      // Önceden seçilmiş bir MVP varsa, süresi dolmuş olsa bile göster
      renderMid(selected);
      if(this.actions) this.actions.classList.remove("hidden");
    } else if (pos[0]) {
      selected = pos[0];
      renderMid(pos[0]);
      if(this.actions) this.actions.classList.remove("hidden");
    } else {
      selected = null;
      this.clearCurrent();
      if(this.actions) this.actions.classList.add("hidden");
    }
  },

  setCurrent(m) {
    /* Negatif kalan bir MVP aktif seçiliyse mid paneli temizle */
    if (m.remaining < 0) { this.clearCurrent(); return; }

    this.current          = m;
    if(this.name) this.name.textContent = m.id;
  if(this.gif)  this.gif.src = m.sprite();
  if(this.time) this.time.textContent = fmt(m.remaining);
  updateTimeColor(m.remaining);
  if(this.map) this.map.src = m.mapImg();
  if(this.mapName) this.mapName.textContent = "Map: " + m.map;
  if(this.killBtn){
    this.killBtn.onclick = () => markKilled(m);
    this.killBtn.classList.add("show");
    this.killBtn.classList.remove("hidden");
  }
  if(this.actions) this.actions.classList.remove("hidden");
  },

  clearCurrent() {
    this.current       = null;
    if(this.name) this.name.textContent = "";
    if(this.gif)  this.gif.src = "";
    if(this.time) this.time.textContent = "";
    updateTimeColor(0);
    if(this.map) this.map.src = "";
    if(this.mapName) this.mapName.textContent = "";
    if(this.stack) this.stack.classList.remove("active");
    if(this.killBtn){
      this.killBtn.classList.remove("show");
      this.killBtn.classList.add("hidden");
      this.killBtn.onclick = null;
    }
    if(this.actions) this.actions.classList.add("hidden");
  }
};

/* ———————————————————  LISTE / KILL PANEL  ——————————————————— */
const killsBox   = $("#killsPanel");
const killsTitle = $("#killsTitle");
function updateKillPanel() {
  if (!killsBox) return;
  killsTitle.textContent = `MVP Rank (${TOTAL_KILL})`;
  const sorted = MVP_LIST.filter(x => x.kills > 0)
    .sort((a, b) => {
      if (b.kills !== a.kills) return b.kills - a.kills;
      return Math.random() < 0.5 ? -1 : 1;
    });
  killsBox.innerHTML = "";

  if (sorted.length > 0) {
    const podium = document.createElement("div");
    podium.className = "podium";
    const top3 = sorted.slice(0, 3);
    ["first", "second", "third"].forEach((cls, idx) => {
      const m = top3[idx];
      if (!m) return;
      const slot = document.createElement("div");
      slot.className = `podium-slot ${cls}`;
      const medal = document.createElement("div");
      medal.className = "medal";
      medal.textContent = idx + 1;
      const img = new Image();
      img.src = m.sprite();
      const name = document.createElement("div");
      name.className = "pname";
      name.textContent = m.id;
      const cnt = document.createElement("div");
      cnt.className = "pcount";
      cnt.textContent = m.kills;
      slot.append(medal, img, name, cnt);
      podium.append(slot);
    });
    killsBox.append(podium);
  }

  sorted.slice(3).forEach((m, idx) => {
    const row  = document.createElement("div");
    const rank = idx + 4; // continuing after podium
    row.className = "kill-row";
    row.innerHTML = `
      <span class="kindex">${rank}</span>
      <img src="${m.sprite()}" alt="">
      <span class="kname">${m.id}</span>
      <span class="kcount">${m.kills}</span>`;
    killsBox.append(row);
  });
}

/* ———————————————————  MVP SATIRI OLUŞTUR ——————————————————— */
function makeLi(m, positive) {
  const li = document.createElement("li");

  /* Sınıfları sıfırdan kur: */
  li.className = "mvp-row";
  li.classList.add(m.remaining >= 0 ? "positive" : "negative");
  if (selected === m) li.classList.add("selected");

  /* Seçim */
  li.onclick = () => selectMvp(m);

  /* İçerik */
  const img   = new Image(); img.className = "sprite"; img.src = m.sprite();
  const info  = document.createElement("div");
  info.className = "mvp-info";
  info.innerHTML = `<strong>${m.id}</strong><span>${m.map}</span>`;
  const mapT  = new Image(); mapT.className = "mvp-mapThumb"; mapT.src = m.mapImg();

  /* Sayaç + sonraki spawn bilgisi */
  const timeBox = document.createElement("div"); timeBox.className = "mvp-timer";
  const remain  = document.createElement("div"); remain.textContent = fmt(m.remaining);

  timeBox.append(remain);

  if (m.remaining < 0) {
    const next = m.spawnDate || new Date();
    const sd = document.createElement("div");
    sd.className = "spawn-date";
    sd.textContent = next.toLocaleString();
    timeBox.append(sd);
  }

  li.append(img, info, mapT, timeBox);
  return li;
}

/* ———————————————————  MVP SEÇ / FLASH vs.  ——————————————————— */
function selectMvp(m) {
  const old = document.querySelector(".mvp-row.selected");
  if (old) old.classList.remove("selected");
  selected = m;
  clearTimeout(autoReturnId);
  autoReturnId = setTimeout(() => { selected = null; UI.render(); }, 600000);
  UI.render();
  if(UI.actions) UI.actions.classList.remove("hidden");
}
function flashRow(m) {
  setTimeout(() => {
    const li = [...document.querySelectorAll(".mvp-row")]
                .find(el => el.textContent.includes(m.id));
    if (li) {
      li.classList.add("flash");
      setTimeout(() => li.classList.remove("flash"), 300);
    }
  }, 20);
}

function blinkRow(m){

  if(!blinkEnabled) return;

  const li=[...document.querySelectorAll(".mvp-row")]
            .find(el=>el.textContent.includes(m.id));
  if(li) li.classList.add("blink");
  if(UI.current===m){
    const box=document.querySelector("#mid-panel .mvp-stack");
    if(box) box.classList.add("blink");
  }
}

function stopBlink(m){
  const li=[...document.querySelectorAll(".mvp-row")]
            .find(el=>el.textContent.includes(m.id));
  if(li) li.classList.remove("blink");
  if(UI.current===m){
    const box=document.querySelector("#mid-panel .mvp-stack");
    if(box) box.classList.remove("blink");
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
  m.tombTime = "";
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

function startSelected(){
  if(!selected) return;
  if(selected.running) return;
  selected.spawnUTC = Date.now() + selected.remaining * 1000;
  selected.running = true;
  startTimers();
  UI.render();
  saveTimers();
}

function stopSelected(){
  if(!selected) return;
  if(!selected.running) return;
  selected.remaining = Math.floor((selected.spawnUTC - Date.now()) / 1000);
  selected.running = false;
  if(!anyRunning()) stopTimers();
  UI.render();
  saveTimers();
}

function resetSelected(){
  if(!selected) return;
  resetMvp(selected);
}

function toggleTomb(m) {
  const h = parseInt($("#tombHour").value || 0, 10);
  const mn = parseInt($("#tombMin").value || 0, 10);
  const s = parseInt($("#tombSec").value || 0, 10);
  const str = `${String(h).padStart(2,"0")}:${String(mn).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  if (m.tomb) {
    m.tomb = false;
    m.tombTime = "";
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
          typeof Notification !== "undefined" &&
          Notification.permission === "granted") {
        new Notification(m.id, { body: `on map ${m.map}` });
      }
    }
  });

  updateSpawnDates();
  if (UI.current) {
    UI.time.textContent = fmt(UI.current.remaining);
    updateTimeColor(UI.current.remaining);
  }
  UI.render();
  applyBlink();
  if (!anyRunning()) stopTimers();
}
function loop(now){
  if(!lastFrame) lastFrame = now;
  const delta = (now - lastFrame) / 1000;
  lastFrame = now;
  accum += delta;
  while(accum >= 1){
    step();
    accum -= 1;
  }
  if(anyRunning()){
    rafId = requestAnimationFrame(loop);
  }else{
    stopTimers();
  }
}
function startTimers(){
  if(!rafId){
    lastFrame = 0;
    accum = 0;
    rafId = requestAnimationFrame(loop);
  }
}
function stopTimers(){
  if(rafId){
    cancelAnimationFrame(rafId);
    rafId = null;
    lastFrame = 0;
    accum = 0;
  }
}

function refreshRemaining(){
  MVP_LIST.forEach(m=>{
    m.remaining = Math.floor((m.spawnUTC - Date.now()) / 1000);
  });
  updateSpawnDates();
}

/* ———————————————————  RESET FONKSİYONLARI  ——————————————————— */
function resetMvp(m) {
  m.remaining = m.respawn;
  m.spawnUTC  = Date.now() + m.remaining * 1000;
  m.running   = false;
  m.tomb      = false;
  m.tombTime  = "";
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

function resetRank(){
  KILL_LOG.length = 0;
  TOTAL_KILL = 0;
  MVP_LIST.forEach(m => { m.kills = 0; });
  updateKillPanel();
  saveTimers();
}

/* ———————————————————  VERİ YÜKLE / KAYDET  ——————————————————— */
function saveTimers() {
  const data = MVP_LIST.map(m => ({
    id: m.uid,
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
  localStorage.setItem("timers",    JSON.stringify(data));
  localStorage.setItem("killLog",   JSON.stringify(KILL_LOG));
  localStorage.setItem("totalKill", TOTAL_KILL);
  localStorage.setItem("timezone",  timezone);
}
function loadTimers() {
  let stored = API.readTimers ? API.readTimers() : null;
  if (stored) {
    timezone  = stored.timezone || timezone;
    KILL_LOG  = stored.killLog || [];
    TOTAL_KILL = stored.totalKill || 0;
    try {
      (stored.timers || []).forEach(d => {
        const m = MVP_LIST.find(x => x.uid === d.id);
        if (!m) return;
        m.kills   = d.kills || 0;
        m.running = !!d.running;
        m.spawnUTC = d.spawnUTC || Date.now() + m.remaining * 1000;

        if (m.running) {
          m.remaining = Math.floor((m.spawnUTC - Date.now()) / 1000);
        } else if (typeof d.remaining === "number") {
          m.remaining = d.remaining;
          m.spawnUTC  = Date.now() + m.remaining * 1000;
        }
      });
      if (anyRunning()) startTimers();
    } catch (_) {}
  } else {
    const tz = localStorage.getItem("timezone");
    if (tz) timezone = tz;

    const kl = localStorage.getItem("killLog");
    const tk = localStorage.getItem("totalKill");
    if (kl) { KILL_LOG   = JSON.parse(kl); TOTAL_KILL = parseInt(tk || 0, 10); }

    const str = localStorage.getItem("timers");
    if (str) {
      try {
        JSON.parse(str).forEach(d => {
          const m = MVP_LIST.find(x => x.uid === d.id);
          if (!m) return;
          m.kills   = d.kills || 0;
          m.running = !!d.running;
          m.spawnUTC = d.spawnUTC || Date.now() + m.remaining * 1000;

          if (m.running) {
            m.remaining = Math.floor((m.spawnUTC - Date.now()) / 1000);
          } else if (typeof d.remaining === "number") {
            m.remaining = d.remaining;
            m.spawnUTC  = Date.now() + m.remaining * 1000;
          }
        });
        if (anyRunning()) startTimers();
      } catch (_) {}
    }
  }

  const div = tzDiv();
  if (div) div.textContent = timezone;
  updateSpawnDates();
  UI.render();
  updateKillPanel();
}

/* ———————————————————  ZAMAN DİLİMİ SEÇİCİ  ——————————————————— */
function populateTimeZones() {
  const zones = typeof Intl.supportedValuesOf === "function" ?
    Intl.supportedValuesOf("timeZone") : ["UTC", "Asia/Tokyo"];
  zones.forEach(z => {
    const o      = document.createElement("option");
    o.value      = z;
    o.textContent = z;
    if (z === timezone) o.selected = true;
    tzSel.append(o);
  });
  const opt = document.createElement("option");
  opt.value = "custom";
  opt.textContent = "Custom...";
  tzSel.append(opt);
}
function handleZoneChange() {
  if (tzSel.value === "custom") {
    const z = prompt("Time Zone:", timezone);
    if (z) timezone = z;
  } else {
    timezone = tzSel.value;
  }
  const div = tzDiv();
  if (div) div.textContent = timezone;
  updateSpawnDates();
  UI.render();
  saveTimers();
}
if (tzSel) {
  populateTimeZones();
  tzSel.addEventListener("change", handleZoneChange);
}

/* ———————————————————  FETCH & INIT  ——————————————————— */
function buildList(list){
  MVP_LIST.length=0;
  list.forEach(d=>{
    const m=new MVP({
      id: d.name || d.id,
      uid: `${d.name}-${d.map}`,
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

API.on("mvp-update",list=>{
  buildList(list);
  loadTimers();                 // mevcut timer ve kill verilerini tekrar yükle
  updateSpawnDates();
  UI.render();
  updateKillPanel();
  saveTimers();
});

loadAll();
const tzInit = tzDiv();
if (tzInit) tzInit.textContent = timezone;

// Pencere görünürlüğü değiştiğinde zamanlayıcıları ayarla
function handleVisibility(v){
  if(!v){
    stopTimers();
  }else{
    refreshRemaining();
    UI.render();
    if(anyRunning()) startTimers();
  }
}
document.addEventListener("visibilitychange",()=>{
  handleVisibility(!document.hidden);
});
API.on("window-vis",state=>handleVisibility(state));


/* ———————————————————  BUTON BAĞLANTILARI  ——————————————————— */
const setBtn = $("#setBtn");
if(setBtn) setBtn.onclick = () => {
if (!selected) { alert("Please select an MVP first"); return; }
  const dk = parseInt($("#minInput").value || 0, 10);
  const sn = parseInt($("#secInput").value || 0, 10);
if (isNaN(dk) || isNaN(sn) || sn < 0 || sn > 59) { alert("Invalid time"); return; }
  selected.remaining = ozelZamanaGoreKalan(dk, sn);
  selected.spawnUTC  = Date.now() + selected.remaining * 1000;
  selected.tomb      = false;
  selected.running   = true;
  startTimers();
  updateSpawnDates();
  UI.render();
  saveTimers();
};
const startBtn=$("#startBtn");
if(startBtn) startBtn.onclick = startTimers;
const stopBtn=$("#stopBtn");
if(stopBtn) stopBtn.onclick = stopTimers;
const startSelBtn=$("#startSel");
if(startSelBtn) startSelBtn.onclick = startSelected;
const stopSelBtn=$("#stopSel");
if(stopSelBtn) stopSelBtn.onclick = stopSelected;
const resetSelBtn=$("#resetSel");
if(resetSelBtn) resetSelBtn.onclick = resetSelected;
const tombBtn=$("#tombBtn");
if(tombBtn) tombBtn.onclick = () => {
  if (!selected) { alert("Please select an MVP first"); return; }
  toggleTomb(selected);
};
const resetRankBtn = document.getElementById("rankResetBtn");
if(resetRankBtn) resetRankBtn.onclick = () => {
  if(confirm("Reset MVP Rank?")) resetRank();
};
const resetTimersBtn = document.getElementById("resetTimersBtn");
if(resetTimersBtn) resetTimersBtn.onclick = () => {
  if(confirm("Reset all timers?")) resetAll();
};

function autoTab(curr, next){
  if(curr&&next)curr.addEventListener("input",()=>{if(curr.value.length>=2)next.focus();});
}
autoTab($("#minInput"), $("#secInput"));
autoTab($("#tombHour"), $("#tombMin"));
autoTab($("#tombMin"), $("#tombSec"));


function autoBack(curr, prev){
  if(curr&&prev)curr.addEventListener("keydown",e=>{
    if(e.key==="Backspace"&&curr.value===""){prev.value=prev.value.slice(0,-1);prev.focus();e.preventDefault();}
  });
}
autoBack($("#secInput"), $("#minInput"));
autoBack($("#tombSec"), $("#tombMin"));
autoBack($("#tombMin"), $("#tombHour"));

/* ———————————————————  SCROLL BUTONLARI  ——————————————————— */
// Scroll hızını artırmak için butonlarda ve tekerlek olayında
// varsayılan 100px kaydırma yerine 200px uyguluyoruz.
document.querySelectorAll(".scroll-up").forEach(b => {
  b.addEventListener("click", () => {
    const ul = document.getElementById(b.dataset.target);
    ul.scrollTop -= 200; // 2 kat daha hızlı yukarı kaydır
  });
});
document.querySelectorAll(".scroll-down").forEach(b => {
  b.addEventListener("click", () => {
    const ul = document.getElementById(b.dataset.target);
    ul.scrollTop += 200; // 2 kat daha hızlı aşağı kaydır
  });
});
document.querySelectorAll("#left, #right").forEach(panel => {
  panel.addEventListener("wheel", e => {
    // Fare tekeriyle kaydırırken de hızlandır
    panel.scrollBy({ top: e.deltaY * 2, behavior: "smooth" });
  });
});

/* ———————————————————  PANELLERDE RESIZER  ——————————————————— */
(() => {
  const left  = $("#left");
  const right = $("#right");
  document.querySelectorAll(".resizer").forEach(bar => {
    bar.addEventListener("mousedown", start);
    bar.addEventListener("touchstart", e => start(e.touches[0]));
  });
  function start(e) {
    e.preventDefault();
    const side       = e.target.dataset.side;      // 'left' | 'right'
    const startX     = e.clientX;
    const startLeft  = left .getBoundingClientRect().width;
    const startRight = right.getBoundingClientRect().width;

    function move(ev) {
      const dx = ev.clientX - startX;
      if (side === "left") {
        const newW = Math.max(180, startLeft + dx);
        left.style.width = newW + "px";
        document.documentElement.style.setProperty("--left-w", newW + "px");
      } else {
        const newW = Math.max(180, startRight - dx);
        right.style.width = newW + "px";
        document.documentElement.style.setProperty("--right-w", newW + "px");
      }
    }
    function stop() {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup",   stop);
      window.removeEventListener("touchmove", tmv);
      window.removeEventListener("touchend",  stop);
      if (window.savePanelWidths) window.savePanelWidths();
    }
  const tmv = ev => move(ev.touches[0]);
  window.addEventListener("mousemove", move);
  window.addEventListener("mouseup",   stop);
  window.addEventListener("touchmove", tmv);
  window.addEventListener("touchend",  stop);
  }
})();

(() => {
  const mid   = $("#mid");
  const kills = $("#killsWrapper");
  const bar   = document.querySelector(".v-resizer");
  if (!bar) return;
  function sync() {
    const wrap = document.getElementById("wrapper");
    if (!wrap || !mid || !kills) return;
    const kh = wrap.clientHeight - mid.getBoundingClientRect().height;
    document.documentElement.style.setProperty("--kills-h", kh + "px");
  }
  sync();
  window.addEventListener("resize", sync);
  bar.addEventListener("mousedown", start);
  bar.addEventListener("touchstart", e => start(e.touches[0]));
  function start(e) {
    e.preventDefault();
    const startY  = e.clientY;
    const startM  = mid.getBoundingClientRect().height;
    const startK  = kills.getBoundingClientRect().height;
    const total   = startM + startK;
    function move(ev) {
      const dy   = ev.clientY - startY;
      let mH     = Math.max(100, startM + dy);
      let kH     = total - mH;
      if (kH < 100) { kH = 100; mH = total - 100; }
      document.documentElement.style.setProperty("--mid-h", mH + "px");
      document.documentElement.style.setProperty("--kills-h", kH + "px");
    }
    function stop() {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup",   stop);
      window.removeEventListener("touchmove", tmv);
      window.removeEventListener("touchend",  stop);
      sync();
      if (window.savePanelHeights) window.savePanelHeights();
    }
    const tmv = ev => move(ev.touches[0]);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup",   stop);
    window.addEventListener("touchmove", tmv);
    window.addEventListener("touchend",  stop);
  }
})();


window.addEventListener("storage", e => {
  if(e.key === "theme") applyTheme();
  if(e.key === "soundEnabled") soundEnabled = e.newValue !== "0";
  if(e.key === BLINK_KEY) {
    blinkEnabled = e.newValue !== "1";
    applyBlink();
  }
  if(e.key === "timezone") {
    timezone = e.newValue || timezone;
    const div = tzDiv();
    if (div) div.textContent = timezone;
    updateSpawnDates();
    UI.render();
    saveTimers();
  }
});

export { MVP_LIST, UI, step, resetMvp, nowTz, markKilled, toggleTomb, resetRank, MVP, saveTimers, loadTimers, updateSpawnDates, updateKillPanel };
