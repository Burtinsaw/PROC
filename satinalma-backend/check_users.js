const { User } = require('./models');

async function checkUsers() {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'isActive']
    });
    
    console.log('📊 User Active Status:');
    users.forEach(user => {
      console.log(`- ${user.username} (ID: ${user.id}): ${user.isActive ? '✅ Active' : '❌ Inactive'}`);
    });
    
    // If admin is inactive, activate it
    const adminUser = users.find(u => u.username === 'admin');
    if (adminUser && !adminUser.isActive) {
      console.log('🔧 Admin user is inactive, activating...');
      await User.update({ isActive: true }, { where: { id: adminUser.id } });
      console.log('✅ Admin user activated');
    }
    
  } catch (error) {
    console.error('Error checking users:', error);
  }
  
  process.exit(0);
}

checkUsers();
