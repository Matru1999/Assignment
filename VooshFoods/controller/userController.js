const bcrypt = require('bcryptjs');
const { User } = require('../models');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json({ status: 200, data: users, message: 'Users retrieved successfully' });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Error fetching users', error: error.message });
  }
};

exports.addUser = async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, role });
    res.status(201).json({ status: 201, message: 'User created successfully', data: user });
  } catch (error) {
    res.status(400).json({ status: 400, message: 'Error creating user', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ status: 404, message: 'User not found' });
    await user.destroy();
    res.status(200).json({ status: 200, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Error deleting user', error: error.message });
  }
};

exports.updatePassword = async (req, res) => {
  const { old_password, new_password } = req.body;
  const userId = req.user.id;
  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ status: 404, message: 'User not found' });

    const isMatch = await bcrypt.compare(old_password, user.password);
    if (!isMatch) return res.status(400).json({ status: 400, message: 'Old password is incorrect' });

    user.password = await bcrypt.hash(new_password, 10);
    await user.save();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Error updating password', error: error.message });
  }
};
