// services/analytics-service/index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const analyticsRouter = require("./routes/analytics");
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
    console.log("✅ [analytics-service] Connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ [analytics-service] MongoDB connection error:", err);
    process.exit(1);
  });

// Health check
app.get("/", (req, res) => {
  res.json({ service: "analytics-service", status: "OK" });
});

// Protect all analytics routes with JWT auth
app.use("/api/analytics", authMiddleware, analyticsRouter);

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`🚀 [analytics-service] Listening on port ${PORT}`);
});
