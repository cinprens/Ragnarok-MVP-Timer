const fs=require('fs');
let html;
beforeAll(()=>{html=fs.readFileSync('index.html','utf8');});
test('ana paneller mevcut',()=>{
  document.body.innerHTML=html;
  expect(document.getElementById('left')).not.toBeNull();
  expect(document.getElementById('mid')).not.toBeNull();
  expect(document.getElementById('right')).not.toBeNull();
});
