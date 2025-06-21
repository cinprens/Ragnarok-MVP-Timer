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
  mod.resetMvp(mod.MVP_LIST[0]);
  mod.UI.render();
  expect(document.querySelector('#positiveList li')).not.toBeNull();
});
