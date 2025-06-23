import { contextBridge, ipcRenderer } from "electron";
import { readFileSync, writeFileSync, existsSync, copyFileSync, mkdirSync, unlinkSync } from "fs";
import path from "path";

const basePath   = path.join(__dirname, "mvpData.json");
// Kullanıcı verileri dizini ana süreçten alınır
const userDir    = await ipcRenderer.invoke("get-user-data-path");
const customPath = path.join(userDir, "customMvps.json");
const editPath   = path.join(userDir, "mvpDataEdit.json");
const timersPath = path.join(userDir, "timers.json");
const userMaps   = path.join(userDir, "Maps");
const userMvps   = path.join(userDir, "MVP_Giff");

function readJson(file, defVal) {
  try {
    if (existsSync(file)) return JSON.parse(readFileSync(file, "utf-8"));
  } catch (err) {
    console.error("Failed to read", file, err);
  }
  return defVal;
}

function writeJson(file, data) {
  try {
    writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Failed to write", file, err);
  }
}

function mergeKey(m) {
  return `${m.name}-${m.map || ""}`;
}

function mergeMvpLists(base = [], custom = [], edits = []) {
  const map = new Map();
  base.forEach(m => map.set(mergeKey(m), m));
  custom.forEach(m => map.set(mergeKey(m), m));
  edits.forEach(m => map.set(mergeKey(m), m));
  return Array.from(map.values());
}

function loadMvps() {
  const base = readJson(basePath, []);
  const edits = readJson(editPath, []);
  const custom = readJson(customPath, []);
  return mergeMvpLists(base, custom, edits);
}

contextBridge.exposeInMainWorld("api", {
  getMvps: () => loadMvps(),
  readTimers: () => readJson(timersPath, null),
  writeTimers: data => writeJson(timersPath, data),
  readCustom: () => readJson(customPath, []),
  writeCustom: data => writeJson(customPath, data),
  readEdit: () => readJson(editPath, null),
  writeEdit: data => writeJson(editPath, data),
  resetEdit: () => { try { if (existsSync(editPath)) unlinkSync(editPath); } catch (e) { console.error("Failed to remove", editPath, e); } },
  copyMap: (src, name) => {
    try {
      if (!existsSync(userMaps)) mkdirSync(userMaps, { recursive: true });
      const dest = path.join(userMaps, name);
      copyFileSync(src, dest);
      return dest;
    } catch (err) {
      console.error("Failed to copy map", err);
      return null;
    }
  },
  copyMvp: (src, name) => {
    try {
      if (!existsSync(userMvps)) mkdirSync(userMvps, { recursive: true });
      const dest = path.join(userMvps, name);
      copyFileSync(src, dest);
      return dest;
    } catch (err) {
      console.error("Failed to copy MVP image", err);
      return null;
    }
  },
  updateMvps: data => ipcRenderer.send("mvp-update", data),
  on: (ch, cb) => ipcRenderer.on(ch, (_e, data) => cb(data)),
  openOptions: () => ipcRenderer.invoke("open-options"),
  setWindowSize: (w, h) => ipcRenderer.send("set-window-size", { width: w, height: h }),
  getScreenSize: () => ipcRenderer.invoke("get-screen-size")
});
export { mergeMvpLists, loadMvps };
