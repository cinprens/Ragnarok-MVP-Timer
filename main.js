import { app, BrowserWindow } from 'electron';
import { fileURLToPath } from 'url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔁 Hot reload sadece dev modda aktif
if (process.env.NODE_ENV === 'development') {
  import('electron-reloader')
    .then(reloader => {
      reloader.default(module);
    })
    .catch(err => {
      console.warn('⚠️ Hot reload modülü yüklenemedi:', err);
    });
}

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1000,
    height: 750,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadFile('index.html');
};

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
