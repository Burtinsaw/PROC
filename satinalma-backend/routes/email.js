// routes/email.js
const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');
const crypto = require('crypto');

// E-posta bağlantısını test et
router.get('/test-connection', async (req, res) => {
  try {
    const result = await emailService.testConnection();
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'E-posta sunucusu bağlantısı başarılı',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'E-posta sunucusu bağlantı hatası',
        error: result.error
      });
    }
  } catch (error) {
    console.error('E-posta bağlantı testi hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bağlantı testi sırasında hata oluştu',
      error: error.message
    });
  }
});

// Geçici şifre gönder (Şifremi Unuttum)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'E-posta adresi gereklidir'
      });
    }

    // E-posta formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir e-posta adresi giriniz'
      });
    }

    // TODO: Burada kullanıcının veritabanında olup olmadığını kontrol etmek gerekir
    // Şimdilik tüm e-postalar için geçici şifre oluşturuyoruz
    
    // Geçici şifre oluştur (6 haneli alfanumerik)
    const tempPassword = crypto.randomBytes(3).toString('hex').toUpperCase(); // ABC123 formatında
    
    // TODO: Geçici şifreyi veritabanına kaydet ve eski şifreyi geçici olarak değiştir
    // Şimdilik sadece e-posta gönderiyoruz
    
    console.log(`🔑 Geçici şifre oluşturuldu: ${tempPassword} (${email} için)`);
    
    // E-posta gönder
    const result = await emailService.sendTempPasswordEmail(
      email,
      tempPassword,
      'Kullanıcı' // TODO: Gerçek kullanıcı adını veritabanından al
    );

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Geçici şifre e-postası başarıyla gönderildi',
        messageId: result.messageId,
        // Development için - production'da kaldırılacak
        tempPassword: process.env.NODE_ENV === 'development' ? tempPassword : undefined
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'E-posta gönderilirken hata oluştu',
        error: result.error
      });
    }

  } catch (error) {
    console.error('Geçici şifre e-postası hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucuda bir hata oluştu',
      error: error.message
    });
  }
});

// Hoş geldin e-postası gönder
router.post('/send-welcome', async (req, res) => {
  try {
    const { email, userName, tempPassword } = req.body;

    if (!email || !userName) {
      return res.status(400).json({
        success: false,
        message: 'E-posta adresi ve kullanıcı adı gereklidir'
      });
    }

    // E-posta formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir e-posta adresi giriniz'
      });
    }

    // E-posta gönder
    const result = await emailService.sendWelcomeEmail(email, userName, tempPassword);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Hoş geldin e-postası başarıyla gönderildi',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'E-posta gönderilirken hata oluştu',
        error: result.error
      });
    }

  } catch (error) {
    console.error('Hoş geldin e-postası hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucuda bir hata oluştu',
      error: error.message
    });
  }
});

// Bildirim e-postası gönder
router.post('/send-notification', async (req, res) => {
  try {
    const { email, title, message, actionUrl } = req.body;

    if (!email || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'E-posta adresi, başlık ve mesaj gereklidir'
      });
    }

    // E-posta formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir e-posta adresi giriniz'
      });
    }

    // HTML içeriği oluştur
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
    .header { background: linear-gradient(135deg, #5DADE2, #2E86AB); color: white; padding: 20px; text-align: center; }
    .content { padding: 30px; background: #f9f9f9; }
    .button { display: inline-block; background: #2E86AB; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📢 ${title}</h1>
      <p>Satın Alma Takip Sistemi</p>
    </div>
    <div class="content">
      <p>${message}</p>
      
      ${actionUrl ? `<div style="text-align: center;">
        <a href="${actionUrl}" class="button">İşleme Git</a>
      </div>` : ''}
      
      <p>İyi çalışmalar,<br>Satın Alma Takip Ekibi</p>
    </div>
    <div class="footer">
      <p>Bu e-posta otomatik olarak gönderilmiştir.</p>
      <p>© 2024 Satın Alma Takip Sistemi. Tüm hakları saklıdır.</p>
    </div>
  </div>
</body>
</html>`;

    // E-posta gönder
    const result = await emailService.sendEmail(email, title, htmlContent, message);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Bildirim e-postası başarıyla gönderildi',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'E-posta gönderilirken hata oluştu',
        error: result.error
      });
    }

  } catch (error) {
    console.error('Bildirim e-postası hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucuda bir hata oluştu',
      error: error.message
    });
  }
});

// Şifre sıfırlama token'ını doğrula
router.post('/verify-reset-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token gereklidir'
      });
    }

    // TODO: Token'ı veritabanından kontrol et
    // Şimdilik tüm token'ları geçerli kabul ediyoruz
    
    res.status(200).json({
      success: true,
      message: 'Token geçerli',
      email: 'test@example.com' // TODO: Gerçek e-posta adresini döndür
    });

  } catch (error) {
    console.error('Token doğrulama hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Token doğrulanırken hata oluştu',
      error: error.message
    });
  }
});

// Yeni şifre belirle
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token ve yeni şifre gereklidir'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Şifre en az 6 karakter olmalıdır'
      });
    }

    // TODO: Token'ı doğrula ve şifreyi güncelle
    // Şimdilik başarılı response döndürüyoruz
    
    res.status(200).json({
      success: true,
      message: 'Şifre başarıyla güncellendi'
    });

  } catch (error) {
    console.error('Şifre sıfırlama hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Şifre sıfırlanırken hata oluştu',
      error: error.message
    });
  }
});

module.exports = router;

