const { Sequelize } = require('sequelize');
const config = require('./config/config.js');

const sequelize = new Sequelize(config.development);

async function cleanMigrations() {
  try {
    // Problematic migration'ı kaldır
    await sequelize.query('DELETE FROM SequelizeMeta WHERE name = "20250102000001-add-tracking-system.js"');
    console.log('✅ Problematic migration removed from SequelizeMeta');
    
    // Type migration'ını manuel olarak ekle
    await sequelize.query('INSERT OR IGNORE INTO SequelizeMeta (name) VALUES ("202507311510-add-type-to-companies.js")');
    console.log('✅ Type migration marked as completed');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

cleanMigrations();
