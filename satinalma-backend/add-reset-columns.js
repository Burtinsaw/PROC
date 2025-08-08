const { sequelize } = require('./models');

async function addResetTokenColumns() {
  try {
    // resetToken kolonunu ekle
    await sequelize.query(`
      ALTER TABLE Users ADD COLUMN resetToken TEXT;
    `).catch(error => {
      if (error.message.includes('duplicate column name')) {
        console.log('resetToken column already exists');
      } else {
        throw error;
      }
    });

    // resetTokenExpiry kolonunu ekle
    await sequelize.query(`
      ALTER TABLE Users ADD COLUMN resetTokenExpiry DATETIME;
    `).catch(error => {
      if (error.message.includes('duplicate column name')) {
        console.log('resetTokenExpiry column already exists');
      } else {
        throw error;
      }
    });

    console.log('Reset token columns added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding columns:', error);
    process.exit(1);
  }
}

addResetTokenColumns();
