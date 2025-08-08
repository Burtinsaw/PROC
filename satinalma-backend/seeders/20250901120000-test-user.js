"use strict";
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const passwordHash = await bcrypt.hash('Test1234!', 10);
    // Insert only if not exists by email or username
    const [results] = await queryInterface.sequelize.query("SELECT id FROM `Users` WHERE `email` = 'test@example.com' OR `username` = 'testuser' LIMIT 1;");
    if (results.length === 0) {
      await queryInterface.bulkInsert('Users', [{
        username: 'testuser',
        email: 'test@example.com',
        password: passwordHash,
        firstName: 'Test',
        lastName: 'User',
        role: 'Admin',
        department: 'IT',
        status: 'active',
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }], {});
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', { email: 'test@example.com' }, {});
  }
};
