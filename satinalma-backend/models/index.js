'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const fullPath = path.join(__dirname, file);
    const content = fs.readFileSync(fullPath, 'utf8').trim();
    if (!content) {
      console.warn(`⚠️  Skipping empty model file: ${file}`);
      return;
    }
    const required = require(fullPath);
    if (typeof required !== 'function') {
      console.warn(`⚠️  Skipping non-factory export in model file: ${file}`);
      return;
    }
    const model = required(sequelize, Sequelize.DataTypes);
    if (model && model.name) {
      db[model.name] = model;
    }
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
