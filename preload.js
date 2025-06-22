const { contextBridge } = require('electron');
const fs   = require('fs');
const path = require('path');

const stockPath  = path.join(__dirname, 'mvpData.json'); // dev
const prodPath   = path.join(process.resourcesPath, 'mvpData.json'); // prod (.asar)
const filePath   = fs.existsSync(stockPath) ? stockPath : prodPath;

function loadMvps() {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) { console.error('MVP verisi okunamadı', e); return []; }
}

contextBridge.exposeInMainWorld('api', {
  getMvps: () => loadMvps()
});
