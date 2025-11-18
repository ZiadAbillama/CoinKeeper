// services/expenses-service/index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const expensesRouter = require("./routes/expenses");
const authMiddleware = require("./middleware/auth");

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ [expenses-service] Connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ [expenses-service] MongoDB connection error:", err);
    process.exit(1);
  });

// Health check
app.get("/", (req, res) => {
  res.json({ service: "expenses-service", status: "OK" });
});

// Protect all expense routes with JWT auth
app.use("/api/expenses", authMiddleware, expensesRouter);

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`🚀 [expenses-service] Listening on port ${PORT}`);
});
