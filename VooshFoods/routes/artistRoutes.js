const express = require('express');
const { Artist } = require('../models');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ status: 401, message: 'Unauthorized Access', error: null });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ status: 401, message: 'Unauthorized Access', error: error.message });
  }
}

// Route to get all artists
router.get('/', isAuthenticated, async (req, res) => {
  const { limit = 5, offset = 0, grammy, hidden } = req.query;

  const where = {};
  if (grammy !== undefined) {
    where.grammy = grammy;
  }
  if (hidden !== undefined) {
    where.hidden = hidden === 'true';
  }

  try {
    const artists = await Artist.findAll({
      where,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });
    res.status(200).json({
      status: 200,
      data: artists,
      message: 'Artists retrieved successfully.',
      error: null
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
      data: null,
      message: 'Bad Request',
      error: error.message
    });
  }
});

// Route to get a single artist by ID
router.get('/:id', isAuthenticated, async (req, res) => {
  const { id } = req.params;

  try {
    const artist = await Artist.findByPk(id);
    if (!artist) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: 'Artist not found.',
        error: null
      });
    }
    res.status(200).json({
      status: 200,
      data: artist,
      message: 'Artist retrieved successfully.',
      error: null
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
      data: null,
      message: 'Bad Request',
      error: error.message
    });
  }
});

// Route to add a new artist
router.post('/add-artist', isAuthenticated, async (req, res) => {
  const { name, grammy, hidden } = req.body;

  try {
    await Artist.create({ name, grammy, hidden });
    res.status(201).json({
      status: 201,
      data: null,
      message: 'Artist created successfully.',
      error: null
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
      data: null,
      message: 'Bad Request',
      error: error.message
    });
  }
});

// Route to update an artist by ID
router.put('/:id', isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { name, grammy, hidden } = req.body;

  try {
    const artist = await Artist.findByPk(id);
    if (!artist) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: 'Artist not found.',
        error: null
      });
    }

    if (name !== undefined) artist.name = name;
    if (grammy !== undefined) artist.grammy = grammy;
    if (hidden !== undefined) artist.hidden = hidden;

    await artist.save();
    res.status(204).send();
  } catch (error) {
    res.status(400).json({
      status: 400,
      data: null,
      message: 'Bad Request',
      error: error.message
    });
  }
});

// Route to delete an artist by ID
router.delete('/:id', isAuthenticated, async (req, res) => {
  const { id } = req.params;

  try {
    const artist = await Artist.findByPk(id);
    if (!artist) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: 'Artist not found.',
        error: null
      });
    }

    await artist.destroy();
    res.status(200).json({
      status: 200,
      data: { artist_id: id },
      message: `Artist: ${artist.name} deleted successfully.`,
      error: null
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
      data: null,
      message: 'Bad Request',
      error: error.message
    });
  }
});

module.exports = router;
