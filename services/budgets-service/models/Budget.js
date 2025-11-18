// backend/models/Budget.js

const mongoose = require("mongoose");

const BudgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: [true, "Budget category is required"],
      trim: true,
    },
    limit: {
      type: Number,
      required: [true, "Budget limit is required"],
      min: [0, "Limit must be positive"],
    },
  },
  { timestamps: true }
);

// One budget per user per category
BudgetSchema.index({ user: 1, category: 1 }, { unique: true });

module.exports = mongoose.model("Budget", BudgetSchema);