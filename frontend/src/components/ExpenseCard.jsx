import React from "react";

export default function ExpenseCard({ exp, onEdit, onDelete }) {
  const date = exp.date ? new Date(exp.date) : null;
  const formatted = date ? date.toLocaleString() : "—";

  const badgeColor =
    exp.category === "Food"
      ? "bg-rose-100 text-rose-700"
      : exp.category === "Transport"
      ? "bg-indigo-100 text-indigo-700"
      : exp.category === "Bills"
      ? "bg-amber-100 text-amber-700"
      : exp.category === "Shopping"
      ? "bg-purple-100 text-purple-700"
      : "bg-slate-100 text-slate-700";

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white/70 backdrop-blur rounded-xl border border-white/40 shadow-sm p-4">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{exp.title}</h3>
          {exp.category && (
            <span className={`text-xs px-2 py-1 rounded-full ${badgeColor}`}>
              {exp.category}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">{formatted}</p>
        {exp.description && (
          <p className="text-gray-700 mt-2">{exp.description}</p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-emerald-700 font-semibold text-xl">
          ${Number(exp.amount || 0).toFixed(2)}
        </span>
        <button
          onClick={() => onEdit(exp)}
          className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
          title="Edit"
        >
          ✏️
        </button>
        <button
          onClick={() => onDelete(exp._id)}
          className="px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
          title="Delete"
        >
          🗑
        </button>
      </div>
    </div>
  );
}
