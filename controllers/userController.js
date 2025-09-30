const User = require('../model/user.model'); // Adjust path based on your structure
const bcrypt = require('bcryptjs'); // For password encryption
const jwt = require('jsonwebtoken'); // For creating tokens

// Register a new user
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body; // Get data from the request
    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }
    // Check if username already exists
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'Username is already taken' });
    }
    // Encrypt the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create new user
    const user = new User({ username, password: hashedPassword });
    await user.save(); // Save to database
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// Login a user
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }
    // Find user and check password
    const user = await User.findOne({ username });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    // Create a token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token }); // Send token back
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

exports.addFavorite = async (req, res) => {
  try {
    const { movieId } = req.body; // Expect movieId from frontend
    if (!movieId) {
      return res.status(400).json({ message: 'Movie ID is required' });
    }
    console.log('req.user:', req.user); // Debug: Check if req.user is set
    const user = await User.findById(req.user.id); // Assume req.user from auth middleware
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!user.favorites) user.favorites = []; // Initialize favorites if undefined
    if (!user.favorites.includes(movieId)) {
      user.favorites.push(movieId);
      await user.save();
    }
    res.json({ message: 'Movie added to favorites', favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};