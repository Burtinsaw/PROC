// backend/controllers/userController.js - BASİT VERSİYON (WebAuthn YOK)
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// JWT Token oluşturma
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
};

// Kullanıcı sayısını getir
exports.getUserCount = async (req, res) => {
  try {
    const count = await User.count();
    res.json({ count });
  } catch (error) {
    console.error('Get user count error:', error);
    res.status(500).json({ message: 'Kullanıcı sayısı alınamadı' });
  }
};

// Kullanıcı kaydı
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, username, email, password, department, role } = req.body;

    // Validasyon
    if (!firstName || !lastName || !username || !email || !password) {
      return res.status(400).json({ message: 'Tüm alanlar zorunludur' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Şifre en az 6 karakter olmalıdır' });
    }

    // E-posta formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Geçerli bir e-posta adresi giriniz' });
    }

    // Kullanıcı adı kontrolü
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({ message: 'Bu kullanıcı adı zaten kullanılıyor' });
    }

    // E-posta kontrolü
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanılıyor' });
    }

    // Şifreyi hashle
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // İlk kullanıcı admin olsun
    const userCount = await User.count();
    const userRole = userCount === 0 ? 'admin' : (role || 'User');

    // Kullanıcıyı oluştur
    const user = await User.create({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      department: department || null,
      role: userRole,
      status: 'active'
    });

    // Şifreyi response'dan çıkar
    const userResponse = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      department: user.department,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt
    };

    res.status(201).json({
      message: 'Kullanıcı başarıyla oluşturuldu',
      user: userResponse
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Kullanıcı kaydı sırasında hata oluştu' });
  }
};

// Kullanıcı girişi
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validasyon
    if (!username || !password) {
      return res.status(400).json({ message: 'Kullanıcı adı ve şifre gereklidir' });
    }

    // Kullanıcıyı bul (username veya email ile)
    const user = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { username },
          { email: username }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
    }

    // Kullanıcı aktif mi kontrol et
    if (user.status !== 'active') {
      return res.status(401).json({ message: 'Hesabınız deaktif edilmiştir' });
    }

    // Şifre kontrolü
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
    }

    // Son giriş zamanını güncelle
    await user.update({ lastLogin: new Date() });

    // JWT token oluştur
    const token = generateToken(user.id);

    // Kullanıcı bilgilerini hazırla (şifre olmadan)
    const userResponse = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      department: user.department,
      role: user.role,
      status: user.status,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      mustChangePassword: user.mustChangePassword
    };

    // Session'a kullanıcı bilgilerini kaydet
    req.session.userId = user.id;
    req.session.user = userResponse;

    res.json({
      message: 'Giriş başarılı',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Giriş sırasında hata oluştu' });
  }
};

// Şifre değiştirme
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validasyon
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Mevcut şifre ve yeni şifre gereklidir' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Yeni şifre en az 6 karakter olmalıdır' });
    }

    // Kullanıcıyı bul
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Mevcut şifre kontrolü
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Mevcut şifre yanlış' });
    }

    // Yeni şifreyi hashle
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Şifreyi güncelle
    await user.update({ password: hashedNewPassword });

    res.json({ message: 'Şifre başarıyla değiştirildi' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Şifre değiştirme sırasında hata oluştu' });
  }
};

// Şifre sıfırlama (geçici şifre ile)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'E-posta adresi gereklidir' });
    }
    // Kullanıcıyı bul
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.json({ message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi' });
    }
    // Geçici şifre üret
    const tempPassword = Math.random().toString(36).slice(-8) + Math.floor(Math.random()*10);
    const saltRounds = 12;
    const hashedTempPassword = await require('bcryptjs').hash(tempPassword, saltRounds);
    // Kullanıcıyı güncelle (geçici şifre ve mustChangePassword: true)
    await user.update({ password: hashedTempPassword, mustChangePassword: true });
    // E-posta gönder (gerçek)
    const { sendMail } = require('../utils/email');
    await sendMail(user.email, 'Geçici Şifre', `Geçici şifreniz: ${tempPassword}\nİlk girişte yeni şifre belirlemeniz gerekmektedir.`);
    res.json({ message: 'Geçici şifre e-posta adresinize gönderildi.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Şifre sıfırlama sırasında hata oluştu' });
  }
};

// Profil getir
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    res.json({ user });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Profil bilgileri alınamadı' });
  }
};

// Profil güncelle
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, email, department } = req.body;

    // Validasyon
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ message: 'Ad, soyad ve e-posta gereklidir' });
    }

    // E-posta formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Geçerli bir e-posta adresi giriniz' });
    }

    // E-posta benzersizlik kontrolü (kendi e-postası hariç)
    const existingUser = await User.findOne({
      where: {
        email,
        id: { [require('sequelize').Op.ne]: userId }
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanılıyor' });
    }

    // Kullanıcıyı güncelle
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    await user.update({
      firstName,
      lastName,
      email,
      department: department || null
    });

    // Güncellenmiş kullanıcı bilgilerini döndür
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      message: 'Profil başarıyla güncellendi',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Profil güncelleme sırasında hata oluştu' });
  }
};

// Tüm kullanıcıları listele (admin)
exports.getAllUsers = async (req, res) => {
  try {
    // Admin kontrolü
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bu işlem için admin yetkisi gereklidir' });
    }

    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    res.json({ users });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Kullanıcılar listelenemedi' });
  }
};

// Kullanıcı durumu güncelle (admin)
exports.updateUserStatus = async (req, res) => {
  try {
    // Admin kontrolü
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bu işlem için admin yetkisi gereklidir' });
    }

    const { userId } = req.params;
    const { status } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Kendi hesabını deaktif edemez
    if (user.id === req.user.id && status !== 'active') {
      return res.status(400).json({ message: 'Kendi hesabınızı deaktif edemezsiniz' });
    }

    await user.update({ status });

    res.json({ message: 'Kullanıcı durumu güncellendi' });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Kullanıcı durumu güncellenemedi' });
  }
};

// Şifre sıfırlama isteği
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'E-posta adresi gereklidir' });
    }

    // E-posta formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Geçerli bir e-posta adresi giriniz' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Güvenlik nedeniyle kullanıcı bulunamasa bile başarılı mesajı döndür
      return res.json({ message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi' });
    }

    // Reset token oluştur (6 haneli kod)
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 dakika

    // Kullanıcıya reset token'ı kaydet
    await user.update({
      resetToken,
      resetTokenExpiry
    });

    // TODO: E-posta gönderme işlemi
    // Gerçek projede nodemailer kullanarak e-posta gönderilecek
    console.log(`Reset token for ${email}: ${resetToken}`);
    
    // Geliştirme ortamında token'ı response'da döndür
    if (process.env.NODE_ENV === 'development') {
      return res.json({ 
        message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi',
        resetToken // Sadece geliştirme için
      });
    }

    res.json({ message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi' });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Şifre sıfırlama isteği sırasında hata oluştu' });
  }
};

// Şifre sıfırlama token doğrulama
exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Reset token gereklidir' });
    }

    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          [require('sequelize').Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Geçersiz veya süresi dolmuş token' });
    }

    res.json({ message: 'Token geçerli', valid: true });

  } catch (error) {
    console.error('Verify reset token error:', error);
    res.status(500).json({ message: 'Token doğrulama sırasında hata oluştu' });
  }
};

// Şifre sıfırlama
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token ve yeni şifre gereklidir' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Şifre en az 6 karakter olmalıdır' });
    }

    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          [require('sequelize').Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Geçersiz veya süresi dolmuş token' });
    }

    // Yeni şifreyi hashle
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Şifreyi güncelle ve token'ları temizle
    await user.update({
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null
    });

    res.json({ message: 'Şifreniz başarıyla sıfırlandı' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Şifre sıfırlama sırasında hata oluştu' });
  }
};

