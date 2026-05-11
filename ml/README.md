# `ml/` — Model Eğitimi ve Değerlendirme

Bu klasör, **Yazılım Projesi Geliştirme — Deepfake Detection** projesinin makine öğrenmesi modülüdür. **Scrum 1** (veri hazırlama + ilk model eğitimi) ve **Scrum 2** (ikinci model + karşılaştırma) çıktılarını içerir.

`backend/` klasöründeki FastAPI servisi, burada eğitilen **EfficientNetV2M** modelini production'da kullanır.

> Sorumlu: **Muhammet** — Model Eğitimi Modülü (Scrum 1 & 2)

---

## İçerik

| Dosya | Açıklama |
|---|---|
| `Scrum_1_ve_Scrum_2_Sonuçlar.ipynb` | Tüm eğitim hattının (data download → split → augment → train → eval) yer aldığı Jupyter notebook |
| `scrum_1_ve_scrum_2_egitim.py` | Aynı kodun `.py` formatına çevrilmiş hali (Colab/Jupyter'siz okumak isteyenler için) |
| `README.md` | Bu dosya |

> **Not:** Eğitilmiş model ağırlıkları (`best_xception.keras`, `best_efficientnetv2m.keras`) dosya boyutu nedeniyle bu repoda yer almıyor. "Model Ağırlıkları" başlığına bakın.

---

## Proje Özeti

Görüntünün **gerçek** mi yoksa **deepfake** mi olduğunu sınıflandıran ikili (binary) bir görüntü sınıflandırma sistemi. Transfer öğrenme yaklaşımıyla iki farklı önceden eğitilmiş CNN mimarisi karşılaştırıldı:

1. **Xception** (ImageNet ağırlıkları)
2. **EfficientNetV2M** (ImageNet ağırlıkları)

İkisinden iyi performans göstereni backend tarafına (FastAPI) servis edilmek üzere seçildi.

---

## Veri Seti

- **Kaynak:** [Kaggle — prithivsakthiur/deepfake-vs-real-20k](https://www.kaggle.com/datasets/prithivsakthiur/deepfake-vs-real-20k)
- **Toplam görüntü:** 19.219
  - Real: 9.643 (%50.2)
  - Deepfake: 9.576 (%49.8)
- **Sınıf dengesi:** Stratified split sayesinde her bölmede neredeyse 50/50 oran korunuyor.

### Split

| Bölme | Adet |
|---|---|
| Train | 15.375 (%80) |
| Validation | 1.922 (%10) |
| Test | 1.922 (%10) |

Bütün görüntüler **224×224** çözünürlüğe ölçeklendirilip JPEG olarak yeniden kaydedildi.

---

## Pipeline

```
Kaggle Dataset
      ↓
  Indirme (kagglehub)
      ↓
  Train / Val / Test split (80/10/10, stratified)
      ↓
  224×224 yeniden boyutlandırma + JPEG'e çevirme
      ↓
  tf.data pipeline
      ├── cache → augment → prefetch  (train)
      └── cache → prefetch            (val/test)
      ↓
  Model 1: Xception (transfer learning)
  Model 2: EfficientNetV2M (transfer learning)
      ↓
  Test set üzerinde değerlendirme
      ↓
  Karşılaştırma → Kazanan model
```

### Veri Artırma (Augmentation)

Sadece eğitim setine uygulandı:
- `RandomFlip("horizontal")`
- `RandomRotation(0.1)`
- `RandomZoom(0.1)`
- `RandomTranslation(0.1, 0.1)`

---

## Model Mimarileri

### 1) Xception
- ImageNet ağırlıklarıyla başlatıldı, `trainable = False`
- Üstüne: `GlobalAveragePooling2D → Dense(128, relu) → Dropout(0.5) → Dense(1, sigmoid)`
- Önişleme: `xception.preprocess_input` (Lambda katmanı, [0,255] → [-1,1])
- Toplam parametre: **21.123.881** (Eğitilebilir: 262.401)

### 2) EfficientNetV2M
- ImageNet ağırlıklarıyla başlatıldı, `trainable = False`
- Üstüne: `GlobalAveragePooling2D → Dense(128, relu) → Dropout(0.5) → Dense(1, sigmoid)`
- Önişleme: Built-in (model içinde, ham [0,255] besleniyor)
- Toplam parametre: **53.314.485** (Eğitilebilir: 164.097)

### Ortak Eğitim Ayarları
- **Optimizer:** Adam, lr = 1e-4
- **Loss:** Binary Crossentropy
- **Batch size:** 32
- **Epoch:** 15 (early stopping ile pratik olarak daha az)
- **Callbacks:**
  - `ModelCheckpoint` — val_accuracy'ye göre en iyiyi kaydet
  - `EarlyStopping` — val_loss üzerinden patience=5, ağırlıkları geri yükle
  - `ReduceLROnPlateau` — patience=3, factor=0.5, min_lr=1e-7

---

## Sonuçlar

| Metrik | Xception | EfficientNetV2M |
|---|---:|---:|
| En İyi Val Accuracy | 0.9703 | **0.9724** |
| Test Accuracy | 0.9729 | **0.9807** |
| Eğitim Süresi (dk) | **8.8** | 11.2 |
| Toplam Parametre | 21.123.881 | 53.314.485 |

### Sınıflandırma Raporları (Test Seti)

**Xception**
```
              precision    recall  f1-score   support
        Real     0.9780    0.9678    0.9729       964
    Deepfake     0.9680    0.9781    0.9730       958
    accuracy                         0.9729      1922
```

**EfficientNetV2M**
```
              precision    recall  f1-score   support
        Real       0.98      0.98      0.98       964
    Deepfake       0.98      0.98      0.98       958
    accuracy                           0.98      1922
```

### Kazanan: **EfficientNetV2M**

EfficientNetV2M, test accuracy'de **+%0.78** üstünlük ve daha dengeli precision/recall değerleri verdi. Production servisi için bu model seçildi → `../backend/` klasöründeki FastAPI uygulamasına entegre edildi.

---

## Çalışma Ortamı

- **Platform:** Google Colab (T4/L4 GPU)
- **TensorFlow:** 2.20.0
- **Python:** 3.12
- **XLA JIT:** Açık (`tf.config.optimizer.set_jit(True)`)

### Bağımlılıklar

```bash
pip install tensorflow==2.20.0 kagglehub scikit-learn matplotlib seaborn pillow tqdm
```

### Kaggle Erişimi

Notebook `kagglehub` üzerinden indirme yapıyor. Colab'da çalıştırıyorsan **Kaggle API key** ayarlanmış olmalı (Colab → Secrets → `KAGGLE_USERNAME`, `KAGGLE_KEY`).

---

## Notebook'u Çalıştırma

**Colab'da (önerilen):**
1. `Scrum_1_ve_Scrum_2_Sonuçlar.ipynb` dosyasını Colab'a yükle.
2. Runtime → Change runtime type → GPU (T4 yeterli, L4/A100 daha hızlı).
3. Kaggle secret'larını ekle.
4. Sırayla tüm hücreleri çalıştır (Runtime → Run all).

**Lokal makinede:**
- 16GB+ VRAM olan bir GPU şart (EfficientNetV2M ile eğitim ağır).
- Yoksa `batch_size=16`'ya düşürmek gerekebilir.

---

## Model Ağırlıkları

Eğitilmiş `.keras` dosyaları GitHub'a doğrudan yüklenemez:

| Dosya | Boyut | Durum |
|---|---:|---|
| `best_xception.keras` | ~84 MB | GitHub'ın yumuşak uyarı sınırı (50 MB) üzerinde |
| `best_efficientnetv2m.keras` | ~208 MB | GitHub'ın **sert sınırı (100 MB)** üzerinde — direkt push edilemez |

### Önerilen Çözüm: GitHub Releases

1. Repo ana sayfası → **Releases** → **Draft a new release**
2. Tag: `v1.0-scrum2-models`
3. İki `.keras` dosyasını sürükle bırak (Release attachments 2GB'a kadar destekler).
4. Yayınla. Backend `requirements.txt`'inde model URL'sini güncelle.

### Alternatif: Git LFS

```bash
git lfs install
git lfs track "*.keras"
git add .gitattributes
git add model_egitimi/*.keras
git commit -m "Add trained models via LFS"
git push
```

> Not: GitHub ücretsiz hesabında LFS için 1GB depo + 1GB/ay bant genişliği kotası var.

### Alternatif: HuggingFace Hub

Modelleri `huggingface_hub` ile yükle, sonra backend `from_pretrained` ile çekebilir.

---

## Sıradaki Adımlar

- [x] Scrum 1: Veri hazırlama + Xception eğitimi
- [x] Scrum 2: EfficientNetV2M eğitimi + karşılaştırma
- [ ] Scrum 3: Backend entegrasyonu — `../backend/` (FastAPI + EfficientNetV2M)
- [ ] Scrum 4: Frontend bağlantısı + canlı demo — `../frontend/`
- [ ] (Stretch) Fine-tuning: base modelin son katmanlarını da unfreeze edip daha yüksek accuracy denemesi

---

## Katkıda Bulunan

**Muhammet** — Model Eğitimi (Scrum 1 & Scrum 2)
