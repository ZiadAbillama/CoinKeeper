// src/pages/BudgetPage.jsx
import React, { useEffect, useState } from "react";
import API from "../api";
import ConfirmModal from "../components/ConfirmModal";

export default function BudgetPage() {
  const [budgets, setBudgets] = useState([]);
  const [form, setForm] = useState({ category: "", limit: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // modal state
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Get current month in YYYY-MM format
  const month = new Date().toISOString().slice(0, 7);

  // Fetch all budgets
  const fetchBudgets = async () => {
    try {
      const res = await API.get("/budgets");
      setBudgets(res.data.data || []);
    } catch (err) {
      console.error("Error fetching budgets:", err);
      setError("Failed to load budgets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  // Handle input changes
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Add new budget
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category || !form.limit) return;

    try {
      await API.post("/budgets", {
        ...form,
        limit: Number(form.limit),
        month,
      });
      setForm({ category: "", limit: "" });
      fetchBudgets(); // ✅ refresh after adding
    } catch (err) {
      console.error("Error adding budget:", err);
      setError("Unable to add budget. It might already exist for this month.");
    }
  };

  // Handle delete click
  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setShowConfirm(true);
  };

  // Confirm deletion
  const confirmDelete = async () => {
    try {
      await API.delete(`/budgets/${selectedId}`);
      setBudgets((prev) => prev.filter((b) => b._id !== selectedId));
    } catch (err) {
      console.error("Error deleting budget:", err);
    } finally {
      setShowConfirm(false);
      setSelectedId(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center text-gray-400 py-10">
        Loading budgets…
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-emerald-400 mb-1">
          Budgets Overview
        </h1>
        <p className="text-gray-400">
          Manage your monthly spending limits by category ✨
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-500/20 border border-red-600 text-red-400 p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Add Budget Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800/60 p-6 rounded-lg shadow grid gap-4 md:grid-cols-3"
      >
        <div>
          <label className="block text-sm text-gray-300 mb-1">Category</label>
          <input
            type="text"
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="e.g. Food"
            className="w-full bg-gray-900/70 text-gray-100 border border-gray-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Limit ($)</label>
          <input
            type="number"
            name="limit"
            value={form.limit}
            onChange={handleChange}
            placeholder="e.g. 200"
            className="w-full bg-gray-900/70 text-gray-100 border border-gray-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 transition"
          >
            Add Budget
          </button>
        </div>
      </form>

      {/* Budgets List */}
      <div className="bg-gray-800/60 p-6 rounded-lg shadow space-y-3">
        <h2 className="text-2xl font-semibold text-emerald-300 mb-3">
          Active Budgets ({budgets.length})
        </h2>

        {budgets.length === 0 ? (
          <p className="text-gray-400">
            No budgets yet. Add your first one above 🎯
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {budgets.map((b) => (
              <div
                key={b._id}
                className="bg-gray-900/70 rounded-lg p-4 flex justify-between items-center border border-gray-700/40 hover:border-emerald-500/40 transition"
              >
                <div>
                  <h3 className="font-semibold text-emerald-300">
                    {b.category}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Limit: ${b.limit.toFixed(2)} • Month: {b.month}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteClick(b._id)}
                  className="text-sm text-red-400 hover:text-red-500 transition"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        show={showConfirm}
        title="Delete Budget"
        message="Are you sure you want to delete this budget? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
