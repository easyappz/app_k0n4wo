const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

const User = mongoose.model('User', UserSchema);

// Photo Schema
const PhotoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  url: { type: String, required: true },
  ratings: [{ userId: mongoose.Schema.Types.ObjectId, rating: Number }],
  averageRating: { type: Number, default: 0 }
});

const Photo = mongoose.model('Photo', PhotoSchema);

// Registration
router.post('/register', async (req, res) => {
  try {
    const { username, password, email, gender, age } = req.body;
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
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Password Reset Request
router.post('/reset-password-request', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Here you would typically send an email with a reset link
    // For this example, we'll just return a success message
    res.json({ message: 'Password reset link sent to email' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload Photo
router.post('/upload-photo', async (req, res) => {
  try {
    const { userId, photoUrl } = req.body;
    const photo = new Photo({ userId, url: photoUrl });
    await photo.save();
    res.status(201).json({ message: 'Photo uploaded successfully', photoId: photo._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Photos for Rating
router.get('/photos-for-rating', async (req, res) => {
  try {
    const { userId, gender, minAge, maxAge } = req.query;
    const userFilter = {};
    if (gender) userFilter.gender = gender;
    if (minAge && maxAge) userFilter.age = { $gte: minAge, $lte: maxAge };
    
    const photos = await Photo.aggregate([
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
      { $match: { 'user.0': { $exists: true }, ...userFilter } },
      { $sample: { size: 10 } }
    ]);
    
    res.json(photos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rate Photo
router.post('/rate-photo', async (req, res) => {
  try {
    const { userId, photoId, rating } = req.body;
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }
    
    photo.ratings.push({ userId, rating });
    photo.averageRating = photo.ratings.reduce((acc, curr) => acc + curr.rating, 0) / photo.ratings.length;
    await photo.save();
    
    // Update user points
    await User.findByIdAndUpdate(userId, { $inc: { points: 1 } });
    
    res.json({ message: 'Photo rated successfully', newAverageRating: photo.averageRating });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get User Points
router.get('/user-points/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ points: user.points });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
