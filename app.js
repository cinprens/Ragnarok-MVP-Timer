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
const mvpData=[
  ["AMON_RA","AMON_RA.gif","moc_pryd04",60],
  ["BAPHOMET","BAPHOMET.gif","prt_maze03",120],
  ["BEELZEBUB_","BEELZEBU_.gif","abbey03",720],
  ["DARK_LORD","DARK_LORD.gif","gl_chyard",120],
  ["DOPPELGANGER","DOPPELGANGER.gif","prt_sewb4",120],
  ["DRACULA","DRACULA.gif","gef_dun01",60],
  ["DRAKE","DRAKE.gif","treasure02",120],
  ["EDDGA","EDDGA.gif","pay_fild10",120],
  ["Evil Snake Lord","Evil Snake Lord.gif","lou_dun03",60],
  ["GARM","GARM.gif","xmas_fild01",120],
  ["GOLDEN_BUG","GOLDEN_BUG.gif","pay_dun04",60],
  ["KTULLANUX","KTULLANUX.gif","odin_tem03",120],
  ["MAYA","MAYA.gif","anthell02",120],
  ["MISTRESS","MISTRESS.gif","gon_dun03",120],
  ["MOONLIGHT","MOONLIGHT.gif","mjolnir_04",120],
  ["ORC_LORD","ORC_LORD.gif","gef_fild14",60],
  ["ORK_HERO","ORK_HERO.gif","gef_fild03",60],
  ["OSIRIS","OSIRIS.gif","in_sphinx5",60],
  ["Pharaoh","Pharaoh.gif","in_sphinx5",60],
  ["PHREEONI","PHREEONI.gif","moc_fild17",60],
  ["RANDGRIS","RANDGRIS.gif","tur_dun04",240],
  ["STORMKNIGHT","STORMKNIGHT.gif","xmas_dun02",120],
  ["TAO_GUNKA","TAO_GUNKA.gif","beach_dun",60],
  ["THANATOS","THANATOS.gif","tha_t02",120],
  ["TURTLE_GENERAL","TURTLE GENERAL.gif","tur_dun04",60],
  ["White Lady","White Lady.gif","lou_dun03",60]
];
const MVP_LIST=mvpData.map(([id,file,map,resp])=>new MVP({id,file,map,respawnMin:resp}));
const $=s=>document.querySelector(s);
// TODO: layout v2
const leftUl=$("#positiveList");
const rightUl=$("#negativeList");
const mvpGif=$("#mvpGif"),mvpName=$("#mvpName"),mvpMap=$("#mvpMap"),mvpTime=$("#mvpTime");
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
  m.tomb=!m.tomb;
  if(m.tomb)m.remaining+=600;
  li.classList.toggle("tomb-active",m.tomb);
  render();
}
function setCurrent(m){
  mvpGif.src=m.sprite();
  mvpName.textContent=m.id;
  mvpMap.innerHTML=`<img src="${m.mapImg()}" class="mvp-mapThumb"> ${m.map}`;
  mvpTime.textContent=fmt(m.remaining);
}
function clearCurrent(){mvpGif.src="";mvpName.textContent="";mvpMap.innerHTML="";mvpTime.textContent="";}
setInterval(()=>{MVP_LIST.forEach(m=>{m.remaining--;if(m.remaining===0)flashRow(m);});render();},1000);
function flashRow(m){
  setTimeout(()=>{const li=[...document.querySelectorAll(".mvp-row")].find(el=>el.textContent.includes(m.id));li&&li.classList.add("flash");setTimeout(()=>li&&li.classList.remove("flash"),300);},20);
}
$("#setBtn").onclick=()=>{
  if(!selected){alert("Önce listeden bir MVP seç.");return;}
  const dk=parseInt($("#minInput").value||0),sn=parseInt($("#secInput").value||0);
  if(isNaN(dk)||isNaN(sn)||sn<0||sn>59){alert("Süre hatalı");return;}
  selected.remaining=dk*60+sn;selected.tomb=false;render();
};
render();
