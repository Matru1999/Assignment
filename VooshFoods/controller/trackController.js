const { Track } = require('../models');

exports.getTracks = async (req, res) => {
  try {
    const tracks = await Track.findAll();
    res.status(200).json({ status: 200, data: tracks, message: 'Tracks retrieved successfully' });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Error fetching tracks', error: error.message });
  }
};

exports.getTrackById = async (req, res) => {
  const { id } = req.params;
  try {
    const track = await Track.findByPk(id);
    if (!track) return res.status(404).json({ status: 404, message: 'Track not found' });
    res.status(200).json({ status: 200, data: track, message: 'Track retrieved successfully' });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Error fetching track', error: error.message });
  }
};

exports.addTrack = async (req, res) => {
  const { name, duration, hidden, album_id } = req.body;
  try {
    const track = await Track.create({ name, duration, hidden, album_id });
    res.status(201).json({ status: 201, message: 'Track created successfully', data: track });
  } catch (error) {
    res.status(400).json({ status: 400, message: 'Error creating track', error: error.message });
  }
};

exports.updateTrack = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const track = await Track.findByPk(id);
    if (!track) return res.status(404).json({ status: 404, message: 'Track not found' });
    await track.update(updates);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ status: 400, message: 'Error updating track', error: error.message });
  }
};

exports.deleteTrack = async (req, res) => {
  const { id } = req.params;
  try {
    const track = await Track.findByPk(id);
    if (!track) return res.status(404).json({ status: 404, message: 'Track not found' });
    await track.destroy();
    res.status(200).json({ status: 200, message: 'Track deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Error deleting track', error: error.message });
  }
};
