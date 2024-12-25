const { Album } = require('../models');

exports.getAlbums = async (req, res) => {
  try {
    const albums = await Album.findAll();
    res.status(200).json({ status: 200, data: albums, message: 'Albums retrieved successfully' });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Error fetching albums', error: error.message });
  }
};

exports.getAlbumById = async (req, res) => {
  const { id } = req.params;
  try {
    const album = await Album.findByPk(id);
    if (!album) return res.status(404).json({ status: 404, message: 'Album not found' });
    res.status(200).json({ status: 200, data: album, message: 'Album retrieved successfully' });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Error fetching album', error: error.message });
  }
};

exports.addAlbum = async (req, res) => {
  const { name, year, hidden, artist_id } = req.body;
  try {
    const album = await Album.create({ name, year, hidden, artist_id });
    res.status(201).json({ status: 201, message: 'Album created successfully', data: album });
  } catch (error) {
    res.status(400).json({ status: 400, message: 'Error creating album', error: error.message });
  }
};

exports.updateAlbum = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const album = await Album.findByPk(id);
    if (!album) return res.status(404).json({ status: 404, message: 'Album not found' });
    await album.update(updates);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ status: 400, message: 'Error updating album', error: error.message });
  }
};

exports.deleteAlbum = async (req, res) => {
  const { id } = req.params;
  try {
    const album = await Album.findByPk(id);
    if (!album) return res.status(404).json({ status: 404, message: 'Album not found' });
    await album.destroy();
    res.status(200).json({ status: 200, message: 'Album deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Error deleting album', error: error.message });
  }
};
