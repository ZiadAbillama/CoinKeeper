// auth-service/index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const client = require("prom-client");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ===== Prometheus metrics setup =====
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"]
});

app.use((req, res, next) => {
  res.on("finish", () => {
    httpRequestCounter.labels(req.method, req.path, res.statusCode).inc();
  });
  next();
});

// Metrics endpoint
app.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
  } catch (err) {
    console.error("Error generating metrics:", err);
    res.status(500).send("Error generating metrics");
  }
});

// ===== Routes =====
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "auth-service" });
});

// ===== DB connection =====
const PORT = process.env.PORT || 5002;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/coinkeeper-auth";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB for auth-service");
    app.listen(PORT, () => {
      console.log(`Auth service listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB for auth-service:", err);
    process.exit(1);
  });
