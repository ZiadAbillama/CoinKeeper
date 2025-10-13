import React, { useEffect, useState } from "react";
import API from "./api";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseCard from "./components/ExpenseCard";

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [editing, setEditing] = useState(null);
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(false);

  const showBanner = (msg, type = "success") => {
    setBanner({ msg, type });
    setTimeout(() => setBanner(null), 2200);
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await API.get("/expenses");
      const list = (res.data?.data || []).sort(
        (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
      );
      setExpenses(list);
    } catch (e) {
      console.error(e);
      showBanner("Failed to load expenses", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (data) => {
    try {
      if (editing) {
        await API.put(`/expenses/${editing._id}`, data);
        showBanner("Expense updated");
      } else {
        await API.post("/expenses", data);
        showBanner("Expense added");
      }
      setEditing(null);
      fetchExpenses();
    } catch (e) {
      console.error(e);
      showBanner("Something went wrong", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await API.delete(`/expenses/${id}`);
      showBanner("Expense deleted");
      fetchExpenses();
    } catch (e) {
      console.error(e);
      showBanner("Delete failed", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-slate-100">
      <header className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b border-white/40">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-emerald-700">
            💰 CoinKeeper
          </h1>
          <span className="text-sm text-gray-500">
            {expenses.length} item{expenses.length !== 1 ? "s" : ""}
          </span>
        </div>
      </header>

      {banner && (
        <div
          className={`fixed left-1/2 -translate-x-1/2 top-4 px-4 py-2 rounded-lg shadow ${
            banner.type === "error" ? "bg-red-500 text-white" : "bg-emerald-600 text-white"
          }`}
        >
          {banner.msg}
        </div>
      )}

      <main className="max-w-5xl mx-auto px-5 py-8 space-y-8">
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            {editing ? "Edit expense" : "Add a new expense"}
          </h2>
          <ExpenseForm
            editing={editing}
            onSubmit={handleSubmit}
            onCancel={() => setEditing(null)}
          />
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Recent activity</h2>
            {loading && <span className="text-sm text-gray-500">Loading…</span>}
          </div>

          {expenses.length === 0 ? (
            <div className="text-gray-500 bg-white/60 backdrop-blur rounded-xl border border-white/40 p-6">
              No expenses yet. Add your first one above! 🎉
            </div>
          ) : (
            <div className="grid gap-4">
              {expenses.map((exp) => (
                <ExpenseCard
                  key={exp._id}
                  exp={exp}
                  onEdit={setEditing}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="py-8 text-center text-sm text-gray-500">
        Built for students — track smarter, save more ✨
      </footer>
    </div>
  );
}
