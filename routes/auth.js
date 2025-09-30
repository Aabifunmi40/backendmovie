const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../model/user.model');

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// POST /api/auth/register - Create new user
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const newUser = new User({ email, password }); // TODO: hash password in production
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// POST /api/auth/login - Generate JWT token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// GET /api/auth/favorites - Fetch user's favorites
router.get('/favorites', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ favorites: user.favorites || [] });
  } catch (err) {
    console.error('Favorites fetch error:', err.message);
    res.status(500).json({ message: 'Server error fetching favorites' });
  }
});

// POST /api/auth/favorites - Add movie to favorites
router.post('/favorites', authenticateToken, async (req, res) => {
  try {
    const { movieId } = req.body;
    if (!movieId) {
      return res.status(400).json({ message: 'Movie ID required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.favorites.includes(String(movieId))) {
      user.favorites.push(String(movieId));
      await user.save();
    }

    res.json({ message: 'Movie added to favorites', favorites: user.favorites });
  } catch (err) {
    console.error('Add favorite error:', err.message);
    res.status(500).json({ message: 'Server error adding favorite' });
  }
});

module.exports = router;
