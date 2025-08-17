# Shipments API — Hızlı Kontrat (MVP)

Bu doküman, Logistics/Shipments uç noktalarının kısa sözleşmesini özetler.

## Modeller (özet)
- Shipment
  - id, shipmentNumber (code), purchaseOrderId, carrier, trackingNumber (trackingNo), status, eta, incoterm,
    primaryMode (road/sea/air/rail/roro), vesselName, voyageNo, flightNo, truckPlate, trailerPlate,
    driverName, driverPhone, containerNumbersJson (array), totalGrossWeightKg, totalNetWeightKg, totalVolumeM3,
    totalPackages, transportInfo(json), sourcePackingList(json), consigneePackingList(json), createdAt, updatedAt
- ShipmentItem
  - id, shipmentId, purchaseOrderItemId, quantity

### Lojistik alt modeller (MVP)
- ShipmentCharge (sevkiyat masrafları)
  - shipmentId, type (freight, insurance, customs, handling...), description, amount, currency, taxCode?, meta
- ShipmentException (istisnalar)
  - shipmentId, code, severity, message, occurredAt, resolvedAt, meta
- ShipmentLeg (çok bacaklı taşıma)
  - shipmentId, legNo, originLocationId, destinationLocationId, mode (air/sea/road/rail), carrier, etd, eta, status
- TrackingEvent (takip olayları)
  - shipmentId veya legId, eventTime, status, locationId, description, source
- Sözlükler
  - Carrier: id, name, scac?, unLocode?
  - Location: id, name, countryCode, city, unLocode?
  - CustomsProcedure: id, code, description
  - Attachment: id, shipmentId, filename, mimeType, size, url/storageKey

Durum (status) örnekleri: `draft`, `in_transit`, `delivered`, `cancelled`.

## Uç Noktalar

### POST /api/shipments
Yeni sevkiyat oluşturur.
- Auth: required (Bearer)
- Body (örnek):
```json
{
  "purchaseOrderId": 123,
  "shipmentNumber": "SHP-2025-001",
  "carrier": "DHL",
  "trackingNumber": "TRK-001",
  "incoterm": "CIF",
  "primaryMode": "sea",
  "vesselName": "MSC Example",
  "voyageNo": "VOY1234",
  "containerNumbersJson": ["MSCU1234567"],
  "totalGrossWeightKg": 1240.5,
  "totalNetWeightKg": 1200,
  "totalVolumeM3": 8.75,
  "totalPackages": 50,
  "transportInfo": { "sealNo": "SEAL-9988" },
  "sourcePackingList": { "items": [] },
  "consigneePackingList": { "items": [] },
  "eta": "2025-08-20T00:00:00.000Z",
  "items": [
    { "purchaseOrderItemId": 456, "quantity": 10 }
  ]
}
```
- Response 201 (özet):
```json
{
  "id": 1,
  "code": "SHP-2025-001",
  "trackingNo": "TRK-001",
  "status": "preparing",
  "carrier": "DHL",
  "eta": "2025-08-20T00:00:00.000Z"
}
```

### GET /api/shipments
Sevkiyatları listeler (sayfalama ve filtreler ileride).
- Auth: required
- Query (opsiyonel):
  - `status`, `po` (mevcut taslaktan)
  - `incoterm` (string): Tam eşleşme filtresi (örn. FOB, CIF)
  - `open` (1|0): `1` ise sadece `openExceptions > 0` olanları döndürür
  - `q` (string): `trackingNumber`, `carrier`, `status` üzerinde LIKE araması
- Response 200: `[{ id, code, trackingNo, status, carrier, eta, openExceptions, ... }]`

### GET /api/shipments/:id
Sevkiyat detayını getirir.
- Auth: required
- Response 200: `{ id, code, trackingNo, status, carrier, eta, items: [...] }`

### Nested Entities (MVP)

Tüm uç noktalar Auth gerektirir ve `:shipmentId` geçerli bir sevkiyat olmalıdır. Yanıtlarda alan adları özetlenmiştir.

1) Shipment Legs

- GET /api/shipments/:shipmentId/legs → `[{ id, mode, origin, destination, eta, status }]`
- POST /api/shipments/:shipmentId/legs
  Body örnek:
  ```json
  { "mode": "road", "origin": "Gebze", "destination": "Ambarli", "eta": "2025-06-10T12:00:00Z" }
  ```
  Response 201: `{ id, shipmentId, mode, origin, destination, eta, status }`

2) Tracking Events

- GET /api/shipments/:shipmentId/events → `[{ id, status, eventTime, description }]`
- POST /api/shipments/:shipmentId/events
  Body örnek:
  ```json
  { "status": "in_transit", "eventTime": "2025-06-05T08:30:00Z", "description": "Istanbul TR" }
  ```
  Response 201: `{ id, shipmentId, status, eventTime, description }`

3) Charges (Masraflar)

- GET /api/shipments/:shipmentId/charges → `[{ id, type, description, amount, currency }]`
- POST /api/shipments/:shipmentId/charges
  Body örnek:
  ```json
  { "type": "freight", "amount": 1200.5, "currency": "USD" }
  ```
  Response 201: `{ id, shipmentId, type, amount, currency }`

4) Exceptions (Özel Durumlar)

- GET /api/shipments/:shipmentId/exceptions → `[{ id, code, severity, message, occurredAt, resolvedAt }]`
- POST /api/shipments/:shipmentId/exceptions
  Body örnek:
  ```json
  { "code": "delay", "severity": "low", "message": "Customs inspection" }
  ```
  Response 201: `{ id, shipmentId, code, severity, message, occurredAt }`
- PATCH /api/shipments/:shipmentId/exceptions/:id
  Body (parçalı): `{ severity?, message?, occurredAt?, resolvedAt? }`
  Not: UI’da resolvedAt toggle ile set/sil yapılır.

5) Notes (Notlar)

- GET /api/shipments/:shipmentId/notes → `[{ id, text, createdById, createdByName, createdAt }]`
- POST /api/shipments/:shipmentId/notes
  Body örnek:
  ```json
  { "text": "Kontrol edildi, evraklar hazır." }
  ```
  Response 201: `{ id, shipmentId, text, createdById, createdByName, createdAt }`
- DELETE /api/shipments/:shipmentId/notes/:noteId
  RBAC: `admin`, `satinalma_muduru`, `purchase_manager`, `procurement_manager` rolleri silebilir.
  Response 200: `{ ok: true }`
  Detaylı ortak sözleşme için bkz: `docs/API-NOTES.md`.

### PATCH /api/shipments/:id/status
Durum güncelleme.
- Auth: required
- Body: `{ "status": "in_transit" }`
- Response 200: `{ id, status, updatedAt }`

### GET /api/shipments/track/:trackingNumber
Takip numarasına göre bul.
- Auth: required (opsiyonel yapılabilir)
- Response 200: `{ id, code, trackingNo, status, carrier, eta }`

### PATCH /api/shipments/:shipmentId/legs/:id
Sevkiyat bacağı günceller (minimal parça güncelleme; ör. status/eta).
- Auth: required
- Body (örnek): `{ "status": "in_transit" }`

## Notlar
- `code` alanı `shipmentNumber`’ın frontend uyumlu takma adıdır.
- `trackingNo` alanı `trackingNumber`’ın takma adıdır.
- Nested varlıklar için alanlar minimal tutulmuştur; ilerleyen sürümlerde `carrierId`, `locationId`, `taxCode` vb. eklenecektir.
- PO/PO Item ilişkileri doğrulanmalı; quantity > 0 ve kalan miktar kuralları (ileriki sürümde zenginleşecek).
- Hata biçimi: `{ success:false, message:"..." }` (mevcut backend standardına uyumlu).

## Eskimiş (Deprecated)
- Tek alanlı `PATCH /api/shipments/:id/notes` uç noktası kaldırılmıştır. Yerine çoklu notlar alt kaynağını (`GET/POST/DELETE /api/shipments/:id/notes`) kullanın.
