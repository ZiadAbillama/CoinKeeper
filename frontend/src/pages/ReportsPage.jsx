// src/pages/ReportsPage.jsx
import React, { useEffect, useState } from "react";
import API from "../api";

export default function ReportsPage() {
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set default to current month
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);
    setSelectedMonth(currentMonth);

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [expensesRes, budgetsRes] = await Promise.all([
        API.get("/expenses"),
        API.get("/budgets"),
      ]);

      setExpenses(expensesRes.data.data || []);
      setBudgets(budgetsRes.data.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter expenses by selected month
  // Filter expenses by selected month and sort by date (newest first)
const filteredExpenses = expenses
  .filter((expense) => {
    const expenseMonth = new Date(expense.date).toISOString().slice(0, 7);
    return expenseMonth === selectedMonth;
  })
  .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date descending

  // Calculate totals
  const totalSpent = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);

  // Group by category
  const spentByCategory = {};
  filteredExpenses.forEach((expense) => {
    const cat = expense.category;
    spentByCategory[cat] = (spentByCategory[cat] || 0) + expense.amount;
  });

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["Date", "Title", "Category", "Amount"];
    const rows = filteredExpenses.map((e) => [
      new Date(e.date).toLocaleDateString(),
      e.title,
      e.category,
      e.amount.toFixed(2),
    ]);

    let csvContent = headers.join(",") + "\n";
    rows.forEach((row) => {
      csvContent += row.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `expenses-${selectedMonth}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="text-center text-gray-400 py-10">
        Loading reports…
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-emerald-400 mb-1">
            Monthly Reports
          </h1>
          <p className="text-gray-400">
            View and export your spending reports 📄
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition"
        >
          Export to CSV
        </button>
      </div>

      {/* Month Selector */}
      <div className="bg-gray-800/60 rounded-lg p-6 shadow">
        <label className="block text-sm text-gray-300 mb-2">Select Month</label>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="bg-gray-900/70 text-gray-100 border border-gray-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Summary */}
      <div className="bg-gray-800/60 rounded-lg p-6 shadow">
        <h2 className="text-2xl font-semibold text-emerald-300 mb-4">
          Summary for {new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900/70 rounded-lg p-4 text-center">
            <h3 className="text-gray-400 text-sm">Total Spent</h3>
            <p className="text-2xl font-bold text-red-400">
              ${totalSpent.toFixed(2)}
            </p>
          </div>
          <div className="bg-gray-900/70 rounded-lg p-4 text-center">
            <h3 className="text-gray-400 text-sm">Total Budget</h3>
            <p className="text-2xl font-bold text-emerald-300">
              ${totalBudget.toFixed(2)}
            </p>
          </div>
          <div className="bg-gray-900/70 rounded-lg p-4 text-center">
            <h3 className="text-gray-400 text-sm">Difference</h3>
            <p className={`text-2xl font-bold ${totalBudget - totalSpent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${Math.abs(totalBudget - totalSpent).toFixed(2)}
              {totalBudget - totalSpent < 0 && ' over'}
            </p>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-gray-800/60 rounded-lg p-6 shadow">
        <h2 className="text-2xl font-semibold text-emerald-300 mb-4">
          Spending by Category
        </h2>
        {Object.keys(spentByCategory).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(spentByCategory).map(([category, amount]) => {
              const budget = budgets.find((b) => b.category === category);
              const budgetLimit = budget ? budget.limit : 0;
              const percent = budgetLimit > 0 ? (amount / budgetLimit) * 100 : 0;

              return (
                <div key={category} className="bg-gray-900/70 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-emerald-300">{category}</h3>
                    <span className="text-gray-400">
                      ${amount.toFixed(2)} / ${budgetLimit.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        percent >= 100 ? 'bg-red-500' :
                        percent >= 80 ? 'bg-orange-500' :
                        'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400">No expenses for this month.</p>
        )}
      </div>

      {/* Expense List */}
      <div className="bg-gray-800/60 rounded-lg p-6 shadow">
        <h2 className="text-2xl font-semibold text-emerald-300 mb-4">
          All Expenses ({filteredExpenses.length})
        </h2>
        {filteredExpenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-gray-700">
                <tr>
                  <th className="pb-3 text-gray-400">Date</th>
                  <th className="pb-3 text-gray-400">Title</th>
                  <th className="pb-3 text-gray-400">Category</th>
                  <th className="pb-3 text-gray-400 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense._id} className="border-b border-gray-700/30">
                    <td className="py-3 text-gray-300">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-gray-100">{expense.title}</td>
                    <td className="py-3 text-gray-400">{expense.category}</td>
                    <td className="py-3 text-red-400 text-right font-semibold">
                      ${expense.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400">No expenses for this month.</p>
        )}
      </div>
    </div>
  );
}