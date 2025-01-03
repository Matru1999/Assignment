const app = require('./app');
const sequelize = require('../database');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate(); // Ensure the database connection is established
    await sequelize.sync(); // Sync the database models
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();
