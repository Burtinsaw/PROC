'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add columns only if they do not exist (SQLite/MySQL simple approach with try/catch)
    const table = 'Users';
    const addColumn = async (name, definition) => {
      try { await queryInterface.addColumn(table, name, definition); } catch (e) { /* ignore if exists */ }
    };
    await addColumn('username', { type: Sequelize.STRING });
    await addColumn('role', { type: Sequelize.STRING, defaultValue: 'User' });
    await addColumn('department', { type: Sequelize.STRING });
    await addColumn('status', { type: Sequelize.STRING, defaultValue: 'active' });
    await addColumn('mustChangePassword', { type: Sequelize.BOOLEAN, defaultValue: false });
    await addColumn('resetToken', { type: Sequelize.STRING });
    await addColumn('resetTokenExpiry', { type: Sequelize.DATE });
  },

  async down (queryInterface, Sequelize) {
    const table = 'Users';
    const removeColumn = async (name) => { try { await queryInterface.removeColumn(table, name); } catch (e) { /* ignore */ } };
    await removeColumn('username');
    await removeColumn('role');
    await removeColumn('department');
    await removeColumn('status');
    await removeColumn('mustChangePassword');
    await removeColumn('resetToken');
    await removeColumn('resetTokenExpiry');
  }
};
