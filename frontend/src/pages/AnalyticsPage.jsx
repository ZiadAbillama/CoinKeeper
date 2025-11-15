// src/pages/AnalyticsPage.jsx
import React, { useEffect, useState } from "react";
import API from "../api";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AnalyticsPage() {
  const [trends, setTrends] = useState([]);
  const [categories, setCategories] = useState([]);
  const [comparison, setComparison] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [trendsRes, categoriesRes, comparisonRes] = await Promise.all([
          API.get("/analytics/trends"),
          API.get("/analytics/categories"),
          API.get("/analytics/budget-comparison"),
        ]);

        setTrends(trendsRes.data.data || []);
        setCategories(categoriesRes.data.data || []);
        setComparison(comparisonRes.data.data || []);
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="text-center text-gray-400 py-10">
        Loading analytics…
      </div>
    );
  }

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-emerald-400 mb-1">
          Analytics Dashboard
        </h1>
        <p className="text-gray-400">
          Visualize your spending patterns and trends 📊
        </p>
      </div>

      {/* Spending Trends */}
      <div className="bg-gray-800/60 rounded-lg p-6 shadow">
        <h2 className="text-2xl font-semibold text-emerald-300 mb-4">
          Spending Trends (Last 12 Weeks)
        </h2>
        {trends.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="week" 
                stroke="#9ca3af" 
                angle={-45} 
                textAnchor="end" 
                height={80}
              />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#10b981"
                strokeWidth={3}
                name="Total Spent ($)"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400">No data available for the last 12 weeks.</p>
        )}
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-gray-800/60 rounded-lg p-6 shadow">
          <h2 className="text-2xl font-semibold text-emerald-300 mb-4">
            Spending by Category
          </h2>
          {categories.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.category}: $${entry.amount.toFixed(2)}`}
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400">No expenses this month.</p>
          )}
        </div>

        {/* Budget vs Actual */}
        <div className="bg-gray-800/60 rounded-lg p-6 shadow">
          <h2 className="text-2xl font-semibold text-emerald-300 mb-4">
            Budget vs Actual
          </h2>
          {comparison.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="category" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Bar dataKey="budget" fill="#10b981" name="Budget ($)" />
                <Bar dataKey="actual" fill="#ef4444" name="Actual ($)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400">No budgets set yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}