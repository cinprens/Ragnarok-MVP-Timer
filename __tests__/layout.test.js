const fs=require('fs');
let css;
beforeAll(()=>{css=fs.readFileSync('style.css','utf8');});

test('esnek genislik degiskenleri',()=>{
  expect(css).toMatch(/--left-panel-width/);
  expect(css).toMatch(/--right-panel-width/);
});

test('mobil sorgu mevcut',()=>{
  expect(css).toMatch(/@media \(max-width: 600px\)/);
});

test('mobilde resizer gizli',()=>{
  expect(css).toMatch(/\.resizer\s*{[^}]*display:\s*none/);
});

test('mobilde banner statik',()=>{
  expect(css).toMatch(/position:\s*static/);
});
