const express = require('express');
const { User } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

// User registration
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

// User login
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

router.get('/logout', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(400).json({
      status: 400,
      data: null,
      message: 'Bad Request',
      error: 'No token provided'
    });
  }

  // Invalidate the token (implementation depends on your token management strategy)
  // For example, you can use a token blacklist or simply remove the token from client-side storage

  res.status(200).json({
    status: 200,
    data: null,
    message: 'User logged out successfully.',
    error: null
  });
});

// Define the /signup route
router.post('/signup', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Hash the password and create the user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, password: hashedPassword, email });

    return res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Error in signup:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
