// temp_reset_admin_password.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { User } = require('./models');

async function resetAdminPassword() {
  try {
    const adminUser = await User.findOne({ where: { username: 'admin' } });
    if (!adminUser) {
      console.log('Admin kullanıcısı bulunamadı.');
      process.exit(1);
    }

    // Admin şifresini "admin123" olarak ayarla
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await adminUser.update({ password: hashedPassword });

    console.log('Admin kullanıcısının şifresi güncellendi:');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Email: admin@example.com');
    
    process.exit(0);
  } catch (error) {
    console.error('Hata:', error);
    process.exit(1);
  }
}

resetAdminPassword();
