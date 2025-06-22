const { contextBridge, ipcRenderer } = require("electron");
const fs = require("fs");
const path = require("path");

// mvpData.json konumu paketlenmis ve gelistirme modlari icin kontrol edilir
const asarPath = path.join(process.resourcesPath, "mvpData.json");
const localPath = path.join(__dirname, "mvpData.json");
const dataPath = fs.existsSync(asarPath) ? asarPath : localPath;
const userPath = path.join(
  process.env.APPDATA || process.env.HOME,
  "Ragnarok-MVP-Timer",
  "customMvps.json"
);

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
  },
  on(channel, cb) {
    ipcRenderer.on(channel, (_e, data) => cb(data));
  }
});
