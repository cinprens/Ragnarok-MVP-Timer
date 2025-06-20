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
if(typeof Notification!=='undefined'&&Notification.permission==='default'){
  Notification.requestPermission();
}
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

const useEmbeddedData = false;
const embeddedMvpData = [
  {"name":"Beelzebub","map":"abbey03","respawn":43200,"img":"MVP Giff/BEELZEBUB_.gif","mapImg":"Maps/abbey03.gif"},
  {"name":"Maya","map":"anthell02","respawn":7200,"img":"MVP Giff/MAYA.gif","mapImg":"Maps/anthell02.gif"},
  {"name":"Tao Gunka","map":"beach_dun","respawn":3600,"img":"MVP Giff/TAO_GUNKA.gif","mapImg":"Maps/beach_dun.gif"},
  {"name":"Dracula","map":"gef_dun01","respawn":3600,"img":"MVP Giff/DRACULA.gif","mapImg":"Maps/gef_dun01.gif"},
  {"name":"Dracula","map":"gef_dun02","respawn":3600,"img":"MVP Giff/DRACULA.gif","mapImg":"Maps/gef_dun02.gif"},
  {"name":"Orc Hero","map":"gef_fild03","respawn":3600,"img":"MVP Giff/ORK_HERO.gif","mapImg":"Maps/gef_fild03.gif"},
  {"name":"Orc Lord","map":"gef_fild14","respawn":7200,"img":"MVP Giff/ORC_LORD.gif","mapImg":"Maps/gef_fild14.gif"},
  {"name":"Doppelganger","map":"gl_cas01","respawn":7200,"img":"MVP Giff/DOPPELGANGER.gif","mapImg":"Maps/gl_cas01.gif"},
  {"name":"Dark Lord","map":"gl_chyard","respawn":7200,"img":"MVP Giff/DARK_LORD.gif","mapImg":"Maps/gl_chyard.gif"},
  {"name":"Evil Snake Lord","map":"gon_dun03","respawn":7200,"img":"MVP Giff/Evil Snake Lord.gif","mapImg":"Maps/gon_dun03.gif"},
  {"name":"Amon Ra","map":"in_sphinx5","respawn":3600,"img":"MVP Giff/AMON_RA.gif","mapImg":"Maps/in_sphinx5.gif"},
  {"name":"White Lady","map":"lou_dun03","respawn":7200,"img":"MVP Giff/White Lady.gif","mapImg":"Maps/lou_dun03.gif"},
  {"name":"Mistress","map":"mjolnir_04","respawn":7200,"img":"MVP Giff/MISTRESS.gif","mapImg":"Maps/mjolnir_04.gif"},
  {"name":"Phreeoni","map":"moc_fild17","respawn":3600,"img":"MVP Giff/PHREEONI.gif","mapImg":"Maps/moc_fild17.gif"},
  {"name":"Osiris","map":"moc_pryd04","respawn":3600,"img":"MVP Giff/OSIRIS.gif","mapImg":"Maps/moc_pryd04.gif"},
  {"name":"Randgris","map":"odin_tem03","respawn":10800,"img":"MVP Giff/RANDGRIS.gif","mapImg":"Maps/odin_tem03.gif"},
  {"name":"Moonlight Flower","map":"pay_dun04","respawn":3600,"img":"MVP Giff/MOONLIGHT.gif","mapImg":"Maps/pay_dun04.gif"},
  {"name":"Eddga","map":"pay_fild10","respawn":7200,"img":"MVP Giff/EDDGA.gif","mapImg":"Maps/pay_fild10.gif"},
  {"name":"Baphomet","map":"prt_maze03","respawn":7200,"img":"MVP Giff/4_BAPHOMET.gif","mapImg":"Maps/prt_maze03.gif"},
  {"name":"Golden Bug","map":"prt_sewb4","respawn":3600,"img":"MVP Giff/GOLDEN_BUG.gif","mapImg":"Maps/prt_sewb4.gif"},
  {"name":"Drake","map":"treasure02","respawn":7200,"img":"MVP Giff/DRAKE.gif","mapImg":"Maps/treasure02.gif"},
  {"name":"Turtle General","map":"tur_dun04","respawn":3600,"img":"MVP Giff/TURTLE_GENERAL.gif","mapImg":"Maps/tur_dun04.gif"},
  {"name":"Stormy Knight","map":"xmas_dun02","respawn":7200,"img":"MVP Giff/4_STORMKNIGHT.gif","mapImg":"Maps/xmas_dun02.gif"},
  {"name":"Garm","map":"xmas_fild01","respawn":7200,"img":"MVP Giff/GARM.gif","mapImg":"Maps/xmas_fild01.gif"}
];

let mvpData = [];

function loadMvpData(cb){
  if(useEmbeddedData){
    mvpData=embeddedMvpData;
    cb&&cb();
    return;
  }
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
    const c=document.createElement('div');
    c.className='mvp-card';
    const img=document.createElement('img');
    img.src=m.img||'';
    const name=document.createElement('div');
    name.textContent=m.name;
    const map=document.createElement('img');
    map.src=m.mapImg||'';
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
  const kart=document.createElement('div');
  kart.className='card';
  const img=document.createElement('img');
  img.src=mvp.img||'';
  const map=document.createElement('img');
  map.src=mvp.mapImg||'';
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
  timers=timers.filter(tt=>!(tt.removeAt&&tt.removeAt<=now));
  timers.sort((a,b)=>a.end-b.end);
  upcomingEl.innerHTML='';
  completedEl.innerHTML='';
  timers.forEach((t,i)=>{
    const left=t.end-now;
    if(left<=0&&!t.done){
      history.unshift({name:t.name,time:t.end});
      t.done=true;
      t.removeAt=now+REMOVE_DELAY;
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
    const dk=Math.ceil((aktif[0].end-now)/60000);
    nearestEl.textContent=`En Yakın MVP: ${aktif[0].name} - ${dk} dk`;
  }else{nearestEl.textContent='';}
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
