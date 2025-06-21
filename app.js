class MVP{
  constructor({id,file,map,respawnMin}){
    this.id=id;
    this.file=file;
    this.map=map;
    this.respawn=respawnMin*60;
    this.remaining=this.respawn;
    this.tomb=false;
  }
  sprite(){return `./MVP_Giff/${this.file}`;}
  mapImg(){return `./Maps/${this.map}.gif`;}
}
let MVP_LIST=[];
fetch("mvpData.json")
  .then(r=>r.json())
  .then(arr=>{
    MVP_LIST=arr.map(d=>new MVP({
      id:d.name,
      file:d.img.replace("MVP_Giff/",""),
      map:d.map,
      respawnMin:d.respawn/60
    }));
    render();
  });
const $=s=>document.querySelector(s);
// TODO: layout v2
const leftUl=$("#positiveList");
const rightUl=$("#negativeList");
const gifEl=$("#mvpGif");
const timeEl=$("#mvpTime");
const mapEl=$("#mvpMap");
let current=null;
let selected=null;
const fmt=s=>`${s<0?"-":""}${String(Math.floor(Math.abs(s)/60)).padStart(2,"0")}:${String(Math.abs(s)%60).padStart(2,"0")}`;
function render(){
  const pos=MVP_LIST.filter(m=>m.remaining>=0).sort((a,b)=>a.remaining-b.remaining);
  const neg=MVP_LIST.filter(m=>m.remaining<0).sort((a,b)=>a.remaining-b.remaining);
  leftUl.innerHTML="";pos.forEach(m=>leftUl.append(makeLi(m,true)));
  rightUl.innerHTML="";neg.forEach(m=>rightUl.append(makeLi(m,false)));
  if(pos[0])setCurrent(pos[0]);else clearCurrent();
}
function makeLi(m,positive){
  const li=document.createElement("li");
  li.className=`mvp-row ${positive?"positive":"negative"}${m.tomb?" tomb-active":""}`;
  li.onclick=()=>{selected=m;};
  const img=document.createElement("img");
  img.className="sprite";img.src=m.sprite();
  const info=document.createElement("div");info.style.flex=1;info.innerHTML=`<strong>${m.id}</strong><br>${m.map}`;
  const map=document.createElement("img");map.className="mvp-mapThumb";map.src=m.mapImg();
  const time=document.createElement("div");time.className="mvp-timer";time.textContent=fmt(m.remaining);
  const tomb=document.createElement("img");tomb.className="tomb";tomb.src="./MVP_Giff/MOB_TOMB.gif";tomb.onclick=e=>{e.stopPropagation();toggleTomb(m,li);};
  li.append(img,info,map,time,tomb);
  return li;
}
function toggleTomb(m,li){
  m.tomb = !m.tomb;
  if (m.tomb) m.remaining += 600;
  li.classList.toggle("tomb-active", m.tomb);
  render();
}

function setCurrent(m){
  current=m;
  gifEl.src=m.sprite();
  timeEl.textContent=fmt(m.remaining);
  mapEl.src=m.mapImg();
}
function clearCurrent(){
  current=null;
  gifEl.src=timeEl.textContent=mapEl.src="";
}

setInterval(()=>{
  MVP_LIST.forEach(m=>m.remaining--);
  if(current) timeEl.textContent=fmt(current.remaining);
  render();
},1000);

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
  render();
};
