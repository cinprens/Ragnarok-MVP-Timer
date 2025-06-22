import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('api', {
  // Gerektiğinde renderer’a işlev aç
});
