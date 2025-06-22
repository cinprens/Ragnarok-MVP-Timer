import { app, BrowserWindow } from 'electron';
import path from 'node:path';

if (process.env.NODE_ENV === 'development') {
  require('electron-reloader')(module); // eslint-disable-line global-require
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
