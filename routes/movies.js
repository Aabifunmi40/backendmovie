const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');

// ✅ Middleware
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

// ✅ 1. SEARCH ROUTE FIRST
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Query parameter required' });
    }
    const response = await axios.get(
      `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(query)}`
    );
    res.json(response.data.results || []);
  } catch (err) {
    console.error('TMDB search error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Server error searching movies' });
  }
});

// ✅ 2. DETAILS ROUTE SECOND
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.TMDB_API_KEY}`
    );
    const movie = response.data;
    if (!movie || movie.success === false) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.json(movie);
  } catch (err) {
    console.error('TMDB error:', err.response?.data || err.message);
    if (err.response?.status === 404) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.status(500).json({ message: 'Server error fetching movie details' });
  }
});

module.exports = router;
