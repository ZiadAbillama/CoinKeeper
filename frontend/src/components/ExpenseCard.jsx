// src/components/ExpenseCard.jsx
import React from "react";

export default function ExpenseCard({ expense, onDelete }) {
  // ✅ Defensive check
  if (!expense) return null;

  const { title, amount, category, date } = expense;

  // Format date safely
  const formattedDate = date
    ? new Date(date).toLocaleDateString()
    : "No date provided";

  return (
    <div className="bg-gray-900/70 p-4 rounded-lg flex justify-between items-center border border-gray-700/40 hover:border-emerald-500/40 transition">
      <div>
        <h3 className="font-semibold text-emerald-300">{title || "Untitled"}</h3>
        <p className="text-gray-400 text-sm">
          {category || "No category"} • {formattedDate}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-red-400 font-semibold">${amount?.toFixed(2) ?? "0.00"}</span>
        <button
          onClick={() => onDelete && onDelete(expense._id)}
          className="text-sm text-red-400 hover:text-red-500 transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
