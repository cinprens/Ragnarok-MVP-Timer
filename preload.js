import { contextBridge, ipcRenderer } from 'electron';
import { readFileSync } from 'fs';
import path from 'path';

const basePath = path.join(__dirname, 'mvpData.json');

function loadMvps() {
  try {
    return JSON.parse(readFileSync(basePath, 'utf-8'));
  } catch (err) {
    console.error('Failed to read mvp data', err);
    return [];
  }
}

contextBridge.exposeInMainWorld('api', {
  getMvps: () => loadMvps(),
  on: (ch, cb) => ipcRenderer.on(ch, (_e, data) => cb(data)),
  saveCustom: data => ipcRenderer.invoke('save-custom', data),
  openOptions: () => ipcRenderer.invoke('open-options')
});
