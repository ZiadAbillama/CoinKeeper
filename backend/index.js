// backend/index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const budgetsRouter = require("./routes/budgets");
const expensesRouter = require("./routes/expenses");
const analyticsRouter = require("./routes/analytics");

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// MongoDB connection
const mongoURI = process.env.MONGO_URI;
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// --- ROUTES ---
// Base test route
app.get("/", (req, res) => {
  res.send("🚀 CoinKeeper backend is running successfully!");
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/budgets", budgetsRouter);
app.use("/api/expenses", expensesRouter);
app.use("/api/analytics", analyticsRouter);

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));