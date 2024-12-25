const express = require('express');
const { Artist, Album } = require('../models');
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

// Route to get all albums
router.get('/', isAuthenticated, async (req, res) => {
  const { limit = 5, offset = 0, artist_id, hidden } = req.query;

  const where = {};
  if (artist_id !== undefined) {
    where.artist_id = artist_id;
  }
  if (hidden !== undefined) {
    where.hidden = hidden === 'true';
  }

  try {
    const albums = await Album.findAll({
      where,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      include: [{ model: Artist, as: 'artist', attributes: ['name'] }]
    });
    res.status(200).json({
      status: 200,
      data: albums,
      message: 'Albums retrieved successfully.',
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

// Route to get a single album by ID
router.get('/:album_id', isAuthenticated, async (req, res) => {
  const { album_id } = req.params;

  try {
    const album = await Album.findByPk(album_id, {
      include: [{ model: Artist, as: 'artist', attributes: ['name'] }]
    });
    if (!album) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: 'Album not found.',
        error: null
      });
    }
    res.status(200).json({
      status: 200,
      data: album,
      message: 'Album retrieved successfully.',
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

// Route to add a new album
router.post('/add-album', isAuthenticated, async (req, res) => {
  const { artist_id, name, year, hidden } = req.body;

  try {
    const artist = await Artist.findByPk(artist_id);
    if (!artist) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: 'Artist not found.',
        error: null
      });
    }

    await Album.create({ artist_id, name, year, hidden });
    res.status(201).json({
      status: 201,
      data: null,
      message: 'Album created successfully.',
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

// Route to update an album by ID
router.put('/:album_id', isAuthenticated, async (req, res) => {
  const { album_id } = req.params;
  const { name, year, hidden } = req.body;

  try {
    const album = await Album.findByPk(album_id);
    if (!album) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: 'Album not found.',
        error: null
      });
    }

    if (name !== undefined) album.name = name;
    if (year !== undefined) album.year = year;
    if (hidden !== undefined) album.hidden = hidden;

    await album.save();
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

// Route to delete an album by ID
router.delete('/:album_id', isAuthenticated, async (req, res) => {
  const { album_id } = req.params;

  try {
    const album = await Album.findByPk(album_id);
    if (!album) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: 'Album not found.',
        error: null
      });
    }

    await album.destroy();
    res.status(200).json({
      status: 200,
      data: null,
      message: `Album: ${album.name} deleted successfully.`,
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
