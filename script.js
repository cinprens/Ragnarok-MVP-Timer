const nameInput = document.getElementById('name');
const minutesInput = document.getElementById('minutes');
const tombInput = document.getElementById('tomb');
const addBtn = document.getElementById('addBtn');
const nearestEl=document.getElementById("enYakin");
const upcomingEl=document.getElementById("yaklasanlar");
const completedEl=document.getElementById("bitenler");
const historyEl = document.getElementById('history');
const soundInput = document.getElementById('soundFile');
const alertSound = document.getElementById('alertSound');
alertSound.src = 'Sound/sound.wav';
const REMOVE_DELAY = 10000;
const timezoneSelect = document.getElementById('timezone');
const listEl = document.getElementById('mvpList');

const savedZone = localStorage.getItem('timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;
const zones = typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : [savedZone];
zones.forEach(z => {
  const opt = document.createElement('option');
  opt.value = z;
  opt.textContent = z;
  timezoneSelect.appendChild(opt);
});
timezoneSelect.value = savedZone;
timezoneSelect.onchange = () => {
  localStorage.setItem('timezone', timezoneSelect.value);
  renderTimers();
  renderHistory();
};

let mvpData = [];

function loadMvpData(cb){
  if(typeof window!=='undefined'&&window.fetch){
    fetch('mvpData.json').then(r=>r.json()).then(d=>{mvpData=d;cb&&cb();});
  }else{
    mvpData=require('./mvpData.json');
    if(cb)cb();
  }
}

function renderMvpList() {
  listEl.innerHTML = '';
  const ol = document.createElement('ol');
  mvpData.forEach(m => {
    const li = document.createElement('li');
    li.textContent = m.name;
    li.onclick = () => addTimer(m.name, m.respawn / 60);
    li.oncontextmenu = e => {
      e.preventDefault();
      const val = parseInt(prompt('Dakika?') || '', 10);
      if (!isNaN(val)) addTimer(m.name, val);
    };
    ol.appendChild(li);
  });
  listEl.appendChild(ol);
}

let timers = JSON.parse(localStorage.getItem('mvpTimers') || '[]').map(t => ({...t, done:t.done||false}));
let history = [];
let db=null;

function openDb(){
  return new Promise(r=>{
    if(typeof indexedDB==='undefined'){r();return;}
    const req=indexedDB.open('mvpDB',1);
    req.onupgradeneeded=()=>req.result.createObjectStore('history',{keyPath:'time'});
    req.onsuccess=()=>{db=req.result;r();};
    req.onerror=()=>r();
  });
}

function loadHistory(){
  if(db){
    return new Promise(res=>{
      const tx=db.transaction('history');
      const get=tx.objectStore('history').getAll();
      get.onsuccess=()=>res(get.result||[]);
      get.onerror=()=>res([]);
    });
  }
  return Promise.resolve(JSON.parse(localStorage.getItem('mvpHistory')||'[]'));
}

function saveTimers() {
  localStorage.setItem('mvpTimers', JSON.stringify(timers));
}

function saveHistory(){
  if(db){
    const tx=db.transaction('history','readwrite');
    const store=tx.objectStore('history');
    history.forEach(h=>store.put(h));
  }else{
    localStorage.setItem('mvpHistory', JSON.stringify(history));
  }
}

function addTimer(name, minutes) {
  const end = Date.now() + minutes * 60000;
  timers.push({ name, end, done:false });
  saveTimers();
  renderTimers();
}

function removeTimer(index) {
  timers.splice(index, 1);
  saveTimers();
  renderTimers();
}

function moveTimer(index, dir) {
  const newIndex = index + dir;
  if (newIndex < 0 || newIndex >= timers.length) return;
  const [item] = timers.splice(index, 1);
  timers.splice(newIndex, 0, item);
  saveTimers();
  renderTimers();
}

function kartOlustur(t,i){
  const mvp=mvpData.find(m=>m.name===t.name)||{};
  const kart=document.createElement("div");
  kart.className="card";
  const sol=document.createElement("img");
  sol.src=mvp.img||"";
  const orta=document.createElement("img");
  orta.src=mvp.mapImg||"";
  const sag=document.createElement("div");
  const dk=Math.ceil((t.end-Date.now())/60000);
  sag.textContent=`Kalan: ${dk} dk`;
  sag.style.fontWeight="bold";
  const sil=document.createElement("button");
  sil.textContent="Sil";
  sil.onclick=()=>removeTimer(i);
  const yukari=document.createElement("button");
  yukari.textContent="▲";
  yukari.onclick=()=>moveTimer(i,-1);
  const asagi=document.createElement("button");
  asagi.textContent="▼";
  asagi.onclick=()=>moveTimer(i,1);
  const ctrl=document.createElement("div");
  ctrl.appendChild(sil);
  ctrl.appendChild(yukari);
  ctrl.appendChild(asagi);
  kart.appendChild(sol);
  kart.appendChild(orta);
  kart.appendChild(sag);
  kart.appendChild(ctrl);
  return kart;
}

function renderTimers(){
  const now=Date.now();
  timers=timers.filter(tt=>!(tt.removeAt&&tt.removeAt<=now));
  timers.sort((a,b)=>a.end-b.end);
  nearestEl.innerHTML="";
  upcomingEl.innerHTML="";
  completedEl.innerHTML="";
  timers.forEach((t,i)=>{
    const left=t.end-now;
    if(left<=0&&!t.done){
      history.unshift({name:t.name,time:t.end});
      t.done=true;
      t.removeAt=now+REMOVE_DELAY;
      saveHistory();
      if(alertSound.src)alertSound.play();
    }
  });
  const aktif=timers.filter(t=>t.end>now);
  const bitti=timers.filter(t=>t.end<=now);
  if(aktif[0])nearestEl.appendChild(kartOlustur(aktif[0],timers.indexOf(aktif[0])));
  aktif.slice(1).forEach(t=>upcomingEl.appendChild(kartOlustur(t,timers.indexOf(t))));
  bitti.forEach(t=>completedEl.appendChild(kartOlustur(t,timers.indexOf(t))));
  saveTimers();
  renderHistory();
}

function renderHistory() {
  historyEl.innerHTML = '';
  history.slice(0, 10).forEach(h => {
    const div = document.createElement('div');
    const timeStr = new Date(h.time).toLocaleString('tr-TR', { timeZone: timezoneSelect.value });
    div.textContent = `${h.name} ${timeStr}`;
    historyEl.appendChild(div);
  });
}

addBtn.onclick = () => {
  const name = nameInput.value.trim();
  const minutes = parseInt(minutesInput.value, 10);
  const tomb = parseInt(tombInput.value, 10) || 0;
  if (!name || isNaN(minutes)) return;
  addTimer(name, minutes + tomb);
};

soundInput.onchange = e => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    if (typeof ev.target?.result === 'string') {
      alertSound.src = ev.target.result;
    }
  };
  reader.readAsDataURL(file);
};

loadMvpData(()=>{
  openDb().then(()=>loadHistory()).then(h=>{
    history=h;
    renderMvpList();
    renderHistory();
    renderTimers();
    setInterval(renderTimers,1000);
  });
});

if (typeof module !== 'undefined') {
  module.exports = { addTimer, removeTimer, moveTimer, timers };
}
