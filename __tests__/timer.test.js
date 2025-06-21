const data = require('../mvpData.json');
const times={
  "Beelzebub":46800,
  "Maya":9000,
  "Tao Gunka":5400,
  "Dracula":5400,
  "Orc Hero":4500,
  "Orc Lord":9900,
  "Doppelganger":9900,
  "Dark Lord":9900,
  "Evil Snake Lord":9900,
  "Amon Ra":4500,
  "White Lady":9000,
  "Mistress":9000,
  "Phreeoni":4500,
  "Osiris":4500,
  "Randgris":14400,
  "Moonlight Flower":4500,
  "Eddga":9000,
  "Baphomet":9000,
  "Golden Bug":4500,
  "Drake":9000,
  "Turtle General":4500,
  "Stormy Knight":9000,
  "Garm":9000
};

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

test('dogus sureleri',()=>{
  data.forEach(d=>{
    expect(d.respawn).toBe(times[d.name]);
  });
});
