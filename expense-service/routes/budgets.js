// backend/routes/budgets.js

const express = require("express");
const router = express.Router();
const Budget = require("../models/Budget");
const Expense = require("../models/Expense");
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

    // Check for duplicate
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

// ✅ GET budget alerts with spending per category
router.get("/alerts", authMiddleware, async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id });
    
    if (budgets.length === 0) {
      return res.json({ 
        success: true, 
        data: { hasBudgets: false } 
      });
    }

    // Get current month expenses
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const expenses = await Expense.find({
      user: req.user.id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // Calculate spending per category
    const spentByCategory = {};
    expenses.forEach((expense) => {
      const cat = expense.category.trim();
      spentByCategory[cat] = (spentByCategory[cat] || 0) + expense.amount;
    });

    // Build alert data for each budget
    const categoryAlerts = budgets.map((budget) => {
      const spent = spentByCategory[budget.category] || 0;
      const remaining = budget.limit - spent;
      const percentUsed = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;

      return {
        category: budget.category,
        limit: budget.limit,
        spent: spent,
        remaining: remaining,
        percentUsed: Math.round(percentUsed),
        isOverBudget: spent > budget.limit,
        isNearLimit: percentUsed >= 80 && percentUsed < 100,
        isOnTrack: percentUsed < 80,
      };
    });

    res.json({
      success: true,
      data: {
        hasBudgets: true,
        categories: categoryAlerts,
      }
    });
  } catch (err) {
    console.error("Error fetching budget alerts:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ DELETE a budget
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    
    if (!budget) {
      return res
        .status(404)
        .json({ success: false, message: "Budget not found" });
    }

    if (budget.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized" });
    }

    await budget.deleteOne();
    res.json({ success: true, message: "Budget deleted successfully" });
  } catch (err) {
    console.error("Error deleting budget:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;