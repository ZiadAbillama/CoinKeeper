// backend/index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const Expense = require("./models/Expense");
const Budget = require("./models/Budget");
const authRoutes = require("./routes/authRoutes");
const budgetsRouter = require("./routes/budgets");
const expensesRouter = require("./routes/expenses");

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
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

// Use routers
app.use("/api/expenses", expensesRouter);
app.use("/api/budgets", budgetsRouter);
app.use("/api/auth", authRoutes);

// Budget Alerts route
app.get("/api/budgets/alerts", async (req, res) => {
  try {
    const budgets = await Budget.find();
    const expenses = await Expense.find();

    const spentByCategory = {};
    expenses.forEach((exp) => {
      spentByCategory[exp.category] =
        (spentByCategory[exp.category] || 0) + exp.amount;
    });

    const alerts = budgets
      .filter((b) => spentByCategory[b.category] > b.limit)
      .map((b) => b.category);

    res.json({ success: true, alerts });
  } catch (err) {
    console.error("Error generating budget alerts:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
