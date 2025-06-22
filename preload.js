import { contextBridge } from 'electron';
import fs from 'node:fs';
import path from 'node:path';

const base = process.cwd();
const gifDir = path.join(base, 'user_gifs');
if (!fs.existsSync(gifDir)) fs.mkdirSync(gifDir, { recursive: true });

function saveGif(src) {
  const name = Date.now() + '_' + path.basename(src);
  const dest = path.join(gifDir, name);
  fs.copyFileSync(src, dest);
  return dest.replace(/\\/g, '/');
}
function readData() {
  const p = path.join(base, 'user_mvp.json');
  if (!fs.existsSync(p)) return [];
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return []; }
}
function saveData(d) {
  const p = path.join(base, 'user_mvp.json');
  fs.writeFileSync(p, JSON.stringify(d, null, 2));
}

contextBridge.exposeInMainWorld('api', {
  saveGif,
  readData,
  saveData,
});
