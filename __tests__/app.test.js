const fs=require('fs');
let html;
beforeAll(()=>{html=fs.readFileSync('index.html','utf8');});
test('ana paneller mevcut',()=>{
  document.body.innerHTML=html;
  expect(document.getElementById('left')).not.toBeNull();
  expect(document.getElementById('mid')).not.toBeNull();
  expect(document.getElementById('right')).not.toBeNull();
  expect(document.querySelector('#right #negativeList')).not.toBeNull();
});

test('negatif karta tasinir',async()=>{
  document.body.innerHTML=html;
  global.fetch=()=>Promise.resolve({json:()=>Promise.resolve([])});
  const mod=require('../app.js');
  mod.UI.left=document.getElementById('positiveList');
  mod.UI.right=document.querySelector('#right #negativeList');
  mod.MVP_LIST.length=0;
  mod.MVP_LIST.push({id:'X',file:'',map:'m',respawn:60,remaining:-1,running:false,tomb:false,tombTime:'',sprite(){return ''},mapImg(){return ''}});
  mod.UI.render();
  const li=document.querySelector('#negativeList li');
  expect(li).not.toBeNull();
  expect(li.classList.contains('negative')).toBe(true);
  expect(li.querySelector('button').textContent).toBe('Reset');
  expect(li.querySelector('.spawn-date')).not.toBeNull();
  mod.resetMvp(mod.MVP_LIST[0]);
  mod.UI.render();
  expect(document.querySelector('#positiveList li')).not.toBeNull();
});

test('kart secimi class ekler',()=>{
  document.body.innerHTML=html;
  const mod=require('../app.js');
  mod.UI.left=document.getElementById('positiveList');
  mod.UI.right=document.querySelector('#right #negativeList');
  mod.MVP_LIST.length=0;
  mod.MVP_LIST.push({id:'A',file:'',map:'m',respawn:60,remaining:10,running:false,tomb:false,tombTime:'',sprite(){return ''},mapImg(){return ''}});
  mod.UI.render();
  const li=document.querySelector('#positiveList li');
  li.click();
  const selectedLi=document.querySelector('#positiveList li');
  expect(selectedLi.classList.contains('selected')).toBe(true);
});

test('sag panel secimi orta panelde gosterir',()=>{
  document.body.innerHTML=html;
  const mod=require('../app.js');
  mod.UI.left=document.getElementById('positiveList');
  mod.UI.right=document.querySelector('#right #negativeList');
  mod.UI.gif=document.getElementById('mvpGif');
  mod.UI.time=document.getElementById('mvpTime');
  mod.UI.map=document.getElementById('mvpMap');
  mod.MVP_LIST.length=0;
  mod.MVP_LIST.push({id:'N',file:'x',map:'m',respawn:60,remaining:-5,running:false,tomb:false,tombTime:'',sprite(){return 's'},mapImg(){return 'p'}});
  mod.UI.render();
  const li=document.querySelector('#negativeList li');
  li.click();
  expect(mod.UI.current).toBe(mod.MVP_LIST[0]);
  expect(mod.UI.time.textContent).toBe('-00:05');
});
