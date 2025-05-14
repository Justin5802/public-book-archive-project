require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Book Review Schema
const reviewSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  review: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  genre: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Review = mongoose.model('Review', reviewSchema);

// Recommendation Quiz Schema
const quizSchema = new mongoose.Schema({
  mood: String,
  pace: String,
  length: String,
  genre: String,
  createdAt: { type: Date, default: Date.now }
});

const Quiz = mongoose.model('Quiz', quizSchema);

// API Routes
// Get all reviews
app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new review
app.post('/api/reviews', async (req, res) => {
  try {
    const review = new Review(req.body);
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get recommendations
app.post('/api/recommend', async (req, res) => {
  try {
    const quiz = new Quiz(req.body);
    await quiz.save();
    
    // Simple recommendation algorithm
    const { mood, pace, length, genre } = req.body;
    let query = { genre };
    
    if (mood === 'happy') query.rating = { $gte: 4 };
    if (mood === 'thoughtful') query.rating = { $gte: 3 };
    if (pace === 'slow') query.genre = { $in: [genre, 'Literary Fiction', 'Classic'] };
    if (length === 'short') query.genre = { $in: [genre, 'Short Stories', 'Novella'] };
    
    const recommendations = await Review.find(query).limit(5);
    res.json(recommendations);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Frontend Routes
app.get('/', (req, res) => res.render('index'));
app.get('/submit', (req, res) => res.render('submit'));
app.get('/recommend', (req, res) => res.render('recommend'));
app.get('/archive', async (req, res) => {
  const reviews = await Review.find().sort({ createdAt: -1 });
  res.render('archive', { reviews });
});
app.get('/book/:id', async (req, res) => {
  const review = await Review.findById(req.params.id);
  res.render('book', { review });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));