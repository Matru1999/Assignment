const express = require('express');
const { Artist, Album, Track } = require('../models');
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

// Route to get all tracks
router.get('/', isAuthenticated, async (req, res) => {
  const { limit = 5, offset = 0, artist_id, album_id, hidden } = req.query;

  const where = {};
  if (artist_id !== undefined) {
    where.artist_id = artist_id;
  }
  if (album_id !== undefined) {
    where.album_id = album_id;
  }
  if (hidden !== undefined) {
    where.hidden = hidden === 'true';
  }

  try {
    const tracks = await Track.findAll({
      where,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      include: [
        { model: Album, as: 'album', attributes: ['name'], include: [{ model: Artist, as: 'artist', attributes: ['name'] }] }
      ]
    });
    res.status(200).json({
      status: 200,
      data: tracks,
      message: 'Tracks retrieved successfully.',
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

// Route to get a single track by ID
router.get('/:track_id', isAuthenticated, async (req, res) => {
  const { track_id } = req.params;

  try {
    const track = await Track.findByPk(track_id, {
      include: [
        { model: Album, as: 'album', attributes: ['name'], include: [{ model: Artist, as: 'artist', attributes: ['name'] }] }
      ]
    });
    if (!track) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: 'Track not found.',
        error: null
      });
    }
    res.status(200).json({
      status: 200,
      data: track,
      message: 'Track retrieved successfully.',
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

// Route to add a new track
router.post('/add-track', isAuthenticated, async (req, res) => {
  const { artist_id, album_id, name, duration, hidden } = req.body;

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

    await Track.create({ artist_id, album_id, name, duration, hidden });
    res.status(201).json({
      status: 201,
      data: null,
      message: 'Track created successfully.',
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

// Route to update a track by ID
router.put('/:track_id', isAuthenticated, async (req, res) => {
  const { track_id } = req.params;
  const { name, duration, hidden } = req.body;

  try {
    const track = await Track.findByPk(track_id);
    if (!track) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: 'Track not found.',
        error: null
      });
    }

    if (name !== undefined) track.name = name;
    if (duration !== undefined) track.duration = duration;
    if (hidden !== undefined) track.hidden = hidden;

    await track.save();
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

// Route to delete a track by ID
router.delete('/:track_id', isAuthenticated, async (req, res) => {
  const { track_id } = req.params;

  try {
    const track = await Track.findByPk(track_id);
    if (!track) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: 'Track not found.',
        error: null
      });
    }

    await track.destroy();
    res.status(200).json({
      status: 200,
      data: null,
      message: `Track: ${track.name} deleted successfully.`,
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
