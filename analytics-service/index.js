// analytics-service/index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const analyticsRoutes = require("./routes/analytics");

// Mount the analytics route
app.use("/api/analytics", analyticsRoutes);

// Health check for Kubernetes
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "analytics-service" });
});

// ENV variables
const PORT = process.env.PORT || 5004;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/coinkeeper";

// Connect to MongoDB and start the server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB for analytics-service");
    app.listen(PORT, () => {
      console.log(`Analytics service listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error for analytics-service:", err);
    process.exit(1);
  });
