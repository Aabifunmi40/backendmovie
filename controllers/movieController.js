const axios = require('axios');
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'; // Base URL for posters (w500 is a good size for thumbnails)

exports.searchMovies = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Please provide a movie name to search' });
    }
    const url = `${TMDB_BASE}/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(query)}`;
    console.log('Requesting URL:', url); // Debug log
    const response = await axios.get(url);
    console.log('Response data:', response.data); // Debug log to see full data
    // Map the results to include poster_path with full URL
    const moviesWithImages = response.data.results.map(movie => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster_path: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null, // Full image URL or null
      release_date: movie.release_date,
      vote_average: movie.vote_average
    }));
    res.json(moviesWithImages); // Return modified data
  } catch (error) {
    console.error('Error in searchMovies:', error.message, error.response ? error.response.data : 'No response data');
    res.status(500).json({ message: 'Error fetching movies', error: error.message });
  }
};