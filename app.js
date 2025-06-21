if(typeof Notification!=='undefined'&&Notification.permission==='default'){
  Notification.requestPermission();
}
let mezarSaatineGoreKalan,ozelZamanaGoreKalan;
if(typeof window==='undefined'){
  ({mezarSaatineGoreKalan,ozelZamanaGoreKalan}=require('./timeUtils.js'));
}else{
  ({mezarSaatineGoreKalan,ozelZamanaGoreKalan}=window);
}
class MVP{
  constructor({id,file,map,respawnMin}){
    this.id=id;
    this.file=file;
    this.map=map;
    this.respawn=respawnMin*60;
    this.remaining=this.respawn;
    this.tomb=false;
    this.tombTime="";
    this.spawnUTC=Date.now()+this.remaining*1000;
    this.running=false;
  }
  sprite(){return `./MVP_Giff/${this.file}`;}
  mapImg(){return `./Maps/${this.map}.gif`;}
}
let MVP_LIST=[];
const $=s=>document.querySelector(s);
const tzSel=$('#tzSelect');
let timezone=localStorage.getItem('timezone')||Intl.DateTimeFormat().resolvedOptions().timeZone;
const SOUND=typeof Audio!=='undefined'?new Audio('./Sound/sound.wav'):null;
function nowTz(){return new Date(new Date().toLocaleString('en-US',{timeZone:timezone}));}
function updateSpawnDates(){
  MVP_LIST.forEach(m=>{
    let next=m.spawnUTC||Date.now()+m.remaining*1000;
    if(m.remaining<0){
      const cycles=Math.floor(-m.remaining/m.respawn)+1;
      next+=cycles*m.respawn*1000;
    }
    m.spawnDate=new Date(new Date(next).toLocaleString('en-US',{timeZone:timezone}));
  });
}
let autoReturnId;

function populateTimeZones(){
  const zones=Intl.supportedValuesOf('timeZone');
  zones.forEach(z=>{
    const o=document.createElement('option');
    o.value=z;
    o.textContent=z;
    if(z===timezone)o.selected=true;
    tzSel.append(o);
  });
  const opt=document.createElement('option');
  opt.value='custom';
  opt.textContent='Özel...';
  tzSel.append(opt);
}

function handleZoneChange(){
  if(tzSel.value==='custom'){
    const z=prompt('Zaman Dilimi:',timezone);
    if(z)timezone=z;
  }else{
    timezone=tzSel.value;
  }
  updateSpawnDates();
  render();
  saveTimers();
}

if(tzSel){
  populateTimeZones();
  tzSel.addEventListener('change',handleZoneChange);
}
const UI={
  gif:$("#mvpGif"),
  time:$("#mvpTime"),
  map:$("#mvpMap"),
  left:$("#positiveList"),
  right:$("#right #negativeList"),
  render(){
    const pos=MVP_LIST.filter(m=>m.remaining>=0).sort((a,b)=>a.remaining-b.remaining);
    const neg=MVP_LIST.filter(m=>m.remaining<0).sort((a,b)=>a.remaining-b.remaining);
    this.left.innerHTML="";pos.forEach(m=>this.left.append(makeLi(m,true)));
    this.right.innerHTML="";neg.forEach(m=>this.right.append(makeLi(m,false)));
    if(selected){
      this.setCurrent(selected);
    }else{
      pos[0]?this.setCurrent(pos[0]):this.clearCurrent();
      selected=null;
    }
  },
  setCurrent(m){
    this.current=m;
    this.gif.src=m.sprite();
    this.time.textContent=fmt(m.remaining);
    this.map.src=m.mapImg();
  },
  clearCurrent(){
    this.current=null;
    this.gif.src="";
    this.time.textContent="";
    this.map.src="";
  }
};

fetch("mvpData.json")
  .then(r=>r.json())
  .then(arr=>{
    MVP_LIST=arr.map(d=>new MVP({
      id:d.name,
      file:d.img.replace("MVP_Giff/",""),
      map:d.map,
      respawnMin:d.respawn/60
    }));
    MVP_LIST.forEach(m=>m.running=false);
    loadTimers();
  });

let selected=null;
const fmt=s=>`${s<0?"-":""}${String(Math.floor(Math.abs(s)/60)).padStart(2,"0")}:${String(Math.abs(s)%60).padStart(2,"0")}`;
function render(){UI.render();}
function selectMvp(m){
  const old=document.querySelector('.mvp-row.selected');
  if(old)old.classList.remove('selected');
  selected=m;
  clearTimeout(autoReturnId);
  autoReturnId=setTimeout(()=>{selected=null;render();},600000);
  render();
}
function makeLi(m,positive){
  const li=document.createElement("li");
  li.className=`mvp-row ${positive?"positive":"negative"}${m.tomb?" tomb-active":""}`;
  if(m.remaining<0)li.classList.add("negative");
  if(selected===m)li.classList.add("selected");
  li.onclick=()=>selectMvp(m);
  const img=document.createElement("img");
  img.className="sprite";img.src=m.sprite();
  const info=document.createElement("div");
  info.className="mvp-info";
  info.innerHTML=`<strong>${m.id}</strong><span>${m.map}</span>`;
  const map=document.createElement("img");map.className="mvp-mapThumb";map.src=m.mapImg();
  const time=document.createElement("div");
  time.className="mvp-timer";
  const remain=document.createElement("div");
  remain.textContent=fmt(m.remaining);
  time.append(remain);
  if(m.remaining<0){
    const next=m.spawnUTC||Date.now()+m.remaining*1000;
    const cycles=Math.floor(-m.remaining/m.respawn)+1;
    const date=new Date(new Date(next+cycles*m.respawn*1000).toLocaleString('en-US',{timeZone:timezone}));
    const sd=document.createElement("div");
    sd.className="spawn-date";
    sd.textContent=date.toLocaleString();
    time.append(sd);
  }
  const tombTime=document.createElement("div");tombTime.className="tomb-time";tombTime.textContent=m.tombTime;
  const tomb=document.createElement("img");tomb.className="tomb";tomb.src="./MVP_Giff/MOB_TOMB.gif";
  const btn=document.createElement("button");
  if(m.remaining<0){
    btn.textContent="Reset";
    btn.onclick=e=>{e.stopPropagation();resetMvp(m);};
  }else{
    btn.textContent=m.running?"Stop":"Start";
    btn.onclick=e=>{
      e.stopPropagation();
      if(m.running){
        m.remaining=Math.floor((m.spawnUTC-Date.now())/1000);
        m.running=false;
        if(!anyRunning())stopTimers();
      }else{
        m.spawnUTC=Date.now()+m.remaining*1000;
        m.running=true;
        startTimers();
      }
      render();
      saveTimers();
    };
  }
  li.append(img,info,map,time,tombTime,tomb,btn);
  return li;
}
function toggleTomb(m){
  if(m.tomb){
    m.tomb=false;
    m.tombTime="";
  }else{
    const val=document.getElementById("tombInput").value;
    if(!val){alert('Saat gir');return;}
    m.remaining=mezarSaatineGoreKalan(val,timezone,m.respawn);
    m.spawnUTC=Date.now()+m.remaining*1000;
    m.tomb=true;
    m.tombTime=val+' '+timezone;
  }
  updateSpawnDates();
  render();
  saveTimers();
}

let timerId=null;
function anyRunning(){return MVP_LIST.some(m=>m.running);}
function step(){
  MVP_LIST.forEach(m=>{
    if(m.running){
      m.remaining--;
      if(m.remaining===180&&SOUND)SOUND.play();
      if(m.remaining===-1&&typeof Notification!=='undefined'&&Notification.permission==='granted'){
        new Notification(m.id,{body:`${m.map} haritasında`});
      }
    }
  });
  updateSpawnDates();
  if(UI.current) UI.time.textContent=fmt(UI.current.remaining);
  render();
  if(!anyRunning())stopTimers();
}
function startTimers(){
  if(!timerId) timerId=setInterval(step,1000);
}
function stopTimers(){
  if(timerId){clearInterval(timerId);timerId=null;}
}

function resetMvp(m){
  m.remaining=m.respawn;
  m.spawnUTC=Date.now()+m.remaining*1000;
  m.running=false;
  updateSpawnDates();
  render();
  saveTimers();
}

function resetAll(){
  MVP_LIST.forEach(resetMvp);
  updateSpawnDates();
  render();
  saveTimers();
}

function flashRow(m){
  setTimeout(() => {
    const li = [...document.querySelectorAll(".mvp-row")].find(el => el.textContent.includes(m.id));
    li && li.classList.add("flash");
    setTimeout(() => li && li.classList.remove("flash"), 300);
  }, 20);
}

$("#setBtn").onclick = () => {
  if (!selected) {
    alert('Önce bir MVP seç');
    return;
  }
  const dk = parseInt($("#minInput").value || 0),
        sn = parseInt($("#secInput").value || 0);
  if (isNaN(dk) || isNaN(sn) || sn < 0 || sn > 59) {
    alert('Süre geçersiz');
    return;
  }
  selected.remaining = ozelZamanaGoreKalan(dk,sn);
  selected.tomb = false;
  selected.spawnUTC=Date.now()+selected.remaining*1000;
  updateSpawnDates();
  render();
  saveTimers();
};
$("#allSetBtn").onclick=()=>{
  const dk=parseInt($("#allMinInput").value||0),sn=parseInt($("#allSecInput").value||0);
  if(isNaN(dk)||isNaN(sn)||sn<0||sn>59){alert('Süre geçersiz');return;}
  MVP_LIST.forEach(m=>{
    m.remaining=ozelZamanaGoreKalan(dk,sn);
    m.tomb=false;
    m.spawnUTC=Date.now()+m.remaining*1000;
  });
  updateSpawnDates();
  render();
  saveTimers();
};
$("#startBtn").onclick=startTimers;
$("#stopBtn").onclick=stopTimers;
document.getElementById("resetAllBtn").onclick=resetAll;
document.getElementById("tombBtn").onclick=()=>{
  if(!selected){alert('Önce bir MVP seç');return;}
  toggleTomb(selected);
};

function saveTimers(){
  const data=MVP_LIST.map(m=>({id:m.id,remaining:m.remaining,running:m.running,spawnUTC:m.spawnUTC}));
  localStorage.setItem('timers',JSON.stringify(data));
  localStorage.setItem('timezone',timezone);
}

function loadTimers(){
  const tz=localStorage.getItem('timezone');
  if(tz){
    timezone=tz;
    if(tzSel){
      const opt=[...tzSel.options].find(o=>o.value===tz);
      tzSel.value=opt?tz:'custom';
    }
  }
  const str=localStorage.getItem('timers');
  if(str){
    try{
      const arr=JSON.parse(str);
      arr.forEach(d=>{
        const m=MVP_LIST.find(x=>x.id===d.id);
        if(m){
          m.running=!!d.running;
          m.spawnUTC=d.spawnUTC||Date.now()+m.remaining*1000;
          if(m.running){
            m.remaining=Math.floor((m.spawnUTC-Date.now())/1000);
          }else if(typeof d.remaining==='number'){
            m.remaining=d.remaining;
            m.spawnUTC=Date.now()+m.remaining*1000;
          }
        }
      });
      if(anyRunning())startTimers();
    }catch(e){}
  }
  updateSpawnDates();
  render();
}

(() => {
  const left   = document.getElementById("left");
  const right  = document.getElementById("right");
  const resizers = document.querySelectorAll(".resizer");

  resizers.forEach(bar => {
    bar.addEventListener("mousedown", start);
    bar.addEventListener("touchstart", e=>start(e.touches[0]));
  });

  function start(e){
    const side = e.target.dataset.side;
    const startX = e.clientX;
    const startLeft  = left.getBoundingClientRect().width;
    const startRight = right.getBoundingClientRect().width;

    function move(ev){
      const dx = ev.clientX - startX;
      if(side === "left"){
        const newW = Math.max(180, startLeft + dx);
        left.style.width = newW + "px";
        document.documentElement.style.setProperty("--left-w", newW+"px");
      }else{
        const newW = Math.max(180, startRight - dx);
        right.style.width = newW + "px";
        document.documentElement.style.setProperty("--right-w", newW+"px");
      }
    }
    function stop(){
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", stop);
      window.removeEventListener("touchmove", tmv);
      window.removeEventListener("touchend", stop);
      if(window.savePanelWidths)window.savePanelWidths();
    }
    const tmv = ev=>move(ev.touches[0]);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", stop);
    window.addEventListener("touchmove", tmv);
    window.addEventListener("touchend", stop);
  }
})();

document.querySelectorAll('.scroll-up').forEach(b=>{
  b.addEventListener('click',()=>{
    const ul=document.getElementById(b.dataset.target);
    ul.scrollTop-=100;
  });
});
document.querySelectorAll('.scroll-down').forEach(b=>{
  b.addEventListener('click',()=>{
    const ul=document.getElementById(b.dataset.target);
    ul.scrollTop+=100;
  });
});
document.querySelectorAll('#left,#right').forEach(panel=>{
  panel.addEventListener('wheel',e=>{
    panel.scrollBy({top:e.deltaY,behavior:'smooth'});
  });
});

const bannerBtn=document.getElementById("bannerToggle");
function setBannerState(){
  const hidden=localStorage.getItem("bannerHidden")==="1";
  document.body.classList.toggle("banners-hidden",hidden);
  if(bannerBtn)bannerBtn.textContent=hidden?"Show Banners":"Hide Banners";
}
if(bannerBtn){
  bannerBtn.addEventListener("click",()=>{
    const now=document.body.classList.toggle("banners-hidden");
    localStorage.setItem("bannerHidden",now?"1":"0");
    bannerBtn.textContent=now?"Show Banners":"Hide Banners";
  });
  setBannerState();
}

if(typeof window!=="undefined"){window.loadTimers=loadTimers;window.saveTimers=saveTimers;}
if(typeof module!=="undefined")module.exports={UI,MVP_LIST,resetMvp};
