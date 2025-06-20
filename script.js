const mvpData=[
  {id:1,name:"Beelzebub",map:"abbey03",time:15,img:"MVP_Giff/BEELZEBUB_.gif"},
  {id:2,name:"Maya",map:"anthell02",time:25,img:"MVP_Giff/MAYA.gif"},
  {id:3,name:"Tao Gunka",map:"beach_dun",time:40,img:"MVP_Giff/TAO_GUNKA.gif"},
  {id:4,name:"Dracula",map:"gef_dun01",time:10,img:"MVP_Giff/DRACULA.gif"},
  {id:5,name:"Orc Lord",map:"gef_fild14",time:20,img:"MVP_Giff/ORC_LORD.gif"}
];
let selectedId=null;
function renderLeft(){
  leftContent.innerHTML=mvpData.map(m=>`<div class="row ${m.time<=0?'ended':''}" onclick="selectMVP(${m.id})"><img class="mvp" src="${m.img}" alt="${m.name}"><div><div>${m.name}</div><div>${m.map}</div><div>Kalan: ${m.time} dk</div></div></div>`).join("");
}
function renderUpcoming(){
  const u=mvpData.filter(m=>m.time>0).sort((a,b)=>a.time-b.time)[0];
  if(u){midContent.innerHTML=`<img class="big-img" src="${u.img}" alt="${u.name}"><div class="big-item">${u.name}</div><div>${u.map}</div><div>Kalan: ${u.time} dk</div>`;}else{midContent.innerHTML="";}
}
function renderRight(){
  const m=mvpData.find(x=>x.id===selectedId);
  if(!m){rightContent.innerHTML="";return;}
  rightContent.innerHTML=`<h3>${m.name}</h3><img class="big-img" src="${m.img}" alt="${m.name}"><div>${m.map}</div><div>Kalan: ${m.time} dk</div><h4>Loot:</h4><ul></ul>`;
}
function selectMVP(id){selectedId=id;renderRight();}
function tick(){
  mvpData.forEach(m=>{if(m.time>0)m.time--;});
  renderLeft();
  renderUpcoming();
  renderRight();
}
const leftContent=document.getElementById("left-content");
const midContent=document.getElementById("mid-content");
const rightContent=document.getElementById("right-content");
renderLeft();
renderUpcoming();
setInterval(tick,3000);

