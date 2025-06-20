# Ragnarok MVP Sayaç

Bu uygulama Ragnarok Online oyunundaki MVP canavarlarının doğma zamanlarını takip etmek için hazırlanmıştır. Dakika cinsinden zamanlayıcı ekleyerek sonraki doğuşu izleyebilir, tamamlanan süreler geçmiş listesine eklenir.

## Çalıştırma

1. Depoyu klonlayın veya indirin.
2. `index.html` dosyasını modern bir tarayıcıyla açın.
3. "MVP" alanına canavar adını, "Dakika" alanına beklenen süresini yazın ve **Ekle** düğmesine basın.
4. Sağdaki listeden hazır MVP adlarını seçerek de zamanlayıcı oluşturabilirsiniz.

Zaman dolduğunda seçtiğiniz ses dosyası çalınır ve kart kırmızı renge döner.

## Geliştirici Talimatları

- Testleri çalıştırmak için `npm test` komutunu kullanın.
- Kod düzenlemelerinde ESLint kuralları uygulanmalıdır.
- `script.js` içinde `mvpData` dizisi ile yeni canavarlar ekleyebilirsiniz.

## Arayüz

Aşağıdaki örnek kart tipik bir zamanlayıcı görünümünü gösterir:

![Örnek](MVP%20Giff/DRACULA.gif)

Kart üstünde kalan süre, tahmini doğuş saati ve silme/taşıma düğmeleri bulunur.
