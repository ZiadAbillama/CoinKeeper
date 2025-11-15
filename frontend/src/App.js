// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";

import DashboardPage from "./pages/DashboardPage";
import ExpensePage from "./pages/ExpensePage";
import BudgetPage from "./pages/BudgetPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ReportsPage from "./pages/ReportsPage";
import CalendarPage from "./pages/CalendarPage";
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-emerald-950 to-gray-900 text-gray-100">
          {/* Navbar stays fixed at top */}
          <Navbar />
          
          {/* ✅ Added top padding to prevent overlap */}
          <main className="container mx-auto px-4 py-8 pt-24">
            <Routes>
              {/* Dashboard */}
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <DashboardPage />
                  </PrivateRoute>
                }
              />

              {/* Expenses */}
              <Route
                path="/expenses"
                element={
                  <PrivateRoute>
                    <ExpensePage />
                  </PrivateRoute>
                }
              />

              {/* Budgets */}
              <Route
                path="/budgets"
                element={
                  <PrivateRoute>
                    <BudgetPage />
                  </PrivateRoute>
                }
              />

              {/* Auth Pages */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            <Route
  path="/analytics"
  element={
    <PrivateRoute>
      <AnalyticsPage />
    </PrivateRoute>
  }
/>
<Route
  path="/reports"
  element={
    <PrivateRoute>
      <ReportsPage />
    </PrivateRoute>
  }
/>
<Route
  path="/calendar"
  element={
    <PrivateRoute>
      <CalendarPage />
    </PrivateRoute>
  }
/>   
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
