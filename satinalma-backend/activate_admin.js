const { User } = require('./models');

(async () => {
  try {
    console.log('🔍 Checking user status...');
    
    // Get all users
    const users = await User.findAll({
      attributes: ['id', 'username', 'isActive', 'email']
    });
    
    console.log('📊 Current users:');
    users.forEach(user => {
      console.log(`- ${user.username} (ID: ${user.id}, Email: ${user.email}): ${user.isActive ? '✅ Active' : '❌ Inactive'}`);
    });
    
    // Activate admin user if it exists and is inactive
    const adminUser = await User.findOne({ where: { username: 'admin' } });
    if (adminUser) {
      if (!adminUser.isActive) {
        console.log('🔧 Activating admin user...');
        await adminUser.update({ isActive: true });
        console.log('✅ Admin user activated');
      } else {
        console.log('✅ Admin user is already active');
      }
    } else {
      console.log('❌ Admin user not found');
    }
    
    // Try to create admin user if it doesn't exist
    if (!adminUser) {
      console.log('🔧 Creating admin user...');
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        isActive: true,
        role: 'admin'
      });
      console.log('✅ Admin user created');
    }
    
    console.log('✅ User check completed');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
})();
