# Notlar (Notes) API — Ortak Sözleşme

Bu belge, çoklu notlar yapısının tüm modüllerdeki ortak sözleşmesini açıklar. Aşağıdaki varlıklar aynı desenle çalışır:

- RFQ: `/api/rfqs/:id/notes`
- Satınalma Siparişi (Purchase Order): `/api/purchase-orders/:id/notes`
- Talep (Talepler): `/api/talepler/:id/notes`
- Sevkiyat (Shipment): `/api/shipments/:id/notes`

Genel kurallar:
- Auth: Gerekli (Bearer JWT)
- Yanıt biçimi (liste öğesi): `{ id, text, createdById, createdByName, createdAt }`
  - Bazı yanıtlarda bağlam için `rfqId`/`purchaseOrderId`/`talepId`/`shipmentId` eklenebilir.
- Sıralama: Varsayılan olarak `createdAt` artan (eski → yeni).
- Silme RBAC: Yalnızca şu rollerdeki kullanıcılar silebilir: `admin`, `satinalma_muduru`, `purchase_manager`, `procurement_manager`.

## Uç Noktalar

### GET /api/<entity>/:id/notes
Belirtilen varlık için notları getirir.

- Örnek (Shipments): `GET /api/shipments/1/notes`
- Response 200 (örnek):
```json
[
  {
    "id": 10,
    "text": "Kontrol edildi, evraklar hazır.",
    "createdById": 3,
    "createdByName": "Ali Yılmaz",
    "createdAt": "2025-08-17T10:15:00.000Z"
  }
]
```

### POST /api/<entity>/:id/notes
Yeni bir not ekler.

- Body (örnek):
```json
{ "text": "Gümrük randevusu alındı." }
```
- Response 201 (örnek):
```json
{
  "id": 11,
  "text": "Gümrük randevusu alındı.",
  "createdById": 3,
  "createdByName": "Ali Yılmaz",
  "createdAt": "2025-08-17T12:30:00.000Z"
}
```

Validasyon notu: `text` zorunludur, boş olamaz. Sistem, `createdById` ve `createdByName` alanlarını oturumdan otomatik doldurur.

### DELETE /api/<entity>/:id/notes/:noteId
Bir notu siler (RBAC gerektirir).

- RBAC: Sadece `admin`, `satinalma_muduru`, `purchase_manager`, `procurement_manager` rolleri.
- Response 200: `{ "ok": true }`

## Hata Biçimi
Tüm uç noktalarda standart hata yapısı korunur: `{ success: false, message: "..." }`

Sık karşılaşılan durumlar:
- 401 Unauthorized: Geçersiz/eksik token.
- 403 Forbidden: Not silme yetkisi yok (RBAC reddi).
- 404 Not Found: Varlık ya da not bulunamadı.

## İstemci (Frontend) Notları
- Ortak `NotesPanel` bileşeni, yukarıdaki deseni kullanarak RFQ, PO, Talep ve Shipment sayfalarında not ekleme/listeleme/silmeyi sağlar.
- Tarih gösterimi tr-TR formatında; silme ikonları sadece yetkili rollerde görünür.

—
Detaylı Shipment API sözleşmesi için: `docs/API-SHIPMENTS.md`.
