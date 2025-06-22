import { app, BrowserWindow, Menu, ipcMain } from 'electron';
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

let mainWin;
const createWindow = () => {
  mainWin = new BrowserWindow({
    width: 1000,
    height: 750,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  mainWin.loadFile('index.html');
};

const createOptionsWindow = () => {
  const win = new BrowserWindow({
    width: 700,
    height: 550,
    title: 'MVP Ayarları',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  win.loadFile('options.html');
};

const template = [
  {
    label: 'File',
    submenu: [
      { label: 'Options', accelerator: 'CmdOrCtrl+O', click: createOptionsWindow },
      { role: 'quit' },
    ],
  },
];

ipcMain.on('mvp-update', (_e, data) => {
  if (mainWin) mainWin.webContents.send('mvp-update', data);
});

app.whenReady().then(() => {
  createWindow();
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
});



app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
