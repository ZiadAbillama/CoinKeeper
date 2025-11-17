// expense-service/index.js
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

// Collect default Node.js + process metrics
collectDefaultMetrics();

// Optional: custom counter for HTTP requests
const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"]
});

// Small middleware to bump the counter on each response
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    httpRequestCounter.labels(req.method, req.path, res.statusCode).inc();
  });

  next();
});

// Expose /metrics for Prometheus scraping
app.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
  } catch (err) {
    console.error("Error generating metrics:", err);
    res.status(500).send("Error generating metrics");
  }
});

// ===== Existing routes =====
const expensesRoutes = require("./routes/expenses");
const budgetsRoutes = require("./routes/budgets");
const analyticsRoutes = require("./routes/analytics");

app.use("/api/expenses", expensesRoutes);
app.use("/api/budgets", budgetsRoutes);
app.use("/api/analytics", analyticsRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "expense-service" });
});

// ===== MongoDB connection =====
const PORT = process.env.PORT || 5003;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/coinkeeper";

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
