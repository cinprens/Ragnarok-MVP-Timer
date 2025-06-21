# Ragnarok MVP Sayaç

Bu uygulama Ragnarok Online oyunundaki MVP canavarlarının doğma zamanlarını takip etmek için hazırlanmıştır. Dakika cinsinden zamanlayıcı ekleyerek sonraki doğuşu izleyebilir, tamamlanan süreler geçmiş listesine eklenir.

## Çalıştırma

1. Depoyu klonlayın veya indirin.
2. `index.html` dosyasını modern bir tarayıcıyla açın.
3. "MVP" alanına canavar adını, "Dakika" alanına beklenen süresini yazın ve **Ekle** düğmesine basın.
4. Sağdaki listeden hazır MVP adlarını seçerek de zamanlayıcı oluşturabilirsiniz.

Zaman dolduğunda seçtiğiniz ses dosyası çalınır ve kart kırmızı renge döner.

### Python ile Yerel Sunucu

1. `npm install` komutunu çalıştırın.
2. `npm start` yazarak `server.py` dosyasını çalıştırın.
3. Tarayıcıda `http://localhost:3000` adresini açın.
4. Farklı bir port kullanmak için `PORT` ortam değişkenini ayarlayın.

## Geliştirici Talimatları

- Testleri çalıştırmadan önce `npm install` komutunu çalıştırın.
- Testleri çalıştırmak için `npm test` komutunu kullanın.
- Kod düzenlemelerinde ESLint kuralları uygulanmalıdır.
- `app.js` içinde `mvpData` dizisi ile yeni canavarlar ekleyebilirsiniz.

## Arayüz

Aşağıdaki örnek kart tipik bir zamanlayıcı görünümünü gösterir:

![Örnek](MVP%20Giff/DRACULA.gif)

Kart üstünde kalan süre, tahmini doğuş saati ve silme/taşıma düğmeleri bulunur.
