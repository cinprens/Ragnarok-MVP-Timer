const fs=require("fs");
const html=fs.readFileSync("index.html","utf8");

jest.useFakeTimers();

test("blink efekti", async () => {
  document.body.innerHTML=html;
  global.fetch=()=>Promise.resolve({json:()=>Promise.resolve([])});
  const mod=await import("../app.js");
  mod.UI.left=document.getElementById("positiveList");
  mod.UI.right=document.querySelector("#right #negativeList");
  mod.UI.name=document.getElementById("mvpName");
  mod.UI.time=document.getElementById("mvpTime");
  mod.UI.map=document.getElementById("mvpMap");
  mod.UI.mapName=document.getElementById("mapName");
  mod.UI.gif=document.getElementById("mvpGif");
  mod.MVP_LIST.length=0;
  mod.MVP_LIST.push({id:"B",file:"",map:"m",respawn:60,remaining:60,running:true,tomb:false,tombTime:"",spawnUTC:Date.now()+60000,sprite(){return "";},mapImg(){return "";}});
  mod.UI.render();
  mod.step();

  expect(mod.MVP_LIST[0].blink).toBe(true);

  let li=document.querySelector(".mvp-row");
  const mid=document.querySelector("#mid-panel .mvp-stack");
  expect(li.classList.contains("blink")).toBe(true);
  expect(mid.classList.contains("blink")).toBe(true);
  for(let i=0;i<10;i++) mod.step();

  expect(mod.MVP_LIST[0].blink).toBe(false);

  li=document.querySelector(".mvp-row");
  expect(li.classList.contains("blink")).toBe(false);
  expect(mid.classList.contains("blink")).toBe(false);
});
