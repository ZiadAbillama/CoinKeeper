// expense-service/index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Import routes (copied from backend)
const expensesRoutes = require("./routes/expenses");
const budgetsRoutes = require("./routes/budgets");
const analyticsRoutes = require("./routes/analytics");

// Mount routes
app.use("/api/expenses", expensesRoutes);
app.use("/api/budgets", budgetsRoutes);
app.use("/api/analytics", analyticsRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "expense-service" });
});

// Port & DB connection string
const PORT = process.env.PORT || 5003;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/coinkeeper";

// Connect to MongoDB, then start server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB for expense-service");
    app.listen(PORT, () => {
      console.log(`Expense service listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB for expense-service:", err);
    process.exit(1);
  });
