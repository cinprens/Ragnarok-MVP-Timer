import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';

export default {
  packagerConfig: {
    executableName: 'RagnarokMvpTimer',
    win32metadata: {
      CompanyName: 'Senin İsmin veya Takma Adın',
      FileDescription: 'Ragnarok MVP Timer – Zaman Takip Uygulaması',
      ProductName: 'Ragnarok MVP Timer'
    }
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      name: 'ragnarok_mvp_timer',
      setupIcon: './build/icon.ico', // İkon eklemek istersen buraya yerleştir
      loadingGif: './build/loading.gif' // opsiyonel, hoş bir geçiş görseli istersen
    }),
    new MakerZIP({}, ['win32']),
    new MakerDeb({}),
    new MakerRpm({})
  ]
};
