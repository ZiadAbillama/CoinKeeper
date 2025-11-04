// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // ✅ FIXED — added import
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

        // ✅ Safely handle nested response data
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-emerald-400">
          Welcome to CoinKeeper
        </h1>
        <p className="text-gray-400 mt-1">
          Your personal finance tracker — all in one place 💰
        </p>
      </div>

      {/* Alerts */}
      <BudgetAlerts />

      {/* Overview Section */}
      <div className="bg-gray-800/60 rounded-lg p-6 shadow-md space-y-4">
        <h2 className="text-2xl font-semibold text-emerald-300">
          Overview Summary
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900/70 rounded-lg p-4 text-center">
            <h3 className="text-gray-400">Total Expenses</h3>
            <p className="text-2xl font-bold text-red-400">
              ${expenses.reduce((sum, e) => sum + (e.amount || 0), 0).toFixed(2)}
            </p>
          </div>

          <div className="bg-gray-900/70 rounded-lg p-4 text-center">
            <h3 className="text-gray-400">Budget Categories</h3>
            <p className="text-2xl font-bold text-emerald-400">{budgets.length}</p>
          </div>

          <div className="bg-gray-900/70 rounded-lg p-4 text-center">
            <h3 className="text-gray-400">Expenses Logged</h3>
            <p className="text-2xl font-bold text-emerald-300">{expenses.length}</p>
          </div>

          <div className="bg-gray-900/70 rounded-lg p-4 text-center">
            <h3 className="text-gray-400">Remaining Budget</h3>
            <p className="text-2xl font-bold text-yellow-400">
              $
              {Math.max(
                0,
                budgets.reduce((sum, b) => sum + (b.limit || 0), 0) -
                  expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
              ).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

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
