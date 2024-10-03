// models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  surname: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  jobTitle: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Specify the collection name as 'crud'
module.exports = mongoose.model('User', userSchema, 'crud');
