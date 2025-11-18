// services/auth-service/index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ [auth-service] Connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ [auth-service] MongoDB connection error:", err);
    process.exit(1);
  });

// Health check
app.get("/", (req, res) => {
  res.json({ service: "auth-service", status: "OK" });
});

// Routes
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`🚀 [auth-service] Listening on port ${PORT}`);
});
