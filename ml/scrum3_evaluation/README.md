# SCRUM-3: Model Karşılaştırma ve Optimizasyon

Bu klasör, Sprint 3 kapsamında yapılan **model karşılaştırma çalışmasının** sonuçlarını içerir. SCRUM-1 ve SCRUM-2'de eğitilen modeller (Xception ve EfficientNetV2M) test seti üzerinde değerlendirilmiş ve production için final model seçilmiştir.

---

## 📋 İçerik

| Dosya | Açıklama | İlgili Subtask |
|:------|:---------|:---------------|
| `comparison_metrics.csv` | Accuracy, Precision, Recall, F1-Score (weighted ve sınıf bazlı) | SCRUM-17 |
| `xception_confusion_matrix.png` | Xception confusion matrix görseli | SCRUM-18 |
| `efficientnetv2m_confusion_matrix.png` | EfficientNetV2M confusion matrix görseli | SCRUM-18 |
| `inference_speed.csv` | Inference hızı ölçümleri (ms/görsel, FPS) | SCRUM-19 |
| `inference_example.py` | Backend için kullanım örneği (Flask endpoint dahil) | SCRUM-21 |
| `model_card.md` | Final model dokümantasyonu (production ready) | SCRUM-21 |

---

## 🏆 Final Model: EfficientNetV2M

| Metrik | Değer |
|:-------|------:|
| Test Accuracy | **%98.07** |
| F1-Score (Weighted) | **0.9807** |
| Inference Time | **20.11 ms/görsel** |
| FPS | **49.72** |
| FPR | 2.28% |
| FNR | 1.57% |

---

## 📊 Karşılaştırma Özeti

| Model | Test Acc | F1 | Inference (ms) | Toplam Hata (1922 görsel) |
|:------|---------:|---:|---------------:|--------------------------:|
| Xception | 97.29% | 0.9729 | 9.19 | 52 |
| **EfficientNetV2M** | **98.07%** | **0.9807** | 20.11 | **37** |

---

## 🎯 Karar Gerekçeleri

EfficientNetV2M final model olarak seçildi çünkü:

1. **Daha yüksek doğruluk** — %0.78 daha iyi accuracy (15 daha az hata)
2. **Daha düşük FNR** — Deepfake'i kaçırma oranı %1.57 (Xception: %2.19)
3. **Hız kriteri rahatça geçildi** — 20 ms ≪ 2 sn (kriterden 99× hızlı)
4. **Deepfake tespitinde doğruluk kritik** — False Negative (kaçırılan Deepfake) en kötü hata türü

Xception 2.2× daha hızlı olsa da, bu fark web UI'da hissedilmez (her ikisi de < 50 ms). Üretim senaryosunda doğruluk belirleyici faktör oldu.

---

## 🔬 Test Seti

- **Kaynak:** Kaggle "deepfake-vs-real-20k"
- **Boyut:** 1922 görsel (964 Real + 958 Deepfake)
- **Split:** %80 train / %10 val / %10 test (stratified, seed=42)
- **Görsel boyutu:** 224×224, JPEG

---

## 🛠️ Kullanım

Backend entegrasyonu için `inference_example.py` dosyasına bakınız.

Hızlı başlangıç:

```python
import tensorflow as tf

# Model yükleme (GitHub Release'den indir)
model = tf.keras.models.load_model("best_efficientnetv2m.keras")

# Tahmin
prediction = model.predict(image_array)  # shape: (1, 224, 224, 3), [0-255]
is_deepfake = prediction[0][0] > 0.5
```

**⚠️ Önemli:**

- Girdi: RGB image, **[0-255] HAM** (normalize ETME)
- Preprocessing model içinde gömülü
- Çıktı: Sigmoid (0-1), threshold 0.5

Detaylar için: [`model_card.md`](./model_card.md)

---

## 📥 Model Dosyaları

Eğitilmiş model dosyaları (`.keras` format) projenin [GitHub Release](https://github.com/aliiceliiik/YazilimProjesiGelistirmeDeepFake/releases) bölümünden indirilebilir.

---

## 📚 İlgili Jira Subtask'leri

| ID | Konu | Durum |
|:---|:-----|:-----:|
| SCRUM-17 | Performans Metrikleri | ✅ Done |
| SCRUM-18 | Confusion Matrix Analizi | ✅ Done |
| SCRUM-19 | Inference Hızı Ölçümü | ✅ Done |
| SCRUM-20 | Final Model Seçimi | ✅ Done |
| SCRUM-21 | Model Export | ✅ Done |

---

## 👤 Yazar

**Ram Ismail** — Sprint 3 Model Evaluation

---

*Bu çalışma SCRUM-3 epic'inin parçasıdır. Detaylı tartışmalar ve teknik kararlar için Jira ticket'larına bakınız.*
