const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectToDb = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to database
connectToDb()
  .then(() => console.log('Database connected successfully'))
  .catch((err) => {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/movies', require('./routes/movies'));

// Default route
app.get('/', (req, res) => {
  res.send('Movies API is running...');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ message: 'Something went wrong', error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server startup error:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is in use. Try a different port.`);
  }
  process.exit(1);
});