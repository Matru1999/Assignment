const { Favorite } = require('../models');

exports.getFavorites = async (req, res) => {
  const { category } = req.params;
  try {
    const favorites = await Favorite.findAll({ where: { category, user_id: req.user.id } });
    res.status(200).json({ status: 200, data: favorites, message: `Favorites for ${category} retrieved successfully` });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Error fetching favorites', error: error.message });
  }
};

exports.addFavorite = async (req, res) => {
  const { category, item_id } = req.body;
  try {
    const favorite = await Favorite.create({ category, item_id, user_id: req.user.id });
    res.status(201).json({ status: 201, message: 'Favorite added successfully', data: favorite });
  } catch (error) {
    res.status(400).json({ status: 400, message: 'Error adding favorite', error: error.message });
  }
};

exports.deleteFavorite = async (req, res) => {
  const { id } = req.params;
  try {
    const favorite = await Favorite.findByPk(id);
    if (!favorite) return res.status(404).json({ status: 404, message: 'Favorite not found' });
    await favorite.destroy();
    res.status(200).json({ status: 200, message: 'Favorite removed successfully' });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Error removing favorite', error: error.message });
  }
};
