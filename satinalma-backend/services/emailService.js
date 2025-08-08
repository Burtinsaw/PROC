// services/emailService.js
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Yandex SMTP konfigürasyonu
    this.transporter = nodemailer.createTransport({
      host: 'smtp.yandex.com',
      port: 465,
      secure: true, // SSL kullan
      auth: {
        user: process.env.YANDEX_EMAIL, // .env dosyasından alınacak
        pass: process.env.YANDEX_APP_PASSWORD // Uygulama şifresi
      }
    });
  }

  // E-posta gönderme fonksiyonu
  async sendEmail(to, subject, htmlContent, textContent = '') {
    try {
      const mailOptions = {
        from: `"Satın Alma Takip" <${process.env.YANDEX_EMAIL}>`,
        to: to,
        subject: subject,
        text: textContent,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ E-posta başarıyla gönderildi:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ E-posta gönderme hatası:', error);
      return { success: false, error: error.message };
    }
  }

  // Geçici şifre e-postası (Şifremi Unuttum)
  async sendTempPasswordEmail(email, tempPassword, userName = 'Kullanıcı') {
    const loginUrl = `${process.env.FRONTEND_URL}/login`;
    
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
    .header { background: linear-gradient(135deg, #5DADE2, #2E86AB); color: white; padding: 20px; text-align: center; }
    .content { padding: 30px; background: #f9f9f9; }
    .button { display: inline-block; background: #2E86AB; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .password-box { background: #fff; padding: 20px; border-left: 4px solid #2E86AB; margin: 20px 0; text-align: center; border-radius: 5px; }
    .password { font-size: 24px; font-weight: bold; color: #2E86AB; letter-spacing: 2px; }
    .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
    .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔑 Geçici Şifre</h1>
      <p>Satın Alma Takip Sistemi</p>
    </div>
    <div class="content">
      <h2>Merhaba ${userName},</h2>
      <p>Şifre sıfırlama talebiniz alındı. Aşağıdaki geçici şifre ile sisteme giriş yapabilirsiniz:</p>
      
      <div class="password-box">
        <p><strong>Geçici Şifreniz:</strong></p>
        <div class="password">${tempPassword}</div>
      </div>
      
      <div class="warning">
        <p><strong>⚠️ Önemli Güvenlik Uyarıları:</strong></p>
        <ul style="text-align: left; margin: 10px 0;">
          <li>Bu geçici şifre ile giriş yaptıktan sonra <strong>mutlaka</strong> şifrenizi değiştirin</li>
          <li>Geçici şifre 24 saat geçerlidir</li>
          <li>Bu e-postayı kimseyle paylaşmayın</li>
          <li>Eğer bu talebi siz yapmadıysanız, hemen sistem yöneticisine başvurun</li>
        </ul>
      </div>
      
      <div style="text-align: center;">
        <a href="${loginUrl}" class="button">Sisteme Giriş Yap</a>
      </div>
      
      <p><strong>Giriş Adımları:</strong></p>
      <ol style="text-align: left;">
        <li>Yukarıdaki "Sisteme Giriş Yap" butonuna tıklayın</li>
        <li>E-posta adresinizi girin: <strong>${email}</strong></li>
        <li>Geçici şifrenizi girin: <strong>${tempPassword}</strong></li>
        <li>Giriş yaptıktan sonra şifrenizi değiştirin</li>
      </ol>
      
      <p>İyi çalışmalar,<br>Satın Alma Takip Ekibi</p>
    </div>
    <div class="footer">
      <p>Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.</p>
      <p>© 2024 Satın Alma Takip Sistemi. Tüm hakları saklıdır.</p>
    </div>
  </div>
</body>
</html>`;

    const textContent = `Geçici Şifre - Satın Alma Takip Sistemi

Merhaba ${userName},

Geçici şifreniz: ${tempPassword}

Bu şifre ile ${loginUrl} adresinden giriş yapabilirsiniz.

Giriş yaptıktan sonra mutlaka şifrenizi değiştirin.

İyi çalışmalar,
Satın Alma Takip Ekibi`;

    return await this.sendEmail(
      email,
      '🔑 Geçici Şifre - Satın Alma Takip Sistemi',
      htmlContent,
      textContent
    );
  }

  // Şifre sıfırlama e-postası (eski - link ile)
  async sendPasswordResetEmail(email, resetToken, userName = 'Kullanıcı') {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
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
      <h1>🔐 Şifre Sıfırlama</h1>
      <p>Satın Alma Takip Sistemi</p>
    </div>
    <div class="content">
      <h2>Merhaba ${userName},</h2>
      <p>Şifrenizi sıfırlamak için bir talepte bulundunuz. Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz:</p>
      
      <div style="text-align: center;">
        <a href="${resetUrl}" class="button">Şifremi Sıfırla</a>
      </div>
      
      <p><strong>Önemli:</strong></p>
      <ul>
        <li>Bu bağlantı 1 saat geçerlidir</li>
        <li>Eğer şifre sıfırlama talebinde bulunmadıysanız, bu e-postayı görmezden gelin</li>
        <li>Güvenliğiniz için bağlantıyı kimseyle paylaşmayın</li>
      </ul>
      
      <p>Sorunuz varsa bizimle iletişime geçebilirsiniz.</p>
      
      <p>İyi çalışmalar,<br>Satın Alma Takip Ekibi</p>
    </div>
    <div class="footer">
      <p>Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.</p>
      <p>© 2024 Satın Alma Takip Sistemi. Tüm hakları saklıdır.</p>
    </div>
  </div>
</body>
</html>`;

    const textContent = `Şifre Sıfırlama - Satın Alma Takip Sistemi

Merhaba ${userName},

Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:
${resetUrl}

Bu bağlantı 1 saat geçerlidir.

İyi çalışmalar,
Satın Alma Takip Ekibi`;

    return await this.sendEmail(
      email,
      '🔐 Şifre Sıfırlama - Satın Alma Takip',
      htmlContent,
      textContent
    );
  }

  // Hoş geldin e-postası
  async sendWelcomeEmail(email, userName, tempPassword = null) {
    const loginUrl = `${process.env.FRONTEND_URL}/login`;
    
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
    .header { background: linear-gradient(135deg, #5DADE2, #2E86AB); color: white; padding: 20px; text-align: center; }
    .content { padding: 30px; background: #f9f9f9; }
    .button { display: inline-block; background: #2E86AB; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .credentials { background: #fff; padding: 15px; border-left: 4px solid #2E86AB; margin: 20px 0; }
    .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Hoş Geldiniz!</h1>
      <p>Satın Alma Takip Sistemi</p>
    </div>
    <div class="content">
      <h2>Merhaba ${userName},</h2>
      <p>Satın Alma Takip Sistemine hoş geldiniz! Hesabınız başarıyla oluşturuldu.</p>
      
      ${tempPassword ? `<div class="credentials">
        <h3>🔑 Giriş Bilgileriniz:</h3>
        <p><strong>E-posta:</strong> ${email}</p>
        <p><strong>Geçici Şifre:</strong> ${tempPassword}</p>
        <p><em>Güvenliğiniz için ilk girişte şifrenizi değiştirmeniz önerilir.</em></p>
      </div>` : ''}
      
      <div style="text-align: center;">
        <a href="${loginUrl}" class="button">Sisteme Giriş Yap</a>
      </div>
      
      <p>İyi çalışmalar,<br>Satın Alma Takip Ekibi</p>
    </div>
    <div class="footer">
      <p>Bu e-posta otomatik olarak gönderilmiştir.</p>
      <p>© 2024 Satın Alma Takip Sistemi. Tüm hakları saklıdır.</p>
    </div>
  </div>
</body>
</html>`;

    return await this.sendEmail(
      email,
      '🎉 Hoş Geldiniz - Satın Alma Takip Sistemi',
      htmlContent
    );
  }

  // Bağlantı testi
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ E-posta sunucusu bağlantısı başarılı');
      return { success: true, message: 'Bağlantı başarılı' };
    } catch (error) {
      console.error('❌ E-posta sunucusu bağlantı hatası:', error);
      return { success: false, error: error.message };
    }
  }

  // RFQ e-posta gönderme fonksiyonu
  async sendRFQEmail(supplierEmail, rfqData, emailTemplate, language = 'tr') {
    try {
      const subject = language === 'tr' 
        ? `Teklif Talebi: ${rfqData.title} - ${rfqData.rfqNumber}`
        : `Request for Quotation: ${rfqData.title} - ${rfqData.rfqNumber}`;

      const htmlContent = this.generateRFQEmailHTML(rfqData, emailTemplate, language);
      
      const textContent = emailTemplate || 
        (language === 'tr' 
          ? `Teklif Talebi\n\n${rfqData.title} projesi için teklifinizi bekliyoruz.\n\nDetaylar için lütfen eki inceleyin.`
          : `Request for Quotation\n\n${rfqData.title} project quotation request.\n\nPlease check the attachment for details.`);

      return await this.sendEmail(
        supplierEmail,
        subject,
        htmlContent,
        textContent
      );
    } catch (error) {
      console.error('❌ RFQ e-posta gönderme hatası:', error);
      return { success: false, error: error.message };
    }
  }

  // RFQ e-posta HTML şablonu oluşturma
  generateRFQEmailHTML(rfqData, emailTemplate, language = 'tr') {
    const isTurkish = language === 'tr';
    
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    .container { max-width: 700px; margin: 0 auto; font-family: Arial, sans-serif; }
    .header { background: linear-gradient(135deg, #2E86AB, #5DADE2); color: white; padding: 25px; text-align: center; }
    .content { padding: 30px; background: #f9f9f9; }
    .section { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .product-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    .product-table th, .product-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    .product-table th { background: #2E86AB; color: white; }
    .highlight { background: #e8f4f8; padding: 15px; border-left: 4px solid #2E86AB; margin: 20px 0; }
    .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; background: #f5f5f5; }
    .button { display: inline-block; background: #2E86AB; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 ${isTurkish ? 'Teklif Talebi' : 'Request for Quotation'}</h1>
      <p>${isTurkish ? 'Satın Alma Takip Sistemi' : 'Procurement Tracking System'}</p>
      <p><strong>RFQ No: ${rfqData.rfqNumber}</strong></p>
    </div>
    
    <div class="content">
      <div class="section">
        <h2>${rfqData.title}</h2>
        <p>${rfqData.description || ''}</p>
        
        <div class="highlight">
          <strong>${isTurkish ? '📅 Son Teklif Tarihi:' : '📅 Quotation Deadline:'}</strong>
          ${rfqData.deadline ? new Date(rfqData.deadline).toLocaleDateString(isTurkish ? 'tr-TR' : 'en-US') : 'N/A'}
        </div>
      </div>

      ${rfqData.items && rfqData.items.length > 0 ? `
      <div class="section">
        <h3>${isTurkish ? '📦 Talep Edilen Ürünler' : '📦 Requested Products'}</h3>
        <table class="product-table">
          <thead>
            <tr>
              <th>${isTurkish ? 'Ürün Adı' : 'Product Name'}</th>
              <th>${isTurkish ? 'Miktar' : 'Quantity'}</th>
              <th>${isTurkish ? 'Birim' : 'Unit'}</th>
              <th>${isTurkish ? 'Marka' : 'Brand'}</th>
              <th>${isTurkish ? 'Model' : 'Model'}</th>
            </tr>
          </thead>
          <tbody>
            ${rfqData.items.map(item => `
              <tr>
                <td>${item.urunAdi || item.productName || '-'}</td>
                <td>${item.miktar || item.quantity || '-'}</td>
                <td>${item.birim || item.unit || '-'}</td>
                <td>${item.marka || item.brand || '-'}</td>
                <td>${item.model || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      <div class="section">
        <h3>${isTurkish ? '📋 Teklif Detayları' : '📋 Quotation Details'}</h3>
        <div style="white-space: pre-line; line-height: 1.6;">
          ${emailTemplate || (isTurkish ? 'Detaylı teklif bilgileri için lütfen bizimle iletişime geçin.' : 'Please contact us for detailed quotation information.')}
        </div>
      </div>

      ${rfqData.paymentTerms || rfqData.deliveryTerms ? `
      <div class="section">
        <h3>${isTurkish ? '⚙️ Koşullar' : '⚙️ Terms & Conditions'}</h3>
        ${rfqData.paymentTerms ? `<p><strong>${isTurkish ? 'Ödeme Koşulları:' : 'Payment Terms:'}</strong> ${rfqData.paymentTerms}</p>` : ''}
        ${rfqData.deliveryTerms ? `<p><strong>${isTurkish ? 'Teslimat Koşulları:' : 'Delivery Terms:'}</strong> ${rfqData.deliveryTerms}</p>` : ''}
        ${rfqData.validityPeriod ? `<p><strong>${isTurkish ? 'Geçerlilik Süresi:' : 'Validity Period:'}</strong> ${rfqData.validityPeriod} ${isTurkish ? 'gün' : 'days'}</p>` : ''}
        ${rfqData.currency ? `<p><strong>${isTurkish ? 'Para Birimi:' : 'Currency:'}</strong> ${rfqData.currency}</p>` : ''}
      </div>
      ` : ''}

      <div class="highlight">
        <p><strong>${isturkish ? '📞 İletişim:' : '📞 Contact:'}</strong></p>
        <p>${isturkish ? 'Sorularınız için satınalma departmanımızla iletişime geçebilirsiniz.' : 'For any questions, please contact our procurement department.'}</p>
        <p>E-mail: ${process.env.YANDEX_EMAIL}</p>
      </div>
    </div>
    
    <div class="footer">
      <p>${isturkish ? 'Bu e-posta otomatik olarak gönderilmiştir.' : 'This email was sent automatically.'}</p>
      <p>© 2025 ${isturkish ? 'Satın Alma Takip Sistemi' : 'Procurement Tracking System'}</p>
    </div>
  </div>
</body>
</html>`;
  }

  // Toplu RFQ e-posta gönderimi
  async sendBulkRFQEmails(suppliers, rfqData, emailTemplate, language = 'tr') {
    const results = [];
    
    for (const supplier of suppliers) {
      try {
        const result = await this.sendRFQEmail(
          supplier.email, 
          rfqData, 
          emailTemplate, 
          language
        );
        
        results.push({
          supplier: supplier.name,
          email: supplier.email,
          success: result.success,
          messageId: result.messageId,
          error: result.error
        });
        
        // E-postalar arasında kısa gecikme (rate limiting)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        results.push({
          supplier: supplier.name,
          email: supplier.email,
          success: false,
          error: error.message
        });
      }
    }
    
    return {
      totalSent: results.filter(r => r.success).length,
      totalFailed: results.filter(r => !r.success).length,
      details: results
    };
  }
}

module.exports = new EmailService();

