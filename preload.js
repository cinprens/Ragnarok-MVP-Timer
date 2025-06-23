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

function loadMvps() {
  if (existsSync(editPath)) {
    return readJson(editPath, []);
  }
  const base   = readJson(basePath, []);
  const custom = readJson(customPath, []);
  return base.concat(custom);
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
  on: (ch, cb) => ipcRenderer.on(ch, (_e, data) => cb(data)),
  openOptions: () => ipcRenderer.invoke("open-options")
});
