// src/components/ProtectedRoute.tsx

import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { RootState } from "../store/reducers"; // Adjust the import path as needed
interface ProtectedRouteProps {
  children: React.ReactNode; // Define the type for children
}
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = useSelector((state: RootState) => state.userDetails.token);
  if (!token) {
    // If there is no token, redirect to the login page
    return <Navigate to="/login" />;
  }

  return <>{children}</>; // Use React Fragment to wrap children
};

export default ProtectedRoute;
