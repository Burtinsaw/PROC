// Quick diagnostic script to inspect Users table
const { sequelize, User } = require('../models');
(async () => {
  try {
    console.log('Connecting...');
    await sequelize.authenticate();
    console.log('DB OK');
    const users = await User.findAll({ attributes: ['id','username','email','role'] });
    console.log('Users:', users.map(u=>u.toJSON()));
  } catch (e) {
    console.error('Diag error', e);
  } finally {
    await sequelize.close();
  }
})();
