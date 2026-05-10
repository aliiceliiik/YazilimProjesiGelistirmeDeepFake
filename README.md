# Yazılım Projesi Geliştirme - DeepFake Detection

> Yazılım Projesi Geliştirme Dersi için Ortak Repository

Bu repository, **Deepfake Detection** projesinin tüm bileşenlerini içerir. Proje, bir görsel yükleyen kullanıcıya görselin gerçek mi yoksa yapay zeka tarafından üretilmiş bir deepfake mi olduğunu söyleyen uçtan uca bir sistemdir.

## Proje Yapısı

```
YazilimProjesiGelistirmeDeepFake/
├── backend/         # REST API (FastAPI + EfficientNetV2M)
├── frontend/        # Web Arayüzü (geliştirme aşamasında)
├── ml/              # Model eğitimi ve değerlendirme (geliştirme aşamasında)
├── docs/            # Proje dokümantasyonu
└── README.md
```

## Ekip

| Rol | Sorumlu | Klasör |
|-----|---------|--------|
| Scrum Master | - | - |
| Product Owner | - | - |
| Backend & API | Furkan İşık | `/backend` |
| Frontend | - | `/frontend` |
| ML & Model | Muhammet Ay | `/ml` |
| Veri & EDA | Ram Ismail | `/ml` |

## Mevcut Durum

**Sprint 4 - Backend & API Geliştirme**

| Görev | Durum |
|-------|-------|
| SCRUM-22: Web Framework Kurulumu | ✅ Tamamlandı |
| SCRUM-23: Model Entegrasyonu | ✅ Tamamlandı |
| SCRUM-24: API Endpoint Geliştirme | ✅ Tamamlandı |
| SCRUM-25: Görüntü İşleme Fonksiyonu | ✅ Tamamlandı |
| SCRUM-26: Hata Yönetimi | 🟡 Devam Ediyor |
| SCRUM-27: CORS Ayarları | ⏳ Yapılacak |

## Kurulum

Her bileşenin kendi `README.md` dosyası vardır, kurulum talimatları için ilgili klasöre bakın:

- [Backend Kurulumu](./backend/README.md)

## Teknolojiler

- **Backend:** Python 3.13, FastAPI, TensorFlow 2.21, EfficientNetV2M
- **Frontend:** (Belirlenecek)
- **Model:** EfficientNetV2M (Test Accuracy: %98.07)

## Lisans

Bu proje akademik amaçlı geliştirilmiştir.
