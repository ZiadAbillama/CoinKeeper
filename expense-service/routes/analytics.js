// backend/routes/analytics.js

const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const Budget = require("../models/Budget");
const authMiddleware = require("../middleware/auth");

// Get spending trends (last 6 months)
// Get spending trends (last 12 weeks)
router.get("/trends", authMiddleware, async (req, res) => {
  try {
    const twelveWeeksAgo = new Date();
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84); // 12 weeks

    const expenses = await Expense.find({
      user: req.user.id,
      date: { $gte: twelveWeeksAgo }
    }).sort({ date: 1 });

    // Group by week
    const weeklyData = {};
    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      
      // Calculate week start (Sunday)
      const weekStart = new Date(expenseDate);
      weekStart.setDate(expenseDate.getDate() - expenseDate.getDay());
      
      // Format as "MMM DD" for the week start date
      const weekKey = weekStart.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          week: weekKey,
          total: 0,
          date: weekStart
        };
      }
      weeklyData[weekKey].total += expense.amount;
    });

    // Convert to array and sort by date
    const trends = Object.values(weeklyData)
      .sort((a, b) => a.date - b.date)
      .map(item => ({
        week: item.week,
        total: item.total
      }));

    res.json({ success: true, data: trends });
  } catch (err) {
    console.error("Error fetching trends:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get spending by category (current month)
router.get("/categories", authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const expenses = await Expense.find({
      user: req.user.id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // Group by category
    const categoryData = {};
    expenses.forEach(expense => {
      const cat = expense.category;
      if (!categoryData[cat]) {
        categoryData[cat] = 0;
      }
      categoryData[cat] += expense.amount;
    });

    // Convert to array format
    const categories = Object.keys(categoryData).map(category => ({
      category,
      amount: categoryData[category]
    }));

    res.json({ success: true, data: categories });
  } catch (err) {
    console.error("Error fetching category data:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get budget vs actual comparison
router.get("/budget-comparison", authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [budgets, expenses] = await Promise.all([
      Budget.find({ user: req.user.id }),
      Expense.find({
        user: req.user.id,
        date: { $gte: startOfMonth, $lte: endOfMonth }
      })
    ]);

    // Calculate spending per category
    const spentByCategory = {};
    expenses.forEach(expense => {
      const cat = expense.category;
      spentByCategory[cat] = (spentByCategory[cat] || 0) + expense.amount;
    });

    // Build comparison data
    const comparison = budgets.map(budget => ({
      category: budget.category,
      budget: budget.limit,
      actual: spentByCategory[budget.category] || 0
    }));

    res.json({ success: true, data: comparison });
  } catch (err) {
    console.error("Error fetching budget comparison:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;