require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./models');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/authRoutes');
const emailRoutes = require('./routes/email');
const documentRoutes = require('./routes/documents');
const companyRoutes = require('./routes/companyRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS should be as early as possible so all responses include headers
const corsOptions = {
  origin: [
    'http://localhost:3000', 'http://127.0.0.1:3000',
    'http://localhost:3001', 'http://127.0.0.1:3001',
    'http://localhost:5173', 'http://127.0.0.1:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Güvenlik middleware'leri
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting - Genel
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // IP başına maksimum 100 istek
  message: {
    success: false,
    message: 'Çok fazla istek gönderildi, lütfen daha sonra tekrar deneyin.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting - Login için özel
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 5, // IP başına maksimum 5 login denemesi
  message: {
    success: false,
    message: 'Çok fazla giriş denemesi, 15 dakika bekleyin.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);
app.use(session({
  // Fallback secret to prevent crash in dev if JWT_SECRET not set
  secret: process.env.JWT_SECRET || 'dev-session-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 60 * 1000, // 30 dakika
    httpOnly: true,
    sameSite: 'strict'
  }
}));
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000', 
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'http://localhost:5173', 
    'http://127.0.0.1:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Avoid 404 noise for browser's favicon request
app.get('/favicon.ico', (req, res) => res.status(204).end());

app.use('/api/users', userRoutes);
app.use('/api/auth/login', loginLimiter); // Login rate limiting
app.use('/api/auth', authRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/admin/users', require('./routes/adminUsers'));
app.use('/api/companies', require('./routes/companyRoutes'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/documents', documentRoutes);
app.use('/api/talepler', require('./routes/talepRoutes'));
app.use('/api/offers', require('./routes/offerRoutes'));
app.use('/api/companies', companyRoutes);

// Yeni modül rotaları
app.use('/api/purchase-orders', require('./routes/purchaseOrders'));
app.use('/api/shipments', require('./routes/shipments'));
app.use('/api/finance', require('./routes/finance'));
app.use('/api/rfqs', require('./routes/rfqs'));
app.use('/api/quotes', require('./routes/quotes'));
app.use('/api/proformas', require('./routes/proformas'));
app.use('/api/logistics', require('./routes/logistics'));
app.use('/api/exchange', require('./routes/exchange'));

// Workflow entegrasyon rotaları
app.use('/api/workflow', require('./routes/workflow'));

// ID Takip Sistemi
app.use('/api/tracking', require('./routes/tracking'));

// 404 Handler - Tüm route'lardan sonra
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'API endpoint bulunamadı',
    path: req.originalUrl,
    method: req.method
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('🚨 Global Error Handler:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ 
      success: false,
      message: 'Validation error',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      success: false,
      message: 'Geçersiz token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      success: false,
      message: 'Token süresi dolmuş'
    });
  }

  // Rate limiting errors
  if (err.status === 429) {
    return res.status(429).json({
      success: false,
      message: 'Çok fazla istek gönderildi'
    });
  }

  // Default error response
  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode === 500 ? 'Sunucu hatası' : err.message;

  res.status(statusCode).json({ 
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      error: err 
    })
  });
});

const startServer = async () => {
  console.log('🟡 Backend starting...');
  try {
    await sequelize.authenticate();
    console.log('✅ Veritabanı bağlantısı başarılı!');
  } catch (dbErr) {
    console.error('❌ DB bağlantı hatası:', dbErr);
  }
  try {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Backend sunucusu http://localhost:${PORT} adresinde çalışıyor`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? 'SET' : 'NOT SET'} (fallback allowed in dev)`);
    }).on('error', (err) => {
      console.error('❌ HTTP Listen error:', err);
    });
  } catch (listenErr) {
    console.error('❌ Sunucu dinleme hatası:', listenErr);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 SIGTERM received, shutting down gracefully');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 SIGINT received, shutting down gracefully');
  await sequelize.close();
  process.exit(0);
});

startServer();

module.exports = app;


