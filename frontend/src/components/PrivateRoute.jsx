import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { user, token, loading } = useAuth();

  if (loading) return null; // Wait for auth to load
  if (!user || !token) return <Navigate to="/login" replace />;

  return children;
}
