const express = require('express');
const bcrypt = require('bcryptjs'); // Ensure bcryptjs is used
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const router = express.Router();

// Middleware to check if the user is an admin
function isAdmin(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ status: 401, message: 'Unauthorized Access', error: null });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'Admin') {
      return res.status(403).json({ status: 403, message: 'Forbidden', error: null });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ status: 401, message: 'Unauthorized Access', error: error.message });
  }
}

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

// Route to get all users (Admin only)
router.get('/', isAdmin, async (req, res) => {
  const { limit = 5, offset = 0, role } = req.query;

  const where = {};
  if (role) {
    where.role = role;
  }

  try {
    const users = await User.findAll({
      where,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });
    res.status(200).json({
      status: 200,
      data: users,
      message: 'Users retrieved successfully.',
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

// Route to add a new user (Admin only)
router.post('/add-user', isAdmin, async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({
      status: 400,
      data: null,
      message: 'Bad Request',
      error: 'Email, password, and role are required.'
    });
  }

  if (role === 'Admin') {
    return res.status(403).json({
      status: 403,
      data: null,
      message: 'Forbidden Access/Operation not allowed.',
      error: 'Cannot create a user with the role "Admin".'
    });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        status: 409,
        data: null,
        message: 'Email already exists.',
        error: null
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      email,
      password: hashedPassword,
      role
    });

    res.status(201).json({
      status: 201,
      data: null,
      message: 'User created successfully.',
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

// Route to delete a user (Admin only)
router.delete('/:id', isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: 'User not found.',
        error: null
      });
    }

    await user.destroy();
    res.status(200).json({
      status: 200,
      data: null,
      message: 'User deleted successfully.',
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

// Route to get all artists
router.get('/artists', isAuthenticated, async (req, res) => {
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

// Route to update user password
router.put('/update-password', async (req, res) => {
  const { old_password, new_password } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ status: 401, message: 'Unauthorized Access', error: null });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: 'User not found.',
        error: null
      });
    }

    const isMatch = await bcrypt.compare(old_password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: 'Old password is incorrect.',
        error: null
      });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    user.password = hashedPassword;
    await user.save();

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

// User registration route
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });

    const token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET, {
      expiresIn: '1h', // Token expiry
    });

    res.status(201).json({
      status: 201,
      data: { token },
      message: 'User registered successfully.',
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

// User login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: 'User not found.',
        error: null
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 401,
        data: null,
        message: 'Invalid password.',
        error: null
      });
    }

    const token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET, {
      expiresIn: '1h', // Token expiry
    });

    res.status(200).json({
      status: 200,
      data: { token },
      message: 'Login successful.',
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
