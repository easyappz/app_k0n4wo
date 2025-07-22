const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { mongoDb } = require('./db');

const router = express.Router();

// User Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  age: { type: Number },
  points: { type: Number, default: 0 }
});

const User = mongoDb.model('User', UserSchema);

// Photo Schema
const PhotoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  url: { type: String, required: true },
  ratings: [{ userId: mongoose.Schema.Types.ObjectId, rating: Number }],
  averageRating: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  gender: { type: String },
  age: { type: Number }
});

const Photo = mongoDb.model('Photo', PhotoSchema);

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const verified = jwt.verify(token, 'your_jwt_secret');
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

// Registration
router.post('/register', async (req, res) => {
  try {
    const { username, password, email, gender, age } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({ message: 'Please provide username, password and email' });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, email, gender, age });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ token, userId: user._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Password Reset Request
router.post('/reset-password-request', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide an email' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Here you would typically send an email with a reset link
    res.json({ message: 'Password reset link sent to email' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload Photo (protected route)
router.post('/upload-photo', verifyToken, async (req, res) => {
  try {
    const { photoUrl } = req.body;
    const userId = req.user.userId;

    if (!photoUrl) {
      return res.status(400).json({ message: 'Please provide a photo URL' });
    }

    const user = await User.findById(userId);
    const photo = new Photo({ userId, url: photoUrl, gender: user.gender, age: user.age });
    await photo.save();
    res.status(201).json({ message: 'Photo uploaded successfully', photoId: photo._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Photos for Rating (protected route)
router.get('/photos-for-rating', verifyToken, async (req, res) => {
  try {
    const { gender, minAge, maxAge } = req.query;
    const userId = req.user.userId;
    
    const filter = { isActive: true, userId: { $ne: userId } };
    if (gender) filter.gender = gender;
    if (minAge && maxAge) filter.age = { $gte: Number(minAge), $lte: Number(maxAge) };
    
    const photos = await Photo.aggregate([
      { $match: filter },
      { $sample: { size: 1 } }
    ]);
    
    res.json(photos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rate Photo (protected route)
router.post('/rate-photo', verifyToken, async (req, res) => {
  try {
    const { photoId, rating } = req.body;
    const userId = req.user.userId;

    if (!photoId || !rating) {
      return res.status(400).json({ message: 'Please provide photoId and rating' });
    }

    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }
    
    photo.ratings.push({ userId, rating });
    photo.averageRating = photo.ratings.reduce((acc, curr) => acc + curr.rating, 0) / photo.ratings.length;
    await photo.save();
    
    // Update user points
    await User.findByIdAndUpdate(userId, { $inc: { points: 1 } });
    await User.findByIdAndUpdate(photo.userId, { $inc: { points: -1 } });
    
    res.json({ message: 'Photo rated successfully', newAverageRating: photo.averageRating });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get User Points (protected route)
router.get('/user-points', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ points: user.points });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle Photo Active Status (protected route)
router.post('/toggle-photo-status', verifyToken, async (req, res) => {
  try {
    const { photoId } = req.body;
    const userId = req.user.userId;

    if (!photoId) {
      return res.status(400).json({ message: 'Please provide photoId' });
    }

    const user = await User.findById(userId);
    if (user.points <= 0) {
      return res.status(400).json({ message: 'Not enough points to toggle photo status' });
    }

    const photo = await Photo.findOne({ _id: photoId, userId });
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found or not owned by user' });
    }

    photo.isActive = !photo.isActive;
    await photo.save();

    res.json({ message: 'Photo status toggled successfully', isActive: photo.isActive });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get User Photos with Stats (protected route)
router.get('/user-photos', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const photos = await Photo.find({ userId });
    
    const photosWithStats = photos.map(photo => ({
      id: photo._id,
      url: photo.url,
      averageRating: photo.averageRating,
      totalRatings: photo.ratings.length,
      isActive: photo.isActive,
      genderStats: photo.ratings.reduce((acc, curr) => {
        acc[curr.gender] = (acc[curr.gender] || 0) + 1;
        return acc;
      }, {}),
      ageStats: photo.ratings.reduce((acc, curr) => {
        acc.total += curr.age;
        acc.count += 1;
        return acc;
      }, { total: 0, count: 0 })
    }));

    res.json(photosWithStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
