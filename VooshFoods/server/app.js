const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const authRoutes = require('../routes/authRoutes');
const userRoutes = require('../routes/userRoutes');
const artistRoutes = require('../routes/artistRoutes');
const albumRoutes = require('../routes/albumRoutes');
const trackRoutes = require('../routes/trackRoutes');
const favoriteRoutes = require('../routes/favoriteRoutes');

// Load environment variables from .env file
dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Serve the mock UI page
app.use(express.static(path.join(__dirname, '../public')));

// Define a route for the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use('/auth', authRoutes);
app.use('/favorites', favoriteRoutes);
app.use('/users', userRoutes);
app.use('/artists', artistRoutes);
app.use('/albums', albumRoutes);
app.use('/tracks', trackRoutes);

module.exports = app;
