'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Ek alanlar (model ile senkron)
    await queryInterface.addColumn('Users', 'username', { type: Sequelize.STRING });
    await queryInterface.addColumn('Users', 'role', { type: Sequelize.STRING, defaultValue: 'User' });
    await queryInterface.addColumn('Users', 'department', { type: Sequelize.STRING });
    await queryInterface.addColumn('Users', 'status', { type: Sequelize.STRING, defaultValue: 'active' });
    await queryInterface.addColumn('Users', 'mustChangePassword', { type: Sequelize.BOOLEAN, defaultValue: false });
    await queryInterface.addColumn('Users', 'resetToken', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('Users', 'resetTokenExpiry', { type: Sequelize.DATE, allowNull: true });
  },

  async down (queryInterface) {
    await queryInterface.removeColumn('Users', 'username');
    await queryInterface.removeColumn('Users', 'role');
    await queryInterface.removeColumn('Users', 'department');
    await queryInterface.removeColumn('Users', 'status');
    await queryInterface.removeColumn('Users', 'mustChangePassword');
    await queryInterface.removeColumn('Users', 'resetToken');
    await queryInterface.removeColumn('Users', 'resetTokenExpiry');
  }
};
