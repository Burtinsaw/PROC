// temp_check_users.js
require('dotenv').config();
const { User } = require('./models');

async function checkUsers() {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'role', 'firstName', 'lastName']
    });
    
    console.log('=== MEVCUT KULLANICILAR ===');
    if (users.length === 0) {
      console.log('Hiç kullanıcı bulunamadı.');
    } else {
      users.forEach(user => {
        console.log(`ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Role: ${user.role}, Name: ${user.firstName} ${user.lastName}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Hata:', error);
    process.exit(1);
  }
}

checkUsers();
