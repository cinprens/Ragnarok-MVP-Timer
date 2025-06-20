const nameInput = document.getElementById('name');
const minutesInput = document.getElementById('minutes');
const tombInput = document.getElementById('tomb');
const addBtn = document.getElementById('addBtn');
const leftPanel=document.getElementById('left-panel')||document;
const midPanel=document.getElementById('mid-panel')||document;
const rightPanel=document.getElementById('right-panel')||document;
const nearestEl=midPanel.querySelector('#enYakin');
const upcomingEl=midPanel.querySelector('#yaklasanlar');
const completedEl=midPanel.querySelector('#bitenler');
const historyEl=rightPanel.querySelector('#history');
const soundInput = document.getElementById('soundFile');
const alertSound = document.getElementById('alertSound');
alertSound.src = 'Sound/sound.wav';
if(typeof Notification!=='undefined'&&Notification.permission==='default'){
  Notification.requestPermission();
}
const REMOVE_DELAY = 10000;
const timezoneSelect = document.getElementById('timezone');
const listEl = leftPanel.querySelector('#mvpList');

const started={};

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
    fetch('mvpData.json').then(r=>r.json()).then(d=>{mvpData=d;cb&&cb();}).catch(()=>{
      const e=document.getElementById('fetchError');
      if(e){e.textContent='Veri yüklenemedi';e.style.display='block';}
    });
  }else{
    mvpData=require('./mvpData.json');
    if(cb)cb();
  }
}

function renderMvpList() {
  listEl.innerHTML = '';
  mvpData.forEach(m => {
    if(started[m.name])return;
    const c=document.createElement('div');
    c.className='mvp-card';
    const img=document.createElement('img');
    img.src=m.img||'';
    img.alt=(m.name||'')+' görseli';
    const name=document.createElement('div');
    name.textContent=m.name;
    const map=document.createElement('img');
    map.src=m.mapImg||'';
    map.alt=(m.map||'')+' harita görseli';
    const inp=document.createElement('input');
    inp.type='number';
    inp.placeholder='Dakika';
    const btn=document.createElement('button');
    btn.textContent='Başlat';
    btn.onclick=()=>{
      const val=parseInt(inp.value,10);
      addTimer(m.name,isNaN(val)?m.respawn/60:val);
    };
    c.appendChild(img);
    c.appendChild(name);
    c.appendChild(map);
    c.appendChild(inp);
    c.appendChild(btn);
    listEl.appendChild(c);
  });
}

let timers = JSON.parse(localStorage.getItem('mvpTimers') || '[]').map(t => ({...t, done:t.done||false}));
timers.forEach(t=>{started[t.name]=true;});
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
  timers.push({ name, end, done:false, transition:true });
  started[name]=true;
  saveTimers();
  renderMvpList();
  renderTimers();
}

function removeTimer(index) {
  const t=timers.splice(index, 1)[0];
  if(t)started[t.name]=false;
  saveTimers();
  renderMvpList();
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
  const kart=document.createElement('div');
  kart.className='card';
  if(t.transition){
    kart.classList.add('enter');
    requestAnimationFrame(()=>kart.classList.remove('enter'));
    t.transition=false;
  }
  const img=document.createElement('img');
  img.src=mvp.img||'';
  img.alt=(t.name||'')+' görseli';
  const map=document.createElement('img');
  map.src=mvp.mapImg||'';
  map.alt=(mvp.map||'')+' harita görseli';
  const inp=document.createElement('input');
  inp.type='number';
  inp.value=Math.ceil((t.end-Date.now())/60000);
  const guncelle=document.createElement('button');
  guncelle.textContent='Güncelle';
  const apply=()=>{
    const val=parseInt(inp.value,10);
    if(!isNaN(val)){
      t.end=Date.now()+val*60000;
      saveTimers();
      renderTimers();
    }
  };
  guncelle.onclick=apply;
  inp.onkeydown=e=>{if(e.key==='Enter')apply();};
  const sil=document.createElement('button');
  sil.textContent='Sil';
  sil.onclick=()=>removeTimer(i);
  const yukari=document.createElement('button');
  yukari.textContent='▲';
  yukari.onclick=()=>moveTimer(i,-1);
  const asagi=document.createElement('button');
  asagi.textContent='▼';
  asagi.onclick=()=>moveTimer(i,1);
  kart.appendChild(img);
  kart.appendChild(map);
  kart.appendChild(inp);
  kart.appendChild(guncelle);
  kart.appendChild(sil);
  kart.appendChild(yukari);
  kart.appendChild(asagi);
  return kart;
}

function renderTimers(){
  const now=Date.now();
  timers=timers.filter(tt=>{
    if(tt.removeAt&&tt.removeAt<=now){
      started[tt.name]=false;
      return false;
    }
    return true;
  });
  timers.sort((a,b)=>a.end-b.end);
  upcomingEl.innerHTML='';
  completedEl.innerHTML='';
  timers.forEach((t,i)=>{
    const left=t.end-now;
    if(left<=0&&!t.done){
      history.unshift({name:t.name,time:t.end});
      t.done=true;
      t.removeAt=now+REMOVE_DELAY;
      t.transition=true;
      saveHistory();
      if(alertSound.src)alertSound.play();
      if(typeof Notification!=='undefined'&&Notification.permission==='granted'){
        new Notification(`${t.name} spawn oldu`);
      }
    }
  });
  const aktif=timers.filter(t=>t.end>now);
  const bitti=timers.filter(t=>t.end<=now);
  if(aktif[0]){
    nearestEl.innerHTML='';
    nearestEl.appendChild(kartOlustur(aktif[0],timers.indexOf(aktif[0])));
  }else{nearestEl.innerHTML='';}
  aktif.forEach(t=>upcomingEl.appendChild(kartOlustur(t,timers.indexOf(t))));
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
