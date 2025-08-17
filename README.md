# 🏢 Satın Alma Yönetim Sistemi

Modern ve güvenli satın alma yönetim sistemi. Yeni nesil Aurora temalı arayüz, ikon sadeleşmesi (lucide-react) ve erişilebilirlik odaklı AppShell mimarisi ile güncellenmiştir.

## 🚀 Özellikler

- **Güvenli Kimlik Doğrulama**: JWT tabanlı authentication sistemi
- **Kullanıcı Yönetimi**: Role-based access control (Admin, Manager, User)
- **Dosya Yönetimi**: Güvenli dosya yükleme ve saklama
- **Şirket Yönetimi**: Çoklu şirket ve banka hesabı yönetimi
- **E-posta Servisleri**: Otomatik bildirim ve şifre sıfırlama
- **Modern UI**: Aurora preset + cam efektli (glass) yüzeyler, degrade arka plan, hareket (motion) tokenları
- **Kompakt Navigasyon**: Icon rail + hover context panel (masaüstü) ve alt bar (mobil)
- **Komut Paleti**: Ctrl/Cmd+K ile hızlı gezinme ve arama
- **Erişilebilirlik**: Skip link, roving tabindex, aria-live duyuruları, klavye kısayolları
- **İkon Standardizasyonu**: @mui/icons-material kaldırıldı; hafif lucide-react ikon seti
- **Real-time**: WebSocket desteği ile anlık güncellemeler
 - **Ön-Commit Kalite**: Husky + lint-staged (eslint --fix + ilgili testler)
 - **Fuzzy Arama**: Komut Paleti özel fuzzy skor algoritması (exact > prefix > substring > sıralı)
 - **Lojistik (Sevkiyat) Modülü**: Shipments listesi ve detay sayfası (bacaklar, olaylar zaman çizelgesi, masraflar, istisnalar, notlar), Incoterm filtreleme, CSV dışa aktarım

## 🛠️ Teknoloji Stack'i

### Frontend
- **React 19.1.0** – UI
- **Material-UI v7.2.0** – Tema & component (custom Aurora preset)
- **lucide-react** – İkon kütüphanesi
- **Vite 7.0.6** – Geliştirme & build
- **React Router v7** – İleri seviye route mimarisi
- **Axios** – HTTP
- **ApexCharts / Recharts** – Grafikler

### Backend  
- **Node.js + Express** - Server framework
- **Sequelize ORM** - Database ORM
- **SQLite** - Development database
- **JWT** - Authentication
- **bcrypt** - Şifre hash'leme
- **Nodemailer** - E-posta gönderimi
- **Multer** - Dosya yükleme

### Logistics / Shipments (Özet)
- REST API: `/api/shipments` (liste/detay/oluşturma/status/track) ve nested: `/:shipmentId/(legs|events|charges|exceptions)`
- Ek uç nokta: `/:shipmentId/notes` — sevkiyat notları (GET/POST/DELETE)
- Alan eşlemeleri: `code = shipmentNumber`, `trackingNo = trackingNumber`
- Ön yüz: Shipments listesi (arama, incoterm, URL senk), seçim + CSV export; Shipment Detail (quick-add formlar, timeline, inline düzenleme, resolved toggle)
- Detaylar için: `docs/API-SHIPMENTS.md`

### Notlar (Notes) — Ortak API
- RFQ, Satınalma Siparişi, Talep ve Sevkiyat için çoklu notlar uç noktaları aktiftir: `GET/POST/DELETE /api/<entity>/:id/notes`
- Ortak sözleşme: `docs/API-NOTES.md`

## 📦 Kurulum

### 1. Depoyu Clone Edin
```bash
git clone <repository-url>
cd satinalma-project
```

### 2. Backend Kurulumu
```bash
cd satinalma-backend
npm install
cp .env.example .env  # Environment variables'ları düzenleyin
npm run dev
```

### 3. Frontend Kurulumu
```bash
cd satinalma
npm install
cp .env.example .env  # (Varsa) environment değişkenlerini düzenleyin
npm run dev
```

## 🔧 Konfigürasyon

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite
JWT_SECRET=your-super-secret-key
YANDEX_EMAIL=your-email@domain.com
YANDEX_APP_PASSWORD=your-app-password
```

### Frontend (.env)
```env
VITE_APP_API_URL=http://localhost:5002/api
VITE_APP_BASE_URL=http://localhost:3000
NODE_ENV=development
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/logout` - Kullanıcı çıkışı
- `GET /api/auth/profile` - Kullanıcı profili

### Kullanıcı Yönetimi
- `GET /api/users` - Kullanıcı listesi
- `POST /api/users` - Yeni kullanıcı
- `PUT /api/users/:id` - Kullanıcı güncelle
- `DELETE /api/users/:id` - Kullanıcı sil

### Şirket Yönetimi
- `GET /api/companies` - Şirket listesi
- `POST /api/companies` - Yeni şirket
- `GET /api/companies/:id/bank-accounts` - Banka hesapları

### Lojistik / Shipments
- `GET /api/shipments` — Liste
- `GET /api/shipments/:id` — Detay
- `POST /api/shipments` — Oluştur
- `PATCH /api/shipments/:id/status` — Durum
- `GET|POST|DELETE /api/shipments/:id/notes` — Notlar (listele/ekle/sil)
- Nested: `/:shipmentId/legs|events|charges|exceptions` (GET/POST), `PATCH /exceptions/:id`, `PATCH /legs/:id`
Detaylı şema ve örnekler için `docs/API-SHIPMENTS.md`.

## 🔒 Güvenlik Özellikleri

- **Rate Limiting**: API endpoint'leri için hız sınırı
- **CORS Protection**: Cross-origin güvenliği  
- **Helmet.js**: HTTP header güvenliği
- **JWT Token**: Güvenli authentication
- **Password Hashing**: bcrypt ile şifre hash'leme
- **Input Validation**: express-validator ile giriş kontrolü
- **SQL Injection Protection**: Sequelize ORM koruması

## 🚀 Deployment

### Production Build
```bash
# Frontend build
cd satinalma
npm run build

# Backend production mode
cd satinalma-backend
NODE_ENV=production npm start
```

### Docker (Opsiyonel)
```bash
# Coming soon...
```

## 🧪 Test

```bash
# Backend testleri
cd satinalma-backend
npm test

# Frontend testleri  
cd satinalma
npm run test:ci
```

## 📊 Monitoring & Gözlem

- **Health Check**: `GET /health`
- **Backend Status Banner**: UI otomatik ping ile durum bildirimi
- **Loglama**: (Backend) Winston / konsol
- **Onay Metrikleri**: `GET /api/approvals/_metrics?from=ISO&to=ISO` aralığa göre; cevapta p95 ve süre ortalamaları, 60sn (konfigüre edilebilir) cache
	- Ek Alanlar: `overduePendingCount`, `escalationLevels` (level0, level1, ...), cache header: `X-Metrics-Cache: HIT|MISS`, `X-Metrics-TTL` (ms)
	- ETag/If-None-Match desteği (değişmediyse 304)
 - **Onay Özet**: `GET /api/approvals/_summary?role=...&includeSteps=true` kullanıcı rolü odaklı bekleyen işler
	- ETag/If-None-Match desteği ile değişmeyen sayfalarda 304 döner (daha az payload)
	- `fields=id,status,nextRole` ile yalın alan seçimi (band genişliği azaltma)

### ⏱ Per-Adım SLA
Onay kuralı `stepsJson` içinde her adım `{ "role": "satinalma_muduru", "durationMin": 180 }` şeklinde süre (dakika) tanımlayabilir. Tanımsızsa `APPROVAL_SLA_INITIAL_MINUTES` varsayılanı (örn: 120) kullanılır. Her karar sonrası metrik cache’i otomatik temizlenir; dashboard her yeni kararda taze veri alır.

### 🔌 Real-time Onay Olayları (SSE)
Endpoint: `GET /api/approvals/_events`

Gönderilen event türleri:
- `approval_start` { id, entityType, entityId, status }
- `approval_step` { id, entityType, entityId, status, currentStep }
- `approval_final` { id, entityType, entityId, status }
- `approval_reopen` { id, entityType, entityId, status }
- `approval_overdue` { stepId, instanceId, stepNumber, roleRequired }
- `approval_escalated` { stepId, instanceId, level }
- `ping` (keep-alive)

İsteğe bağlı filtreleme: `GET /api/approvals/_events?types=approval_start,approval_final,approval_overdue`
Sadece belirtilen event tipleri gönderilir; bant genişliği tasarrufu sağlar.

Tarayıcı örnek:
```js
const es = new EventSource('/api/approvals/_events', { withCredentials:true });
es.addEventListener('approval_start', e => console.log('Yeni süreç', JSON.parse(e.data)));
es.addEventListener('approval_step', e => {/* badge güncelle */});
es.addEventListener('approval_final', e => {/* toast: tamamlandı */});
es.addEventListener('approval_reopen', e => {/* liste refresh */});
```

## 🤝 Katkıda Bulunma

1. Fork
2. Branch aç (`feat/özellik-adı`)
3. Commit (`feat: ...` konvansiyonu önerilir)
4. PR oluştur

## 📝 Lisans

Bu proje [MIT](LICENSE) lisansı altında.

## ⭐ İletişim

Sorularınız için issue açabilirsiniz. Aurora / AppShell mimarisi hakkında dokümantasyon ekleri yakında.

---
### 🎨 Aurora Tema Tokenları (Özet)
- Blur Yüzey: `blur(18px)` (rail, panel, komut paleti)
- Gradient Dark: `linear-gradient(135deg, rgba(17,24,39,0.92), rgba(30,41,59,0.85))`
- Gradient Light: `linear-gradient(135deg, rgba(255,255,255,0.90), rgba(240,247,255,0.85))`
- Motion Ease: `var(--motion-ease-standard)` genişleme/daralma
- Focus Halo: primary ana renk + 0 0 0 2px alpha ring

### 🔐 Otomasyon & CI
```bash
# Tüm kalite zinciri (lint + test + build)
cd satinalma
npm run ci
```

### ✅ Geliştirme Kontrollisti
- [ ] Yeni menü ikonu eklerken `navigation/iconMap.js` güncelle
- [ ] Komut paleti id benzersizliğini koru
- [ ] RBAC eklerken PermissionGuard testine ek vaka düşün
