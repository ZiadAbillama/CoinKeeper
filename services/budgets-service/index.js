// services/budgets-service/index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const budgetsRouter = require("./routes/budgets");
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
    console.log("✅ [budgets-service] Connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ [budgets-service] MongoDB connection error:", err);
    process.exit(1);
  });

// Health check
app.get("/", (req, res) => {
  res.json({ service: "budgets-service", status: "OK" });
});

// Protect all budget routes with JWT auth
app.use("/api/budgets", authMiddleware, budgetsRouter);

const PORT = process.env.PORT || 5004;
app.listen(PORT, () => {
  console.log(`🚀 [budgets-service] Listening on port ${PORT}`);
});
