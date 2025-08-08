const { sequelize } = require('../models');
(async () => {
  try {
    const [cols] = await sequelize.query("PRAGMA table_info('Users');");
    console.log('Users columns:', cols.map(c=>c.name));
  } catch(e){
    console.error('Error inspecting Users table:', e);
  } finally {
    await sequelize.close();
  }
})();
