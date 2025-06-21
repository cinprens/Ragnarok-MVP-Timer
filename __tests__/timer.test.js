const data = require('../mvpData.json');

test('json verisi bos degil',()=>{
  expect(Array.isArray(data)).toBe(true);
  data.forEach(d=>{
    expect(d.img).toBeTruthy();
  });
});

jest.useFakeTimers();

test('sayac azalir',()=>{
  const m={remaining:3};
  const id=setInterval(()=>{m.remaining--;},1000);
  jest.advanceTimersByTime(2000);
  clearInterval(id);
  expect(m.remaining).toBe(1);
});
