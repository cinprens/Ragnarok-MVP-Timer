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
let timezone=Intl.DateTimeFormat().resolvedOptions().timeZone;
function nowTz(){return new Date(new Date().toLocaleString('en-US',{timeZone:timezone}));}
function updateSpawnDates(){
  MVP_LIST.forEach(m=>{m.spawnDate=new Date(new Date(m.spawnUTC).toLocaleString('en-US',{timeZone:timezone}));});
}
if(tzSel){
  const zones=['UTC','Europe/Istanbul','Europe/London','America/New_York','Asia/Tokyo'];
  zones.forEach(z=>{const o=document.createElement('option');o.value=z;o.textContent=z;if(z===timezone)o.selected=true;tzSel.append(o);});
  tzSel.addEventListener('change',()=>{timezone=tzSel.value;updateSpawnDates();render();});
}
const UI={
  gif:$("#mvpGif"),
  time:$("#mvpTime"),
  map:$("#mvpMap"),
  left:$("#positiveList"),
  right:$("#negativeList"),
  render(){
    const pos=MVP_LIST.filter(m=>m.remaining>=0).sort((a,b)=>a.remaining-b.remaining);
    const neg=MVP_LIST.filter(m=>m.remaining<0).sort((a,b)=>a.remaining-b.remaining);
    this.left.innerHTML="";pos.forEach(m=>this.left.append(makeLi(m,true)));
    this.right.innerHTML="";neg.forEach(m=>this.right.append(makeLi(m,false)));
    pos[0]?this.setCurrent(pos[0]):this.clearCurrent();
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
    updateSpawnDates();
    render();
  });

let selected=null;
const fmt=s=>`${s<0?"-":""}${String(Math.floor(Math.abs(s)/60)).padStart(2,"0")}:${String(Math.abs(s)%60).padStart(2,"0")}`;
function render(){UI.render();}
function makeLi(m,positive){
  const li=document.createElement("li");
  li.className=`mvp-row ${positive?"positive":"negative"}${m.tomb?" tomb-active":""}`;
  if(m.remaining<0)li.classList.add("negative");
  li.onclick=()=>{selected=m;};
  const img=document.createElement("img");
  img.className="sprite";img.src=m.sprite();
  const info=document.createElement("div");
  info.className="mvp-info";
  info.innerHTML=`<strong>${m.id}</strong><span>${m.map}</span>`;
  const map=document.createElement("img");map.className="mvp-mapThumb";map.src=m.mapImg();
  const time=document.createElement("div");time.className="mvp-timer";time.textContent=fmt(m.remaining);
  const tombTime=document.createElement("div");tombTime.className="tomb-time";tombTime.textContent=m.tombTime;
  const tomb=document.createElement("img");tomb.className="tomb";tomb.src="./MVP_Giff/MOB_TOMB.gif";tomb.onclick=e=>{e.stopPropagation();toggleTomb(m,li);};
  const btn=document.createElement("button");
  if(m.remaining<0){
    btn.textContent="Sıfırla";
    btn.onclick=e=>{e.stopPropagation();resetMvp(m);};
  }else{
    btn.textContent=m.running?"Durdur":"Başlat";
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
    };
  }
  li.append(img,info,map,time,tombTime,tomb,btn);
  return li;
}
function toggleTomb(m,li){
  if(m.tomb){
    m.tomb=false;
    m.tombTime="";
    li.classList.remove("tomb-active");
  }else{
    const val=document.getElementById("tombInput").value;
    if(!val){alert("Saat gir");return;}
    const [h,min]=val.split(":" ).map(Number);
    const now=nowTz();
    let t=new Date(now.getFullYear(),now.getMonth(),now.getDate(),h,min);
    if(t>now)t.setDate(t.getDate()-1);
    const diff=(now-t)/1000;
    m.remaining=m.respawn-diff;
    m.spawnUTC=Date.now()+m.remaining*1000;
    m.tomb=true;
    m.tombTime=val;
    li.classList.add("tomb-active");
  }
  updateSpawnDates();
  render();
}

let timerId=null;
function anyRunning(){return MVP_LIST.some(m=>m.running);}
function step(){
  MVP_LIST.forEach(m=>{
    if(m.running){
      m.remaining--;
    }
  });
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
    alert("Önce listeden bir MVP seç.");
    return;
  }
  const dk = parseInt($("#minInput").value || 0),
        sn = parseInt($("#secInput").value || 0);
  if (isNaN(dk) || isNaN(sn) || sn < 0 || sn > 59) {
    alert("Süre hatalı");
    return;
  }
  selected.remaining = dk * 60 + sn;
  selected.tomb = false;
  selected.spawnUTC=Date.now()+selected.remaining*1000;
  updateSpawnDates();
  render();
};
$("#startBtn").onclick=startTimers;
$("#stopBtn").onclick=stopTimers;

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

const bannerBtn=document.getElementById("bannerToggle");
function setBannerState(){
  const hidden=localStorage.getItem("bannerHidden")==="1";
  document.body.classList.toggle("banners-hidden",hidden);
  if(bannerBtn)bannerBtn.textContent=hidden?"Banner Göster":"Banner Gizle";
}
if(bannerBtn){
  bannerBtn.addEventListener("click",()=>{
    const now=document.body.classList.toggle("banners-hidden");
    localStorage.setItem("bannerHidden",now?"1":"0");
    bannerBtn.textContent=now?"Banner Göster":"Banner Gizle";
  });
  setBannerState();
}

if(typeof module!=="undefined")module.exports={UI,MVP_LIST,resetMvp};
