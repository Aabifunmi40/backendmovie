const mongoose = require('mongoose');

const connectToDb = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/movies_db';
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (err) {
    throw new Error('MongoDB connection error: ' + err.message);
  }
};

module.exports = connectToDb;