const fs=require('fs');
let css;
beforeAll(()=>{css=fs.readFileSync('style.css','utf8');});

test('esnek genislik degiskenleri',()=>{
  expect(css).toMatch(/--left-panel-width/);
  expect(css).toMatch(/--right-panel-width/);
});
