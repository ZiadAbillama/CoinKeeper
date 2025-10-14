// backend/routes/budgets.js

const express = require("express");
const router = express.Router();
const Budget = require("../models/Budget");
const Expense = require("../models/Expense"); // to clean up related expenses if needed
const authMiddleware = require("../middleware/auth");

// ✅ GET all budgets for logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, data: budgets });
  } catch (err) {
    console.error("Error fetching budgets:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ POST create a new budget
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { category, limit } = req.body;

    if (!category || !limit) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Avoid duplicate categories
    const existing = await Budget.findOne({
      user: req.user.id,
      category: category.trim(),
    });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Budget for this category already exists" });
    }

    const newBudget = new Budget({
      user: req.user.id,
      category: category.trim(),
      limit: Number(limit),
    });

    const savedBudget = await newBudget.save();
    res.status(201).json({ success: true, data: savedBudget });
  } catch (err) {
    console.error("Error creating budget:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ DELETE a budget
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget)
      return res
        .status(404)
        .json({ success: false, message: "Budget not found" });

    // Ensure ownership
    if (budget.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized" });
    }

    // Optional: also unlink or delete related expenses
    await Expense.updateMany({ budget: budget._id }, { $set: { budget: null } });

    await budget.deleteOne();
    res.json({ success: true, message: "Budget deleted successfully" });
  } catch (err) {
    console.error("Error deleting budget:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
