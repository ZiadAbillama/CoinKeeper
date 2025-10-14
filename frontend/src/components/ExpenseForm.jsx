// src/components/ExpenseForm.jsx
import React, { useState } from "react";

export default function ExpenseForm({ onAdd }) {
  const [form, setForm] = useState({
    title: "",
    category: "",
    amount: "",
    date: "",
  });

  const [error, setError] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Basic validation
    if (!form.title || !form.category || !form.amount || !form.date) {
      setError("Please fill in all fields before adding an expense.");
      return;
    }

    if (Number(form.amount) <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }

    try {
      setError("");
      await onAdd({
        title: form.title.trim(),
        category: form.category.trim(),
        amount: Number(form.amount),
        date: form.date,
      });

      // ✅ Reset form on success
      setForm({ title: "", category: "", amount: "", date: "" });
    } catch (err) {
      console.error("Error adding expense:", err);
      setError("Failed to add expense. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 sm:grid-cols-2 md:grid-cols-4"
    >
      {/* Error Message */}
      {error && (
        <div className="sm:col-span-2 md:col-span-4 bg-red-500/20 border border-red-600 text-red-400 p-2 rounded text-sm">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm text-gray-300 mb-1">Title</label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g. Coffee"
          className="w-full bg-gray-900/70 text-gray-100 border border-gray-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Category */}
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

      {/* Amount */}
      <div>
        <label className="block text-sm text-gray-300 mb-1">Amount ($)</label>
        <input
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          placeholder="e.g. 10"
          className="w-full bg-gray-900/70 text-gray-100 border border-gray-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm text-gray-300 mb-1">Date</label>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="w-full bg-gray-900/70 text-gray-100 border border-gray-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Submit Button */}
      <div className="sm:col-span-2 md:col-span-4 flex justify-end mt-2">
        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-2 rounded-lg transition"
        >
          Add Expense
        </button>
      </div>
    </form>
  );
}
