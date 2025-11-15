// backend/routes/expenses.js

const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const authMiddleware = require("../middleware/auth");

// ✅ GET all expenses for the logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id })
      .sort({ date: -1 });

    res.json({ success: true, data: expenses });
  } catch (err) {
    console.error("Error fetching expenses:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ POST create a new expense
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, category, amount, date } = req.body;

    if (!title || !category || !amount || !date) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required" 
      });
    }

    const newExpense = new Expense({
      user: req.user.id,
      title: title.trim(),
      category: category.trim(),
      amount: Number(amount),
      date,
    });

    const savedExpense = await newExpense.save();
    res.status(201).json({ success: true, data: savedExpense });
  } catch (err) {
    console.error("Error creating expense:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ DELETE an expense
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({ 
        success: false, 
        message: "Expense not found" 
      });
    }

    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authorized" 
      });
    }

    await expense.deleteOne();
    res.json({ success: true, message: "Expense deleted" });
  } catch (err) {
    console.error("Error deleting expense:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
