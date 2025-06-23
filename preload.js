import { contextBridge, ipcRenderer, app } from 'electron';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';

const basePath   = path.join(__dirname, 'mvpData.json');
const userDir    = app.getPath('userData');
const customPath = path.join(userDir, 'customMvps.json');
const timersPath = path.join(userDir, 'timers.json');

function readJson(file, defVal) {
  try {
    if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf-8'));
  } catch (err) {
    console.error('Failed to read', file, err);
  }
  return defVal;
}

function writeJson(file, data) {
  try {
    writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Failed to write', file, err);
  }
}

function loadMvps() {
  const base   = readJson(basePath, []);
  const custom = readJson(customPath, []);
  return base.concat(custom);
}

contextBridge.exposeInMainWorld('api', {
  getMvps: () => loadMvps(),
  readTimers: () => readJson(timersPath, null),
  writeTimers: data => writeJson(timersPath, data),
  readCustom: () => readJson(customPath, []),
  writeCustom: data => writeJson(customPath, data),
  on: (ch, cb) => ipcRenderer.on(ch, (_e, data) => cb(data)),
  openOptions: () => ipcRenderer.invoke('open-options')
});
