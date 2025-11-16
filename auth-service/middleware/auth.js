// backend/middleware/auth.js

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ✅ Middleware to protect routes
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided or invalid authorization format",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found or unauthorized",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("❌ Auth Middleware Error:", err.message);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again.",
      });
    }

    res.status(401).json({
      success: false,
      message: "Invalid or missing authentication token",
    });
  }
};

module.exports = authMiddleware;
