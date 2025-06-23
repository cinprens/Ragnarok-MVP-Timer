import { app, BrowserWindow, Menu, ipcMain } from "electron";
import { fileURLToPath } from "url";
import path from "node:path";
import { promises as fs } from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔁 Hot reload sadece dev modda aktif
if (process.env.NODE_ENV === "development") {
  import("electron-reloader")
    .then(reloader => {
      reloader.default(module);
    })
    .catch(err => {
      console.warn("⚠️ Hot reload modülü yüklenemedi:", err);
    });
}

let mainWin;
let optionsWin;
const createWindow = () => {
  mainWin = new BrowserWindow({
    width: 1100,
    height: 800,
    webPreferences: { preload: path.join(__dirname, "preload.js"), contextIsolation: true }
  });
  mainWin.loadFile("index.html");
  createMenu();
};

function createMenu() {
  const template = [
    { label: "Dosya", submenu: [{ label: "Çıkış", accelerator: "Alt+F4", role: "quit" }] },
    { label: "Görünüm", submenu: [
        { label: "Yenile", accelerator: "Ctrl+R", role: "reload" },
        { label: "Geliştirici Araçları", accelerator: "Ctrl+Shift+I", role: "toggleDevTools" }
      ]},
    { label: "Yardım", submenu: [{ label: "GitHub", click: () => require("electron").shell.openExternal("https://github.com/") }] }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

const createOptionsWindow = () => {
  const win = new BrowserWindow({
    width: 600,
    height: 700,
    title: "MVP Ayarları",
    webPreferences: { preload: path.join(__dirname, "preload.js"), contextIsolation: true },
  });
  win.loadFile("options.html");
};

ipcMain.handle("open-options", () => {
  if (optionsWin && !optionsWin.isDestroyed()) {
    optionsWin.focus();
    return;
  }
  optionsWin = new BrowserWindow({
    width: 600,
    height: 700,
    parent: mainWin,
    webPreferences: { preload: path.join(__dirname, "preload.js"), contextIsolation: true },
  });
  optionsWin.loadFile("options.html");
});

ipcMain.handle("save-custom", async (_e, data) => {
  const file = path.join(app.getPath("userData"), "customMvps.json");
  try {
    await fs.writeFile(file, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (err) {
    console.error("Failed to save custom MVP data", err);
    return { success: false, error: err.message };
  }
});


ipcMain.on("mvp-update", (_e, data) => {
  if (mainWin) mainWin.webContents.send("mvp-update", data);
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
