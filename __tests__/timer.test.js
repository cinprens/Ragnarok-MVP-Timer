import { jest } from "@jest/globals";
import fs from "fs";
const data = JSON.parse(fs.readFileSync("./mvpData.json", "utf8"));
global.fetch=()=>Promise.resolve({json:()=>Promise.resolve([])});
const times = {
  Beelzebub: [720],
  Maya: [120],
  "Tao Gunka": [300],
  Dracula: [60],
  "Orc Hero": [60],
  "Orc Lord": [120],
  Doppelganger: [120, 480],
  "Dark Lord": [120],
  "Evil Snake Lord": [120],
  "Amon Ra": [60],
  "White Lady": [90],
  Mistress: [60],
  Phreeoni: [60],
  Osiris: [60],
  Randgris: [240],
  "Moonlight Flower": [60],
  Eddga: [120],
  Baphomet: [120],
  "Golden Bug": [60],
  Drake: [60],
  "Turtle General": [60],
  "Stormy Knight": [120],
  Garm: [120],
  Vesper: [120],
  Samurai: [95],
  "RSX 0806": [125],
  Kiel: [120],
  Ifrit: [660],
  "Lord of Death ": [133]
};

test("json verisi bos degil",()=>{
  expect(Array.isArray(data)).toBe(true);
  data.forEach(d=>{
    expect(d.img).toBeTruthy();
  });
});

jest.useFakeTimers();

test("sayac azalir",()=>{
  const m={remaining:3};
  const id=setInterval(()=>{m.remaining--;},1000);
  jest.advanceTimersByTime(2000);
  clearInterval(id);
  expect(m.remaining).toBe(1);
});

test("step fonksiyonu sayaci azaltir",async()=>{
  const mod=await import("../app.js");
  mod.MVP_LIST.length=0;
  mod.MVP_LIST.push({id:"X",file:"",map:"",respawn:60,remaining:5,running:true,tomb:false,tombTime:"",spawnUTC:Date.now()+5000});
  mod.step();
  expect(mod.MVP_LIST[0].remaining).toBe(4);
});

test("dogus sureleri",()=>{
  data.forEach(d => {
    const expectVal = times[d.name];
    if (Array.isArray(expectVal)) {
      expect(expectVal).toContain(d.respawn);
    } else {
      expect(d.respawn).toBe(expectVal);
    }
  });
});
