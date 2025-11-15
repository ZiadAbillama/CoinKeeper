// src/components/Navbar.jsx
import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-gray-900/95 backdrop-blur-sm border-b border-emerald-700/30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-extrabold text-emerald-400 hover:text-emerald-300 transition"
        >
          CoinKeeper
        </Link>

        {/* Navigation Links */}
        <div className="flex space-x-6 text-sm font-medium">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `transition border-b-2 ${
                isActive
                  ? "border-emerald-500 text-emerald-300"
                  : "border-transparent text-gray-300 hover:text-emerald-400"
              } pb-1`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/expenses"
            className={({ isActive }) =>
              `transition border-b-2 ${
                isActive
                  ? "border-emerald-500 text-emerald-300"
                  : "border-transparent text-gray-300 hover:text-emerald-400"
              } pb-1`
            }
          >
            Expenses
          </NavLink>

          <NavLink
            to="/budgets"
            className={({ isActive }) =>
              `transition border-b-2 ${
                isActive
                  ? "border-emerald-500 text-emerald-300"
                  : "border-transparent text-gray-300 hover:text-emerald-400"
              } pb-1`
            }
          >
            Budgets
          </NavLink>
          <NavLink
  to="/analytics"
  className={({ isActive }) =>
    `transition border-b-2 ${
      isActive
        ? "border-emerald-500 text-emerald-300"
        : "border-transparent text-gray-300 hover:text-emerald-400"
    } pb-1`
  }
>
  Analytics
</NavLink>

<NavLink
  to="/reports"
  className={({ isActive }) =>
    `transition border-b-2 ${
      isActive
        ? "border-emerald-500 text-emerald-300"
        : "border-transparent text-gray-300 hover:text-emerald-400"
    } pb-1`
  }
>
  Reports
</NavLink>

<NavLink
  to="/calendar"
  className={({ isActive }) =>
    `transition border-b-2 ${
      isActive
        ? "border-emerald-500 text-emerald-300"
        : "border-transparent text-gray-300 hover:text-emerald-400"
    } pb-1`
  }
>
  Calendar
</NavLink>
        </div>

        {/* User Info + Logout */}
        <div className="flex items-center space-x-4 text-sm">
          {user ? (
            <>
              <span className="text-gray-300">
                Hi,{" "}
                <span className="font-semibold text-emerald-400">
                  {user.name || "User"}
                </span>
              </span>
              <button
                onClick={handleLogout}
                className="text-red-400 hover:text-red-500 font-medium transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-emerald-400 hover:text-emerald-300 font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-gray-300 hover:text-emerald-300 font-medium"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
