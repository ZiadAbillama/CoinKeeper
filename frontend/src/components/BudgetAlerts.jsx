// src/components/BudgetAlerts.jsx
import React, { useEffect, useState } from "react";
import API from "../api";

export default function BudgetAlerts() {
  const [alertData, setAlertData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const res = await API.get("/budgets/alerts");
      setAlertData(res.data?.data || null);
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
        Checking budget status…
      </div>
    );
  }

  // No budgets set
  if (!alertData || !alertData.hasBudgets) {
    return (
      <div className="bg-yellow-50 border border-yellow-300 text-yellow-700 p-4 rounded-lg">
        💡 You haven't set any budgets yet. Go to the Budgets page to create some!
      </div>
    );
  }

  const { categories } = alertData;
  
  // Separate into categories
  const overBudget = categories.filter(c => c.isOverBudget);
  const nearLimit = categories.filter(c => c.isNearLimit);
  const onTrack = categories.filter(c => c.isOnTrack);

  // Show worst case first
  if (overBudget.length > 0) {
    return (
      <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded-lg">
        <h3 className="font-semibold mb-3">⚠️ Budget Exceeded!</h3>
        <div className="space-y-2">
          {overBudget.map((cat, i) => (
            <div key={i} className="text-sm">
              <strong>{cat.category}:</strong> You've spent{" "}
              <strong>${cat.spent.toFixed(2)}</strong> out of your{" "}
              <strong>${cat.limit.toFixed(2)}</strong> budget ({cat.percentUsed}%).
              You're <strong>${Math.abs(cat.remaining).toFixed(2)}</strong> over!
            </div>
          ))}
        </div>
        {nearLimit.length > 0 && (
          <div className="mt-3 pt-3 border-t border-red-200">
            <p className="text-sm font-semibold mb-1">Also approaching limit:</p>
            {nearLimit.map((cat, i) => (
              <p key={i} className="text-sm">
                <strong>{cat.category}:</strong> {cat.percentUsed}% used (${cat.remaining.toFixed(2)} left)
              </p>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Near limit warning
  if (nearLimit.length > 0) {
    return (
      <div className="bg-orange-50 border border-orange-300 text-orange-700 p-4 rounded-lg">
        <h3 className="font-semibold mb-3">⚡ Approaching Budget Limits</h3>
        <div className="space-y-2">
          {nearLimit.map((cat, i) => (
            <div key={i} className="text-sm">
              <strong>{cat.category}:</strong> You've spent{" "}
              <strong>${cat.spent.toFixed(2)}</strong> out of{" "}
              <strong>${cat.limit.toFixed(2)}</strong> ({cat.percentUsed}%).
              Only <strong>${cat.remaining.toFixed(2)}</strong> remaining!
            </div>
          ))}
        </div>
      </div>
    );
  }

  // All on track
  return (
    <div className="bg-green-50 border border-green-300 text-green-700 p-4 rounded-lg">
      <h3 className="font-semibold mb-3">🎉 All Budgets On Track!</h3>
      <div className="space-y-1 text-sm">
        {onTrack.map((cat, i) => (
          <div key={i}>
            <strong>{cat.category}:</strong> ${cat.spent.toFixed(2)} / ${cat.limit.toFixed(2)} ({cat.percentUsed}%) - ${cat.remaining.toFixed(2)} left
          </div>
        ))}
      </div>
    </div>
  );
}