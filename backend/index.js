// Import dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create an Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Create a simple Mongoose schema/model for testing
const testSchema = new mongoose.Schema({
  message: String,
});

const Test = mongoose.model('Test', testSchema);

// Default route
app.get('/', (req, res) => {
  res.send('🚀 CoinKeeper backend is running successfully!');
});

// GET route — Fetch all test messages
app.get('/test', async (req, res) => {
  try {
    const tests = await Test.find();
    res.json({ success: true, count: tests.length, data: tests });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST route — Add a test message
app.post('/test', async (req, res) => {
  try {
    const test = await Test.create({ message: 'Hello MongoDB from CoinKeeper!' });
    res.json({ success: true, data: test });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
