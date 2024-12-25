const express = require('express');
const { Favorite, Artist, Album, Track, User } = require('../models');
const { authenticate } = require('../auth');
const router = express.Router();

// Route to get all favorites by category
router.get('/:category', authenticate, async (req, res) => {
  const { category } = req.params;
  const { limit = 5, offset = 0 } = req.query;

  const where = { category, user_id: req.user.user_id };

  try {
    const favorites = await Favorite.findAll({
      where,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      include: [
        { model: User, as: 'user', attributes: ['email'] }
      ]
    });
    res.status(200).json({
      status: 200,
      data: favorites,
      message: 'Favorites retrieved successfully.',
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

// Route to add a new favorite
router.post('/add-favorite', authenticate, async (req, res) => {
  const { category, item_id } = req.body;

  console.log("Received user_id:", req.user.user_id); // Check the value here

  // Ensure the user_id exists and is valid
  if (!req.user || !req.user.user_id) {
    return res.status(400).json({
      status: 400,
      data: null,
      message: 'User ID is missing or invalid.',
      error: 'User ID is required.',
    });
  }

  try {
    let artist_name = null;
    let album_name = null;
    let track_name = null;

    if (category === 'artist') {
      const artist = await Artist.findByPk(item_id);
      if (artist) {
        artist_name = artist.name;
      }
    } else if (category === 'album') {
      const album = await Album.findByPk(item_id);
      if (album) {
        album_name = album.name;
      }
    } else if (category === 'track') {
      const track = await Track.findByPk(item_id);
      if (track) {
        track_name = track.name;
      }
    }

    console.log("Creating favorite with user_id:", req.user.user_id, " and item_id:", item_id);

    await Favorite.create({ category, item_id, user_id: req.user.user_id, artist_name, album_name, track_name });
    res.status(201).json({
      status: 201,
      data: null,
      message: 'Favorite added successfully.',
      error: null
    });
  } catch (error) {
    console.error("Error creating favorite:", error); // Log error details
    res.status(400).json({
      status: 400,
      data: null,
      message: 'Bad Request',
      error: error.errors ? error.errors : error.message
    });
  }
});

// Route to delete a favorite by ID
router.delete('/remove-favorite/:favorite_id', authenticate, async (req, res) => {
  const { favorite_id } = req.params;

  try {
    const favorite = await Favorite.findByPk(favorite_id);
    if (!favorite) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: 'Favorite not found.',
        error: null
      });
    }

    await favorite.destroy();
    res.status(200).json({
      status: 200,
      data: null,
      message: 'Favorite removed successfully.',
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
