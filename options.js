const nameInput=document.getElementById('nameInput');
const mapInput=document.getElementById('mapInput');
const respInput=document.getElementById('respInput');
const spriteInput=document.getElementById('spriteInput');
const mapGifInput=document.getElementById('mapGifInput');
const sprPrev=document.getElementById('sprPrev');
const mapPrev=document.getElementById('mapPrev');
const form=document.getElementById('optForm');
const listEl=document.getElementById('mvpList');

let list=[];
let userData=[];
let edit=-1;

function render(){
  listEl.innerHTML='';
  list.forEach((d,i)=>{
    const li=document.createElement('li');
    const del=d.builtIn?'':` <button data-del="${i}">Sil</button>`;
    li.innerHTML=`${d.id} (${d.map}) <button data-edit="${i}">Düzenle</button>${del}`;
    listEl.append(li);
  });
}

function send(){
  const arr=list.map(d=>({id:d.id,file:d.file,map:d.map,respawn:d.respawn,spritePath:d.spritePath,mapPath:d.mapPath,builtIn:d.builtIn}));
  window.api.saveData(userData);
  window.api.send('mvp-update',arr);
}

function load(){
  fetch('mvpData.json')
    .then(r=>r.json())
    .then(arr=>{
      list=arr.map(d=>({
        id:d.name,
        file:d.img.replace('MVP_Giff/',''),
        map:d.map,
        respawn:d.respawn/60,
        spritePath:`./${d.img}`,
        mapPath:`./${d.mapImg}`,
        builtIn:true
      }));
      userData=window.api.readData();
      userData.forEach((u,i)=>{
        list.push({id:u.id,file:'',map:u.map,respawn:u.respawn,spritePath:`./${u.sprite}`,mapPath:`./${u.mapGif}`,builtIn:false,userIndex:i});
      });
      render();
      send();
    });
}

listEl.addEventListener('click',e=>{
  if(e.target.dataset.edit){
    edit=+e.target.dataset.edit;
    const d=list[edit];
    nameInput.value=d.id;
    mapInput.value=d.map;
    respInput.value=d.respawn;
    sprPrev.src=d.spritePath;
    mapPrev.src=d.mapPath;
  }
  if(e.target.dataset.del){
    const idx=+e.target.dataset.del;
    const d=list[idx];
    if(!d.builtIn){
      userData.splice(d.userIndex,1);
      list.splice(idx,1);
      list.forEach(x=>{if(!x.builtIn&&x.userIndex>d.userIndex)x.userIndex--;});
      send();
      render();
    }
  }
});

spriteInput.addEventListener('change',ev=>{sprPrev.src=URL.createObjectURL(ev.target.files[0]);});
mapGifInput.addEventListener('change',ev=>{mapPrev.src=URL.createObjectURL(ev.target.files[0]);});

document.getElementById('formSave').onclick=()=>{
  const id=nameInput.value.trim();
  const map=mapInput.value.trim();
  const r=parseInt(respInput.value,10);
  if(!id||!map||isNaN(r))return;
  let sp=edit>=0?list[edit].spritePath:'';
  let mp=edit>=0?list[edit].mapPath:'';
  if(spriteInput.files[0])sp=window.api.saveGif(spriteInput.files[0].path);
  if(mapGifInput.files[0])mp=window.api.saveGif(mapGifInput.files[0].path);
  if(edit>=0){
    const itm=list[edit];
    itm.id=id;itm.map=map;itm.respawn=r;itm.spritePath=sp;itm.mapPath=mp;
    if(!itm.builtIn) userData[itm.userIndex]={id,map,respawn:r,sprite:sp.replace('./',''),mapGif:mp.replace('./','')};
  }else{
    const obj={id,map,respawn:r,sprite:sp.replace('./',''),mapGif:mp.replace('./','')};
    userData.push(obj);
    list.push({id,map,respawn:r,spritePath:sp,mapPath:mp,builtIn:false,userIndex:userData.length-1,file:''});
  }
  form.reset();
  sprPrev.src='';
  mapPrev.src='';
  edit=-1;
  send();
  render();
};

document.getElementById('formCancel').onclick=()=>{window.close();};

document.getElementById('resetAll').onclick=()=>{
  userData=[];
  window.api.saveData(userData);
  load();
};

load();
