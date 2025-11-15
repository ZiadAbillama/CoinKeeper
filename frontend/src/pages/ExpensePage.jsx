// src/pages/ExpensePage.jsx
import React, { useEffect, useState } from "react";
import API from "../api";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseCard from "../components/ExpenseCard";
import ConfirmModal from "../components/ConfirmModal";

export default function ExpensePage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const fetchExpenses = async () => {
    try {
      const res = await API.get("/expenses");
      setExpenses(res.data.data || []);
    } catch (err) {
      console.error("Error fetching expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const addExpense = async (expense) => {
    try {
      await API.post("/expenses", expense);
      fetchExpenses();
    } catch (err) {
      console.error("Error adding expense:", err);
    }
  };

  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await API.delete(`/expenses/${selectedId}`);
      setExpenses((prev) => prev.filter((e) => e._id !== selectedId));
    } catch (err) {
      console.error("Error deleting expense:", err);
    } finally {
      setShowConfirm(false);
      setSelectedId(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center text-gray-400 py-10">
        Loading expenses…
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-emerald-400 mb-1">
          Expenses Tracker
        </h1>
        <p className="text-gray-400">
          Track your spending and stay on budget 🧾
        </p>
      </div>

      {/* Responsive Grid: Form & List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-1 bg-gray-800/60 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Add a New Expense</h2>
          <ExpenseForm onAdd={addExpense} />
        </div>

        {/* Right Column - List */}
        <div className="lg:col-span-2 bg-gray-800/60 p-6 rounded-lg shadow flex flex-col">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>

          {expenses.length === 0 ? (
            <div className="text-gray-400 bg-gray-900/40 rounded-lg p-4 text-center">
              No expenses yet. Add your first one above 🎉
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              {expenses.filter(Boolean).map((expense) => (
                <ExpenseCard
                  key={expense._id}
                  expense={expense}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        show={showConfirm}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
