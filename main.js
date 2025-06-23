import { app, BrowserWindow, Menu, ipcMain, screen } from "electron";
import { fileURLToPath } from "url";
import path from "node:path";
import { promises as fs, readFileSync, existsSync } from "node:fs";

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
function loadSettings() {
  try {
    const p = path.join(app.getPath("userData"), "userSettings.json");
    if (existsSync(p)) return JSON.parse(readFileSync(p, "utf-8"));
  } catch (e) {
    console.error("Failed to read settings", e);
  }
  return { resolution: "auto" };
}
const createWindow = () => {
  const settings = loadSettings();
  let width = 1920;
  let height = 1080;
  if (settings.resolution && settings.resolution !== "auto") {
    const [w, h] = settings.resolution.split("x").map(Number);
    if (w && h) { width = w; height = h; }
  } else {
    const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
    width = sw; height = sh;
  }
  mainWin = new BrowserWindow({
    width,
    height,
    minWidth: 1024,
    minHeight: 640,
    webPreferences: { preload: path.join(__dirname, "preload.js"), contextIsolation: true }
  });
  mainWin.loadFile(path.join(__dirname, "index.html"));
  mainWin.on("minimize", () => {
    mainWin.webContents.send("window-vis", false);
  });
  mainWin.on("restore", () => {
    mainWin.webContents.send("window-vis", true);
  });
  createMenu();
};

function createMenu() {
  const template = [
    { label: "Dosya", submenu: [{ label: "Çıkış", accelerator: "Alt+F4", role: "quit" }] },
    { label: "Görünüm", submenu: [
        { role: "reload", label: "Yenile" },
        { role: "forceReload", label: "Zorla Yenile" },
        { type: "separator" },
        { role: "resetZoom", label: "Zoom Sıfırla" },
        { role: "zoomIn", label: "Yakınlaştır" },
        { role: "zoomOut", label: "Uzaklaştır" },
        { type: "separator" },
        { role: "toggleDevTools", label: "Geliştirici Araçları" }
      ]},
    {
      label: "Ayarlar",
      accelerator: "Ctrl+,",
      click: () => openOptions()
    },
    { label: "Yardım", submenu: [{ label: "GitHub", click: () => require("electron").shell.openExternal("https://github.com/") }] }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function openOptions() {
  if (optionsWin && !optionsWin.isDestroyed()) {
    optionsWin.focus();
    return;
  }
  optionsWin = new BrowserWindow({
    width: 600,
    height: 700,
    parent: mainWin,
    modal: true,
    webPreferences: { preload: path.join(__dirname, "preload.js"), contextIsolation: true },
  });
  optionsWin.setMenu(null); // alt pencerede menu olmasın
  optionsWin.loadFile(path.join(__dirname, "options.html"));
}

ipcMain.handle("open-options", () => openOptions());

ipcMain.on("set-window-size", (_e, size) => {
  if (mainWin && size?.width && size?.height) {
    mainWin.setSize(size.width, size.height);
  }
});

ipcMain.handle("get-screen-size", () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  return { width, height };
});

// Renderer'a userData dizini yolunu döndürür
ipcMain.handle("get-user-data-path", () => app.getPath("userData"));


ipcMain.on("mvp-update", (_e, data) => {
  if (mainWin) mainWin.webContents.send("mvp-update", data);
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
