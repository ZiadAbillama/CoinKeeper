// src/components/BudgetAlerts.jsx
import React, { useEffect, useState } from "react";
import API from "../api";

export default function BudgetAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const month = new Date().toISOString().slice(0, 7); // "YYYY-MM"
      const res = await API.get(`/budgets/status/${month}`);
      const data = res.data?.data || [];
      const overBudget = data.filter((b) => b.spent > b.limit);
      setAlerts(overBudget.map((b) => b.category));
    } catch (err) {
      console.error("Error fetching budget alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  if (loading) {
    return (
      <div className="bg-white/70 p-4 rounded-lg shadow text-gray-600">
        Checking for budget alerts…
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-green-50 border border-green-300 text-green-700 p-4 rounded-lg">
        🎉 All budgets are on track!
      </div>
    );
  }

  return (
    <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded-lg">
      <h3 className="font-semibold mb-2">⚠️ Over Budget Alerts</h3>
      <ul className="list-disc pl-5 space-y-1">
        {alerts.map((cat, i) => (
          <li key={i}>
            You’ve exceeded your budget for <strong>{cat}</strong>.
          </li>
        ))}
      </ul>
    </div>
  );
}
