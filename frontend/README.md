# `frontend/` — Deepfake Tespit Sistemi Web Arayüzü

Bu klasör, **Yazılım Projesi Geliştirme — Deepfake vs RealFace** projesinin kullanıcı arayüzü (frontend) modülüdür. Kullanıcının yüz görsellerini yüklemesine, yapay zeka modeli üzerinden analiz ettirmesine ve sonuçları görsel olarak incelemesine olanak tanıyan modern bir **Single Page Application (SPA)** içerir.

> Sorumlu: **İlhan Yanmaz** — Frontend (Web Arayüzü) Tasarımı (Scrum-5)

---

## İçindekiler

- [Proje Tanıtımı](#proje-tanıtımı)
- [Geliştirici Bilgisi](#geliştirici-bilgisi)
- [Tamamlanan Scrum Görevleri](#tamamlanan-scrum-görevleri)
- [Kullanılan Teknolojiler](#kullanılan-teknolojiler)
- [Proje Özellikleri](#proje-özellikleri)
- [Kurulum Adımları](#kurulum-adımları)
- [Proje Klasör Yapısı](#proje-klasör-yapısı)
- [API Haberleşmesi](#api-haberleşmesi)
- [Genel Değerlendirme](#genel-değerlendirme)

---

## Proje Tanıtımı

**Deepfake vs RealFace** projesi, derin öğrenme modellerini (EfficientNetV2M) kullanarak yüklenen yüz görsellerinin **gerçek** mi yoksa **yapay zeka tarafından üretilmiş (deepfake)** mi olduğunu tespit eden uçtan uca bir sistemdir.

Frontend modülü bu sistemin **kullanıcıyla doğrudan etkileşim kuran katmanıdır**. Projenin diğer modülleriyle ilişkisi:

```
ml/          → Model eğitimi (EfficientNetV2M, %98.07 doğruluk)
backend/     → FastAPI REST API (/predict endpoint'i)
frontend/    → Web arayüzü (bu klasör) ← Kullanıcı buradan erişir
```

### Kullanıcı Sistem Üzerinden Neler Yapabilir?

- Yüz görseli yükleme (sürükle-bırak veya dosya seçici)
- Yüklenen görselin otomatik ön izlemesini görme
- "Analiz Et" butonuyla deepfake tespiti başlatma
- **Gerçek** veya **Deepfake** sonucunu güven oranıyla birlikte görüntüleme
- Dark / Light tema arasında geçiş yapma
- Yeni bir analiz başlatma (önceki sonucu sıfırlama)

---

## Geliştirici Bilgisi

| Bilgi | Detay |
|-------|-------|
| **Ad Soyad** | İlhan Yanmaz |
| **Görev** | Scrum-5: Frontend (Web Arayüzü) Tasarımı |
| **Sorumluluk Alanı** | Arayüz tasarımı, bileşen geliştirme, API entegrasyonu, responsive düzen, kullanıcı deneyimi optimizasyonu |
| **Branch** | `frontend-ilhan` |

---

## Tamamlanan Scrum Görevleri

### Scrum-28 — Arayüz Tasarımı

Modern, profesyonel ve kullanıcı dostu bir web arayüzü tasarlandı. Tasarım sistemi **CSS Design Tokens** yaklaşımıyla oluşturuldu; renk paleti, border değerleri, border-radius, geçiş süreleri gibi tüm tasarım sabitleri `:root` seviyesinde CSS değişkenleri olarak tanımlandı.

**Öne çıkan tasarım özellikleri:**

- **Dark / Light Mod:** Kullanıcı tercihine göre tema geçişi. Tüm renkler CSS değişkenleriyle yönetildiği için geçiş anlık ve tutarlı.
- **Glassmorphism:** Üst navigasyon çubuğunda `backdrop-filter: blur(24px)` ile modern cam efekti.
- **Animated Background:** Radyal gradyan blob'lar ve subtle grid overlay ile canlı arka plan.
- **Micro-Animations:** Framer Motion kütüphanesiyle bileşenlere giriş/çıkış animasyonları, spring efektleri ve fade geçişleri uygulandı.
- **Design Token Sistemi:** `--bg`, `--brand`, `--ok`, `--err`, `--t1/t2/t3` gibi 20+ CSS değişkeni ile tutarlı renk yönetimi.

### Scrum-29 — Görsel Yükleme Modülü

`UploadBox` bileşeni, kullanıcının görselleri sisteme yüklemesi için geliştirildi. Endüstri standardı bir sürükle-bırak deneyimi sunar.

**Teknik detaylar:**

- **Sürükle-Bırak (Drag & Drop):** HTML5 Drag Events API kullanılarak gerçeklendi. `dragCounter` ref tekniğiyle iç-eleman kaynaklı flickering (titreme) sorunu tamamen önlendi.
- **Dosya Seçici:** Gizli `<input type="file">` elementi üzerinden tıklama ile dosya seçme desteği.
- **4 Katmanlı Doğrulama:**
  - Dosya formatı kontrolü (JPG, PNG, WebP, HEIC, BMP, TIFF)
  - Maksimum dosya boyutu kontrolü (10 MB)
  - Minimum dosya boyutu kontrolü (20 KB)
  - Minimum çözünürlük kontrolü (250×250 piksel)
- **Ön İzleme:** `FileReader` API ile yüklenen görsel anında ekranda gösterilir.
- **Kaldırma Butonu:** Yüklenen görselin üzerinde "✕" butonu ile temizleme imkanı.
- **HEIC/HEIF Desteği:** Windows'ta `application/octet-stream` olarak gelen HEIC dosyaları uzantı kontrolüyle tanınır.

### Scrum-30 — API Entegrasyonu

Frontend ile backend arasındaki iletişim, **Axios** HTTP istemcisi ve **Vite Proxy** mekanizması üzerinden kuruldu.

**Teknik detaylar:**

- **Axios Instance:** 30 saniye timeout ile yapılandırılmış merkezi HTTP istemcisi (`services/api.js`).
- **FormData:** Görsel `multipart/form-data` formatında `file` alanı altında gönderilir.
- **Vite Proxy:** `vite.config.js` içinde `/predict` yolu `http://localhost:8000`'e yönlendirilir. Bu sayede CORS sorunu yaşanmaz.
- **Response Mapping:** Backend'den gelen `data.label` → frontend'in kullandığı `prediction` alanına dönüştürülür.
- **Hata Yönetimi:** HTTP yanıt hatası (4xx/5xx), ağ hatası ve beklenmeyen hatalar ayrı ayrı yakalanır; kullanıcıya Türkçe hata mesajları gösterilir.

### Scrum-31 — Loading (Yükleniyor) Sistemi

Analiz süresince kullanıcıya görsel geri bildirim sağlayan `Loader` bileşeni geliştirildi.

**Bileşen içeriği:**

- **Çift Halka Spinner:** İç ve dış halkanın ters yönde döndüğü özel CSS animasyonu.
- **Nabız Metni:** "Analiz ediliyor…" yazısı `opacity` animasyonuyla nefes alıp verir.
- **Alt Açıklama:** "Yapay zeka modeli görüntüyü inceliyor" bilgi metni.
- **Zıplayan Noktalar:** 3 adet sıralı animasyonlu nokta — yükleme durumunu pekiştirir.
- **State Entegrasyonu:** `loading` state'i `true` olduğunda `AnimatePresence` ile yumuşak giriş, tamamlandığında yumuşak çıkış animasyonu.

### Scrum-32 — Sonuç Görselleştirme

Analiz tamamlandığında kullanıcıya sonucu gösteren `ResultCard` bileşeni geliştirildi.

**Görsel ve teknik detaylar:**

- **İkon ve Renk Kodlaması:** Gerçek görsel → yeşil tonlar + onay ikonu, deepfake → kırmızı tonlar + uyarı ikonu.
- **Animasyonlu Güven Sayacı:** `requestAnimationFrame` ile %0'dan hedef değere kübik ease-out eğrisiyle sayısal animasyon.
- **İlerleme Çubuğu (Progress Bar):** Framer Motion ile animasyonlu dolum + shimmer (ışıltı) efekti.
- **Güven Seviyesi Göstergesi:** %90+ "Yüksek güven", %70-89 "Orta güven", %70 altı "Düşük güven".
- **İki Sütunlu Düzen:** Sonuç geldiğinde yüklenen görsel sol sütunda, sonuç kartı sağ sütunda yan yana gösterilir.
- **Yasal Uyarı:** Sonuç altında "Bu sonuç bir yapay zeka modeli tarafından üretilmiştir ve kesin kanıt niteliği taşımaz." bilgilendirmesi.

### Scrum-33 — Responsive Tasarım

Uygulama, mobil cihazlardan masaüstü bilgisayarlara kadar tüm ekran boyutlarında düzgün görünecek şekilde tasarlandı.

**Responsive yaklaşımları:**

- **Fluid Typography:** `clamp()` fonksiyonu ile başlık boyutları ekran genişliğine göre otomatik ölçeklenir.
- **Mobile-First Media Query:** `@media (max-width: 640px)` ile mobil cihazlara özel padding, font boyutu ve spacing ayarları.
- **İki Sütunlu Layout:** Masaüstünde yan yana (flexbox), mobilde alt alta (column direction) geçiş yapar.
- **Touch-Friendly:** Buton ve etkileşimli alanlar minimum 44px yüksekliğe sahip.
- **Viewport Uyumu:** `100dvh` kullanımıyla mobil tarayıcı adres çubuğu sorunları önlendi (`100vh` fallback dahil).

---

## Kullanılan Teknolojiler

| Teknoloji | Versiyon | Kullanım Amacı |
|-----------|----------|---------------|
| **React** | 19.2.5 | UI bileşen kütüphanesi |
| **Vite** | 8.0.10 | Build aracı ve geliştirme sunucusu |
| **JavaScript (ES6+)** | — | Uygulama mantığı |
| **Framer Motion** | 12.38.0 | Animasyon ve geçiş efektleri |
| **Axios** | 1.16.0 | HTTP istemcisi (API haberleşmesi) |
| **Tailwind CSS** | 4.2.4 | Yardımcı CSS framework (eklenti olarak) |
| **Vanilla CSS** | — | Ana tasarım sistemi (design tokens) |
| **ESLint** | 10.2.1 | Kod kalite kontrolü |
| **Google Fonts (Inter)** | — | Tipografi |

---

## Proje Özellikleri

- ✅ **Görsel Yükleme:** Sürükle-bırak ve dosya seçici ile görsel yükleme
- ✅ **Dosya Doğrulama:** Format, boyut (20 KB – 10 MB) ve çözünürlük (250×250px) kontrolü
- ✅ **Deepfake Analizi:** Backend API'sine tek tıkla analiz isteği gönderme
- ✅ **Sonuç Görselleştirme:** Gerçek/Deepfake sonucu + animasyonlu güven yüzdesi
- ✅ **Dark / Light Mod:** Kullanıcı tercihine göre tema değiştirme
- ✅ **Responsive Tasarım:** Mobil, tablet ve masaüstü uyumluluğu
- ✅ **Animasyonlar:** Giriş/çıkış animasyonları, pulse efekti, shimmer efekti
- ✅ **Hata Yönetimi:** API hataları için kullanıcı dostu Türkçe mesajlar
- ✅ **Erişilebilirlik:** ARIA etiketleri, klavye navigasyonu, focus-visible desteği
- ✅ **SEO:** Meta etiketleri, semantic HTML, açıklayıcı başlıklar

---

## Kurulum Adımları

### Gereksinimler

- **Node.js** 18+ (önerilen: 20 LTS)
- **npm** 9+

### 1. Repoyu Klonla

```bash
git clone https://github.com/aliiceliiik/YazilimProjesiGelistirmeDeepFake.git
cd YazilimProjesiGelistirmeDeepFake
```

### 2. Frontend Klasörüne Geç

```bash
cd frontend
```

### 3. Bağımlılıkları Kur

```bash
npm install
```

### 4. Geliştirme Sunucusunu Başlat

```bash
npm run dev
```

### 5. Tarayıcıda Aç

```
http://localhost:5173
```

> **Not:** Deepfake analizi yapabilmek için backend sunucusunun da çalışıyor olması gerekir. Backend kurulumu için `../backend/README.md` dosyasına bakın.

### Diğer Komutlar

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Geliştirme sunucusunu başlatır (HMR aktif) |
| `npm run build` | Production build oluşturur (`dist/` klasörü) |
| `npm run preview` | Production build'i lokal olarak önizler |
| `npm run lint` | ESLint ile kod kalite kontrolü yapar |

---

## Proje Klasör Yapısı

```
frontend/
├── index.html                  # Ana HTML giriş noktası (SEO meta etiketleri dahil)
├── package.json                # Bağımlılıklar ve script tanımları
├── vite.config.js              # Vite yapılandırması (proxy ayarları dahil)
├── public/
│   ├── logo.svg                # Uygulama logosu (favicon)
│   ├── favicon.svg             # Alternatif favicon
│   └── icons.svg               # SVG ikon seti
└── src/
    ├── main.jsx                # React uygulamasının giriş noktası
    ├── App.jsx                 # Ana uygulama bileşeni (state, layout, tema)
    ├── index.css               # Tüm CSS: design tokens, reset, bileşen stilleri
    ├── components/
    │   ├── UploadBox.jsx       # Görsel yükleme bileşeni (drag & drop + validation)
    │   ├── ResultCard.jsx      # Analiz sonucu bileşeni (güven göstergesi)
    │   └── Loader.jsx          # Yükleniyor animasyonu bileşeni
    └── services/
        └── api.js              # Axios HTTP istemcisi ve API fonksiyonları
```

### Bileşen Sorumlulukları

| Bileşen | Dosya | Sorumluluk |
|---------|-------|-----------|
| `App` | `App.jsx` | Ana layout, state yönetimi, tema kontrolü, koşullu render |
| `UploadBox` | `UploadBox.jsx` | Dosya seçme, sürükle-bırak, doğrulama, ön izleme |
| `ResultCard` | `ResultCard.jsx` | Sonuç gösterimi, animasyonlu sayaç, ilerleme çubuğu |
| `Loader` | `Loader.jsx` | Yükleme animasyonu, kullanıcı geri bildirimi |
| `predictImage` | `api.js` | Backend API ile haberleşme |

---

## API Haberleşmesi

Frontend, backend ile **Vite Dev Server Proxy** üzerinden haberleşir. Bu sayede CORS (Cross-Origin Resource Sharing) sorunları yaşanmaz.

### İletişim Akışı

```
Kullanıcı (Tarayıcı)
    ↓  Görsel yükler + "Analiz Et" tıklar
Frontend (localhost:5173)
    ↓  POST /predict (FormData: file)
Vite Proxy
    ↓  İsteği yönlendirir
Backend (localhost:8000)
    ↓  Model tahmini yapar
    ↑  JSON response döner
Frontend
    ↑  Sonucu görselleştirir
Kullanıcı
    ↑  Sonucu görür
```

### Proxy Yapılandırması (`vite.config.js`)

```javascript
server: {
  proxy: {
    '/predict': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    },
  },
},
```

### İstek Formatı

```
POST /predict
Content-Type: multipart/form-data

Body: file = <görsel dosyası>
```

### Yanıt Formatı

```json
{
  "label": "Real" | "Deepfake",
  "confidence": 0.9807,
  "is_deepfake": false,
  "raw_score": 0.0193,
  "processing_time_ms": 387.4,
  "filename": "test.jpg"
}
```

### Frontend Dönüşümü (`api.js`)

Backend'den gelen `label` alanı, frontend'in kullandığı `prediction` alanına dönüştürülür:

```javascript
return {
  prediction: data.label,      // "Real" veya "Deepfake"
  confidence: data.confidence,  // 0-1 arası ondalık sayı
};
```

---

## Genel Değerlendirme

### Kod Yapısı

Frontend kodu, **bileşen tabanlı mimari** prensibiyle organize edilmiştir. Her bileşen tek bir sorumluluğa sahiptir (Single Responsibility Principle). State yönetimi React'in yerel `useState` ve `useCallback` hook'larıyla sağlanmakta; uygulamanın karmaşıklık seviyesi göz önünde bulundurularak ekstra state management kütüphanesi (Redux, Zustand vb.) kullanılmamıştır.

### Kullanıcı Deneyimi (UX)

- Sürükle-bırak alanı, endüstri standardı `dragCounter` tekniğiyle titremesiz çalışır.
- 4 katmanlı dosya doğrulaması, geçersiz dosyaların backend'e ulaşmasını önler.
- Animasyonlu güven göstergesi, kullanıcıya sonucun güvenilirliğini sezgisel şekilde iletir.
- Hata mesajları Türkçe ve açıklayıcıdır; kullanıcıyı çözüme yönlendirir.

### Performans

- **Vite** build aracı sayesinde anlık HMR (Hot Module Replacement) ve hızlı geliştirme deneyimi.
- `useCallback` ile gereksiz yeniden render'lar önlenir.
- CSS animasyonları GPU hızlandırmalı (`transform`, `opacity`) özellikler kullanır.
- Lazy evaluation ile sonuç kartı yalnızca analiz tamamlandığında DOM'a eklenir.

### Modern Tasarım Yaklaşımı

Proje, güncel web tasarım trendlerini yansıtmaktadır: glassmorphism efektleri, design token sistemi, micro-animasyonlar, dark/light mod desteği ve responsive layout. Tasarım, Stripe ve Vercel gibi profesyonel ürünlerden ilham alınarak oluşturulmuştur.

---

## Lisans

Bu proje **Kocaeli Üniversitesi Yazılım Projesi Geliştirme** dersi kapsamında akademik amaçlı geliştirilmiştir.
