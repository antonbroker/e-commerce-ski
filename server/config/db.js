const mongoose = require('mongoose');

/**
 * Connection to MongoDB
 * Uses URI from .env file
 */
const connectDB = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ MongoDB connected successfully');
    console.log(`📦 Database: ${mongoose.connection.name}`);

  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    // End the process if we can't connect to the DB
    process.exit(1);
  }
};

module.exports = connectDB;

