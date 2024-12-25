const { Artist } = require('../models');

exports.getArtists = async (req, res) => {
  try {
    const artists = await Artist.findAll();
    res.status(200).json({ status: 200, data: artists, message: 'Artists retrieved successfully' });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Error fetching artists', error: error.message });
  }
};

exports.getArtistById = async (req, res) => {
  const { id } = req.params;
  try {
    const artist = await Artist.findByPk(id);
    if (!artist) return res.status(404).json({ status: 404, message: 'Artist not found' });
    res.status(200).json({ status: 200, data: artist, message: 'Artist retrieved successfully' });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Error fetching artist', error: error.message });
  }
};

exports.addArtist = async (req, res) => {
  const { name, grammy, hidden } = req.body;
  try {
    const artist = await Artist.create({ name, grammy, hidden });
    res.status(201).json({ status: 201, message: 'Artist created successfully', data: artist });
  } catch (error) {
    res.status(400).json({ status: 400, message: 'Error creating artist', error: error.message });
  }
};

exports.updateArtist = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const artist = await Artist.findByPk(id);
    if (!artist) return res.status(404).json({ status: 404, message: 'Artist not found' });
    await artist.update(updates);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ status: 400, message: 'Error updating artist', error: error.message });
  }
};

exports.deleteArtist = async (req, res) => {
  const { id } = req.params;
  try {
    const artist = await Artist.findByPk(id);
    if (!artist) return res.status(404).json({ status: 404, message: 'Artist not found' });
    await artist.destroy();
    res.status(200).json({ status: 200, message: 'Artist deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Error deleting artist', error: error.message });
  }
};
