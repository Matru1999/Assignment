const dotenv = require('dotenv');
const sequelize = require('./database');
const app = require('./server/app');

dotenv.config();

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await sequelize.sync(); // Removed { alter: true }
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();
