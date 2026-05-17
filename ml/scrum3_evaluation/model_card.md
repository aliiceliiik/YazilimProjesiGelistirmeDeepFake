# Model Card: EfficientNetV2M Deepfake Detector

## Genel Bilgi
- **Model:** EfficientNetV2M (Transfer Learning, ImageNet)
- **Gorev:** Binary classification - Real vs Deepfake yuz tespiti
- **Test Accuracy:** 98.07%
- **F1-Score (Weighted):** 0.9807
- **Inference Time:** 20.11 ms/gorsel (T4 GPU)
- **Model Boyutu:** 217.2 MB (.keras format)

## Mimari
EfficientNetV2M (frozen) + GlobalAveragePooling2D + Dense(128, ReLU) + Dropout(0.5) + Dense(1, Sigmoid)
- Toplam parametre: ~53M
- Egitilebilir parametre: ~16K

## Girdi Formati
- **Tip:** RGB image
- **Boyut:** 224x224 piksel
- **Deger araligi:** [0, 255] (HAM, normalize ETME)
- **Onemli:** Built-in preprocessing var, ekstra normalization yapma

## Cikti Formati
- **Tip:** Sigmoid output (float, 0-1 arasi)
- **Yorum:**
  - 0.0 → Kesinlikle Real
  - 1.0 → Kesinlikle Deepfake
- **Threshold:** 0.5
- **Sinif etiketleri:** Real=0, Deepfake=1

## Egitim Verisi
- **Kaynak:** Kaggle "deepfake-vs-real-20k"
- **Toplam:** 19,219 gorsel (9643 Real + 9576 Deepfake)
- **Split:** 80% Train, 10% Val, 10% Test (stratified, seed=42)
- **Test set:** 1922 gorsel (964 Real + 958 Deepfake)

## Performans Metrikleri (Test Set)

| Metrik | Real | Deepfake | Genel |
|:-------|-----:|---------:|------:|
| Precision | 0.9843 | 0.9772 | 0.9807 |
| Recall | 0.9772 | 0.9843 | 0.9807 |
| F1-Score | 0.9807 | 0.9808 | 0.9807 |

### Confusion Matrix
|              | Tahmin: Real | Tahmin: Deepfake |
|--------------|-------------:|-----------------:|
| Gercek: Real | 942 | 22 |
| Gercek: Deepfake | 15 | 943 |

## Hata Oranlari
- **FPR (False Positive Rate):** 2.28% (Real → Deepfake)
- **FNR (False Negative Rate):** 1.57% (Deepfake → Real)

## Production Onerileri
- **Donanim:** GPU onerilen (CPU'da ~10-20x yavas)
- **RAM:** Min 4 GB (model + 1 batch)
- **Tek inference suresi:** ~20 ms (GPU)
- **Throughput:** 50 FPS (batch size 1)

## Mevcut Formatlar
- `best_efficientnetv2m.keras` (217 MB) - Keras 3 native
- `saved_model.zip` (434 MB) - TF SavedModel (TF Serving uyumlu)

## Kullanim Ornegi
Bkz. `inference_example.py`

## Sinirlamalar
- Sadece yuz icerikli gorseller icin egitildi
- 224x224'den cok kucuk gorseller resize ile bozulur
- Yeni nesil deepfake teknikleri (eg, diffusion-based) test edilmedi
- Beyaz olmayan tenli ornekler az olabilir (dataset bias)

## Versiyon
- v1.0 (5 May 2026)
- Egiten: MUHAMMET AY
- Export eden: Ram Ismail
