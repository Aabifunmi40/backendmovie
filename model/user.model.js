const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // In production, hash passwords
  favorites: [{ type: String }], // Store movie IDs as strings
});

module.exports = mongoose.model('User', userSchema);