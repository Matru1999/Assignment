const { Sequelize } = require('sequelize');

// Replace with your actual database credentials
const sequelize = new Sequelize('music_library', 'root', 'Pass@123', {
  host: 'localhost',
  dialect: 'mysql', // or 'postgres', 'sqlite', 'mariadb', 'mssql'
});

module.exports = sequelize;