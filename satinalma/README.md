# 🏢 Satın Alma Yönetim Sistemi

Modern ve güvenli bir satın alma yönetim sistemi. React 19 + Material-UI frontend ve Node.js + Express backend ile geliştirilmiştir.

## 🚀 Özellikler

- **Güvenli Kimlik Doğrulama**: JWT tabanlı authentication sistemi
- **Kullanıcı Yönetimi**: Role-based access control (Admin, Manager, User)
- **Dosya Yönetimi**: Güvenli dosya yükleme ve saklama
- **Şirket Yönetimi**: Çoklu şirket ve banka hesabı yönetimi
- **E-posta Servisleri**: Otomatik bildirim ve şifre sıfırlama
- **Modern UI**: Material-UI v7 ile responsive tasarım
- **Real-time**: WebSocket desteği ile anlık güncellemeler

## 🛠️ Teknoloji Stack'i

### Frontend
- **React 19.1.0** - Modern UI framework
- **Material-UI v7.2.0** - UI component library
- **Vite 7.0.6** - Hızlı geliştirme aracı
- **React Router v7** - Client-side routing
- **Axios** - HTTP client
- **ApexCharts** - Grafik ve chart'lar

### Backend  
- **Node.js + Express** - Server framework
- **Sequelize ORM** - Database ORM
- **SQLite** - Development database
- **JWT** - Authentication
- **bcrypt** - Şifre hash'leme
- **Nodemailer** - E-posta gönderimi
- **Multer** - Dosya yükleme

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
cd procurement_mantis_original
npm install
cp .env.example .env  # Environment variables'ları düzenleyin
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
VITE_APP_API_URL=http://localhost:5000/api
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
cd procurement_mantis_original
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
cd procurement_mantis_original
npm test
```

## 📊 Monitoring

- **Health Check**: `GET /health` endpoint'i
- **Error Logging**: Winston ile merkezi loglama
- **Performance**: Response time monitoring

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'inizi push edin (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje [MIT](LICENSE) lisansı altında lisanslanmıştır.

## ⭐ İletişim

Herhangi bir sorunuz veya öneriniz için issue oluşturun.
