import React, { useEffect, useState } from "react";

const empty = {
  title: "",
  amount: "",
  category: "",
  description: "",
  date: "",
};

export default function ExpenseForm({ onSubmit, editing, onCancel }) {
  const [form, setForm] = useState(empty);

  // Prefill when editing
  useEffect(() => {
    if (editing) {
      const iso = editing.date ? new Date(editing.date) : new Date();
      const local = new Date(iso.getTime() - iso.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setForm({
        title: editing.title || "",
        amount: editing.amount || "",
        category: editing.category || "",
        description: editing.description || "",
        date: local,
      });
    } else {
      setForm(empty);
    }
  }, [editing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      amount: Number(form.amount),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white/70 backdrop-blur-lg shadow-lg rounded-xl p-6 border border-white/40"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            className="mt-1 w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Lunch"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Amount ($)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="mt-1 w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="25"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
          >
            <option value="">Select category…</option>
            <option>Food</option>
            <option>Transport</option>
            <option>Shopping</option>
            <option>Bills</option>
            <option>Entertainment</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date & Time</label>
          <input
            type="datetime-local"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          rows={3}
          name="description"
          value={form.description}
          onChange={handleChange}
          className="mt-1 w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
          placeholder="Optional notes…"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
        >
          {editing ? "💾 Update Expense" : "➕ Add Expense"}
        </button>
        {editing && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
