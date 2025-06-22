import { MVP_LIST, UI, MVP, saveTimers, updateSpawnDates, updateKillPanel } from './app.js';

const mid=document.getElementById('mid-panel');
const btn=document.createElement('button');
btn.id='optionsBtn';
btn.textContent='Options';
mid.prepend(btn);

const panel=document.createElement('div');
panel.id='optionsPanel';
panel.classList.add('hidden');
panel.innerHTML=`<div class="opt-inner">
<h2>MVP Ayarları</h2>
<form id="optForm">
<input id="nameInput" placeholder="id">
<input id="mapInput" placeholder="map">
<input id="respInput" type="number" placeholder="dakika">
<input id="spriteInput" type="file" accept="image/gif">
<input id="mapGifInput" type="file" accept="image/gif">
<div class="prevs"><img id="sprPrev"><img id="mapPrev"></div>
<div class="form-btns"><button type="button" id="formSave">Kaydet</button><button type="button" id="formCancel">Kapat</button></div>
</form>
<h3>Kullanıcı MVP'leri</h3>
<ul id="userList"></ul>
<button id="resetAll">Varsayılana Sıfırla</button>
</div>`;
document.body.append(panel);

const nameInput=panel.querySelector('#nameInput');
const mapInput=panel.querySelector('#mapInput');
const respInput=panel.querySelector('#respInput');
const spriteInput=panel.querySelector('#spriteInput');
const mapGifInput=panel.querySelector('#mapGifInput');
const sprPrev=panel.querySelector('#sprPrev');
const mapPrev=panel.querySelector('#mapPrev');
const optForm=panel.querySelector('#optForm');

let data=window.api.readData();
let edit=-1;

function apply(){
  for(let i=MVP_LIST.length-1;i>=0;i--)if(MVP_LIST[i].user)MVP_LIST.splice(i,1);
  data.forEach(d=>{
    const m=new MVP({id:d.id,file:'',map:'',respawnMin:d.respawn,spritePath:'./'+d.sprite,mapPath:'./'+d.mapGif});
    m.user=true;
    MVP_LIST.push(m);
  });
  updateSpawnDates();
  UI.render();
  updateKillPanel();
  saveTimers();
}

function render(){
  const ul=document.getElementById('userList');
  ul.innerHTML='';
  data.forEach((d,i)=>{
    const li=document.createElement('li');
    li.innerHTML=`${d.id} (${d.map}) <button data-e="${i}">Düzenle</button> <button data-d="${i}">Sil</button>`;
    ul.append(li);
  });
}

btn.onclick=()=>{panel.classList.remove('hidden');render();};
panel.addEventListener('click',e=>{
  if(e.target.id==='formCancel')panel.classList.add('hidden');
  if(e.target.dataset.e){
    edit=+e.target.dataset.e;
    const d=data[edit];
    nameInput.value=d.id;
    mapInput.value=d.map;
    respInput.value=d.respawn;
    sprPrev.src='./'+d.sprite;
    mapPrev.src='./'+d.mapGif;
  }
  if(e.target.dataset.d){
    data.splice(+e.target.dataset.d,1);
    window.api.saveData(data);
    apply();
    render();
  }
});

document.getElementById('spriteInput').addEventListener('change',ev=>{sprPrev.src=URL.createObjectURL(ev.target.files[0]);});
document.getElementById('mapGifInput').addEventListener('change',ev=>{mapPrev.src=URL.createObjectURL(ev.target.files[0]);});

document.getElementById('formSave').onclick=()=>{
  const n=nameInput.value.trim();
  const m=mapInput.value.trim();
  const r=parseInt(respInput.value,10);
  if(!n||!m||isNaN(r))return;
  let sp=edit>=0?data[edit].sprite:'';
  let mp=edit>=0?data[edit].mapGif:'';
  if(spriteInput.files[0])sp=window.api.saveGif(spriteInput.files[0].path);
  if(mapGifInput.files[0])mp=window.api.saveGif(mapGifInput.files[0].path);
  const obj={id:n,map:m,respawn:r,sprite:sp,mapGif:mp};
  if(edit>=0)data[edit]=obj;else data.push(obj);
  window.api.saveData(data);
  apply();
  render();
  optForm.reset();
  sprPrev.src='';
  mapPrev.src='';
  edit=-1;
};

document.getElementById('resetAll').onclick=()=>{
  data=[];
  window.api.saveData(data);
  apply();
  render();
};

apply();
