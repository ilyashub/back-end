// server.js

// 1. Load Environment Variables
const dotenv = require('dotenv');
const path = require('path');

// Configure dotenv to load variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

// 2. Import Dependencies
const express = require('express');
const cors = require('cors'); // Import cors
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');

// 3. Import the User Model
const User = require('./models/User');

// 4. Initialize Express App
const app = express();

// 5. Middleware Setup

// CORS Configuration
app.use(cors({
  origin: 'http://localhost:3000', // Frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  credentials: true // Allow cookies and other credentials
}));

// Middleware to parse JSON bodies
app.use(express.json());

// 6. Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1); // Exit process with failure
});

// 7. Define a Basic Route
app.get('/', (req, res) => {
  res.send('🚀 Server is running!');
});

// 8. Define a POST Route to Create a User with Validation (/sign-up)
app.post('/sign-up',
  [
    body('name').notEmpty().withMessage('Name is required.'),
    body('surname').notEmpty().withMessage('Surname is required.'),
    body('email').isEmail().withMessage('Valid email is required.'),
    body('jobTitle').notEmpty().withMessage('Job title is required.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, surname, email, jobTitle } = req.body;

      // Check for Existing User with the Same Email
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists.' });
      }

      // Create a New User Instance
      const newUser = new User({
        name,
        surname,
        email,
        jobTitle
      });

      // Save the User to the Database
      const savedUser = await newUser.save();

      // Respond with the Saved User Data
      res.status(201).json(savedUser);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// 9. Define Additional CRUD Routes

// Retrieve all users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users from the 'crud' collection
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Retrieve a user by ID
app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id); // Fetch user by ID
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a user by ID
app.put('/users/:id', 
  [
    body('name').notEmpty().withMessage('Name is required.'),
    body('surname').notEmpty().withMessage('Surname is required.'),
    body('email').isEmail().withMessage('Valid email is required.'),
    body('jobTitle').notEmpty().withMessage('Job title is required.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, surname, email, jobTitle } = req.body;

      // Check for Existing User with the Same Email (Exclude Current User)
      const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Another user with this email already exists.' });
      }

      // Find and Update the User
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { name, surname, email, jobTitle },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found.' });
      }

      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Delete a user by ID
app.delete('/users/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id); // Delete user by ID

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 10. Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is listening on port ${PORT}`);
});