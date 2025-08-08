// temp_create_test_user.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { User } = require('./models');

async function createTestUser() {
  try {
    // Test kullanıcısı var mı kontrol et
    const existingUser = await User.findOne({ where: { username: 'test' } });
    if (existingUser) {
      console.log('Test kullanıcısı zaten mevcut.');
      console.log('Username: test, Password: 123456');
      process.exit(0);
    }

    // Test kullanıcısı oluştur
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const user = await User.create({
      username: 'test',
      email: 'test@example.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
      department: 'IT'
    });

    console.log('Test kullanıcısı oluşturuldu:');
    console.log('Username: test');
    console.log('Password: 123456');
    console.log('Email: test@example.com');
    
    process.exit(0);
  } catch (error) {
    console.error('Hata:', error);
    process.exit(1);
  }
}

createTestUser();
