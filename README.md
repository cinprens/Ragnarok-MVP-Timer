# Ragnarok MVP Timer

This application tracks respawn times of MVP monsters in Ragnarok Online. You can add timers in minutes to watch the next spawn; completed timers move to the history list.

## Kullanım

1. Depoyu klonlayın.
2. `npm install` komutunu çalıştırın.
3. Geliştirme için `npm run dev` kullanın.
4. Üretim paketi için `npm run build` komutunu çalıştırın.
5. Geliştirme modunda dosya kaydedildikçe pencere otomatik yenilenir.

Zamanlayıcı sona erdiğinde seçtiğiniz ses çalar ve kart kırmızıya döner.

## Developer Notes

- Kod düzeni için `npm run lint` kullanın.
- Yeni canavar eklemek için `mvpData.json` dosyasını güncelleyin.
- Güncel bağımlılıklar: Electron 29 ve Luxon 3.4.4.

## Interface

The example below shows a typical timer card:

![Sample](MVP%20Giff/DRACULA.gif)

The card displays remaining time, estimated spawn time and buttons to reset or move it.
<!-- Clear browser cache to see updated files. -->
