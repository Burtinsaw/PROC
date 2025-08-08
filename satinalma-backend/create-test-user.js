const { sequelize, User } = require('./models');
const bcrypt = require('bcrypt');

async function createTestUser() {
  try {
    console.log('🔌 Connecting to database...');
    
    // Database bağlantısını test et
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Tabloları senkronize et
    await sequelize.sync();
    console.log('✅ Database tables synchronized');
    
    // Test kullanıcısının şifresini hash'le
    const hashedPassword = await bcrypt.hash('123456', 10);
    console.log('🔐 Password hashed');
    
    // Test kullanıcısını oluştur veya bul
    const [user, created] = await User.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        firstName: 'Admin',
        lastName: 'User',
        username: 'admin',
        email: 'admin@test.com',
        password: hashedPassword,
        department: 'IT',
        role: 'admin',
        isActive: true
      }
    });
    
    if (created) {
      console.log('✅ Test kullanıcısı oluşturuldu!');
    } else {
      console.log('ℹ️ Test kullanıcısı zaten mevcut');
    }
    
    console.log('👤 Kullanıcı bilgileri:');
    console.log('   Kullanıcı Adı: admin');
    console.log('   Şifre: 123456');
    console.log('   Email: admin@test.com');
    
    // Tüm kullanıcıları listele
    const allUsers = await User.findAll({
      attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'role']
    });
    
    console.log('📋 Tüm kullanıcılar:');
    allUsers.forEach(u => {
      console.log(`   ID: ${u.id}, Username: ${u.username}, Email: ${u.email}, Role: ${u.role}`);
    });
    
    await sequelize.close();
    console.log('🔌 Database connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

createTestUser();
