// auth-service/index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables in development
dotenv.config();

const app = express();

// Basic middlewares
app.use(cors());
app.use(express.json());

// Import existing auth routes from backend (we copied them)
const authRoutes = require("./routes/authRoutes");

// Mount routes under /api/auth
app.use("/api/auth", authRoutes);

// Simple health endpoint for debugging / K8s probes
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "auth-service" });
});

// Use PORT from env or default to 5002 for auth-service
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Auth service listening on port ${PORT}`);
});
