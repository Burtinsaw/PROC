# SETPOINT / Yol Haritası — Satınalma (Frontend + Backend)

Güncellendi: 2025-08-17

## Genel Durum
- Sistem çalışır ve CI yeşil: Backend testler PASS, Frontend lint/test/build PASS.
- Lojistik (Sevkiyat) modülü temel ve alt varlıklarıyla birlikte aktif.
- Frontend’te Shipments listesi ve Shipment Detail (zaman çizelgesi, bacaklar, masraflar, istisnalar, notlar) hazır.

## Son Yapılanlar
- Backend güvenlik/stabilite sertleştirmeleri, loglama, rate limiting.
- Lojistik modülü:
  - Modeller: Shipment, ShipmentItem; alt modeller: ShipmentLeg, TrackingEvent, ShipmentCharge, ShipmentException ilişkilendirildi.
  - Rotalar: POST /shipments, GET /shipments, GET /shipments/:id, PATCH /shipments/:id/status, GET /shipments/track/:trackingNumber.
  - Nested rotalar: /:shipmentId/(legs|events|charges|exceptions) [GET/POST], ayrıca PATCH legs ve exceptions.
  - Yeni: PATCH /shipments/:id/notes (sevkiyat notları).
  - Response normalizasyonu: trackingNo (trackingNumber), code (shipmentNumber).
- Frontend
  - Shipments listesi: hızlı arama (300ms debounce), Incoterm filtresi, URL senkronizasyonu (?q, ?incoterm), seçim ve sadece seçili satırları CSV dışa aktarım, GridToolbar, “Filtreleri temizle”.
  - Shipment Detail: özet chip’ler, bacak/olay/masraf/istisna listeleri, tümü için hızlı-ekle formları, olay zaman çizelgesi, istisna inline düzenleme, “Çözüldü/Açık” toggle (resolvedAt), Notlar alanı (PATCH /notes ile kaydetme).
  - Alan hizalama: events.eventTime, exceptions.code; event formundaki lokasyon geçici olarak description’da tutuluyor.
- Test & CI
  - Frontend: CSV yardımcıları için birim testleri; tüm testler yeşil.
  - Backend: Smoke test Shipments nested varlıklar; tüm testler yeşil.

## Devam Eden / Bekleyen
- Exceptions için resolvedAt tarih etiketi UI’da gösterimi (opsiyonel rozet).
- Charges için inline düzenleme/silme.
- Zaman çizelgesinde ikon/renk iyileştirmeleri.
- Dış takip servisleri entegrasyonu (carrier API) ve Location/Carrier sözlüklerinin zenginleşmesi.

## Öncelikli Sonraki Adımlar (0–7 gün)
- [ ] Backend: Shipments endpoint’leri için minimal kontrat testleri (happy path + edge).
- [ ] Frontend: Shipments UX için boş/çok kayıt/arama senaryoları (unit/UI) ve küçük e2e smoke.
- [ ] Feature flag görünürlüğü: Logistics modülü açık/kapalı UI davranışı doğrulaması.
- [ ] Dokümantasyon: API sözleşmesi güncellemesi (status enum, fields), README bağlantıları.

## Lojistik (Sevkiyat) Modülü Durumu
- Backend
  - Rotalar aktif (feature flag: MODULE_LOGISTICS).
  - Modeller ve ilişkiler hazır; status/track/notes uçları mevcut.
- Frontend
  - Shipments listesi ve detay sayfası üretken kullanımda.

### Lojistik alt modeller (durum)
- ShipmentCharge
  - Tutar/currency alanlarıyla masraflar; ileride finance/landed-cost entegrasyonu.
- ShipmentException
  - Code/severity/message ve resolvedAt; UI’da çözüm toggle.
- ShipmentLeg
  - Mod/origin/destination/eta.
- TrackingEvent
  - eventTime/status/description (lokasyon geçici olarak description’da).
- Sözlükler
  - Carrier, Location, CustomsProcedure, Attachment: minimal şema planı.

## Kalite Kapıları (CI) — 2025-08-17
- Backend
  - Test: PASS (54/54 dosya, 97 test)
  - Lint/Build: Sorun yok.
- Frontend
  - Lint: PASS
  - Test: PASS (10/10 dosya, 26 test)
  - Build: PASS (Vite uyarıları: dinamik+statik import karışımı — kritik değil)

## Riskler ve Teknik Borçlar
- Shipments için kapsamlı doğrulama/hata yönetimi henüz sınırlı (edge’ler).
- Dinamik import uyarıları: Parçalama optimizasyonu sonraki sprintte.
- E2E test eksikliği: Kritik akışlarda manuel smoke’a bağımlılık.

## Feature Flags ve Ortam
- Modüller: procurement, logistics, finance, reporting, email — aktif.
- Logistics rotaları için MODULE_LOGISTICS açık olmalı.

## Sürümleme / Branch Stratejisi (öneri)
- Ana geliştirme: main/dev.
- Modül işleri: feature/logistics-<alt_kapsam>.
- Doküman güncellemeleri: docs/setpoint-<yyyyww> (opsiyonel) veya doğrudan main.

## Güncelleme Notu
Bu dosya haftalık “setpoint” olarak güncellenir. Her güncellemede:
- CI durum anlık fotoğrafı
- Yapılanlar/Yapılacaklar delta
- Riskler ve kararlar kısa kaydı

—
Bu sayfa proje için tekil “Setpoint” kaydıdır. Sorular/eklemeler için README ve issue/PR notlarına referans verebilirsiniz.
