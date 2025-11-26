// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import BudgetAlerts from "../components/BudgetAlerts";

export default function DashboardPage() {
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expensesRes, budgetsRes] = await Promise.all([
          API.get("/expenses"),
          API.get("/budgets"),
        ]);

        setExpenses(expensesRes.data.data || []);
        setBudgets(budgetsRes.data.data || []);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="text-center text-gray-400 py-10">
        Loading your dashboard…
      </div>
    );
  }

  // Calculate spending per category
  const spentByCategory = {};
  expenses.forEach((expense) => {
    const cat = expense.category;
    spentByCategory[cat] = (spentByCategory[cat] || 0) + expense.amount;
  });

  // Calculate totals
  const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalBudgetLimit = budgets.reduce((sum, b) => sum + (b.limit || 0), 0);
  const totalRemaining = totalBudgetLimit - totalSpent;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-emerald-400">
          Welcome to CoinKeeper Guys!
        </h1>
        <p className="text-gray-400 mt-1">
          Your personal finance tracker – all in one place 💰
        </p>
      </div>

      {/* Alerts */}
      <BudgetAlerts />

      {/* Overall Summary */}
      <div className="bg-gray-800/60 rounded-lg p-6 shadow-md space-y-4">
        <h2 className="text-2xl font-semibold text-emerald-300 mb-4">
          Overall Summary
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-gray-900/70 rounded-lg p-4 text-center">
            <h3 className="text-gray-400 text-sm">Total Spent</h3>
            <p className="text-2xl font-bold text-red-400">
              ${totalSpent.toFixed(2)}
            </p>
          </div>

          <div className="bg-gray-900/70 rounded-lg p-4 text-center">
            <h3 className="text-gray-400 text-sm">Total Budget</h3>
            <p className="text-2xl font-bold text-emerald-300">
              ${totalBudgetLimit.toFixed(2)}
            </p>
          </div>

          <div className="bg-gray-900/70 rounded-lg p-4 text-center">
            <h3 className="text-gray-400 text-sm">Total Remaining</h3>
            <p className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-yellow-400' : 'text-red-400'}`}>
              ${Math.abs(totalRemaining).toFixed(2)}
              {totalRemaining < 0 && ' over'}
            </p>
          </div>
        </div>
      </div>

      {/* Budget Breakdown by Category */}
      {budgets.length > 0 && (
        <div className="bg-gray-800/60 rounded-lg p-6 shadow-md space-y-4">
          <h2 className="text-2xl font-semibold text-emerald-300 mb-4">
            Category Summary
          </h2>
          <div className="space-y-3">
            {budgets.map((budget) => {
              const spent = spentByCategory[budget.category] || 0;
              const remaining = budget.limit - spent;
              const percentUsed = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;

              return (
                <div
                  key={budget._id}
                  className="bg-gray-900/70 rounded-lg p-4 border border-gray-700/40"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-emerald-300">
                      {budget.category}
                    </h3>
                    <span className={`text-sm font-medium ${
                      percentUsed >= 100 ? 'text-red-400' : 
                      percentUsed >= 80 ? 'text-orange-400' : 
                      'text-green-400'
                    }`}>
                      {Math.round(percentUsed)}%
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-gray-400">Spent</p>
                      <p className="text-lg font-bold text-red-400">
                        ${spent.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Budget</p>
                      <p className="text-lg font-bold text-emerald-300">
                        ${budget.limit.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Remaining</p>
                      <p className={`text-lg font-bold ${remaining >= 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                        ${Math.abs(remaining).toFixed(2)}
                        {remaining < 0 && ' over'}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        percentUsed >= 100 ? 'bg-red-500' :
                        percentUsed >= 80 ? 'bg-orange-500' :
                        'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(percentUsed, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="bg-gray-800/60 rounded-lg p-6 shadow space-y-3">
        <h2 className="text-xl font-semibold mb-2 text-emerald-300">
          Quick Access
        </h2>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/expenses"
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all"
          >
            View Expenses
          </Link>
          <Link
            to="/budgets"
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all"
          >
            Manage Budgets
          </Link>
        </div>
      </div>
    </div>
  );
}
