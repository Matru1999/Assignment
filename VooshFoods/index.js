const dotenv = require('dotenv');
const app = require('./server/app');
const sequelize = require('./database');

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate(); // Ensure the database connection is established
    await sequelize.sync(); // Sync the database models
    app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`)); // Listen on all IPs
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();
