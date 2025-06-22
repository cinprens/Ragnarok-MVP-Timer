const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

// mvpData.json, asar icinde olabilecegi icin kosullu yol
const dataPath = path.join(process.resourcesPath, 'mvpData.json');
const userPath = path.join(process.env.APPDATA || process.env.HOME, 'Ragnarok-MVP-Timer', 'customMvps.json');

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return [];
  }
}

contextBridge.exposeInMainWorld('api', {
  getMvps() {
    const stock = readJson(dataPath);
    const custom = readJson(userPath);
    return [...stock, ...custom];
  },
  openOptions() {
    ipcRenderer.invoke('open-options');
  },
  saveCustom(data) {
    fs.mkdirSync(path.dirname(userPath), { recursive: true });
    fs.writeFileSync(userPath, JSON.stringify(data, null, 2));
  },
  onTimer(cb) {
    ipcRenderer.on('timer‑tick', (_, t) => cb(t));
  }
});
