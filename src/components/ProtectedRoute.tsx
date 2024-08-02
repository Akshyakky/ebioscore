// src/components/ProtectedRoute.tsx
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import { RootState } from "../store/reducers";
import useCheckTokenExpiry from "../hooks/useCheckTokenExpiry";
import { logout } from "../store/actionCreators";
import AuthService from "../services/AuthService/AuthService";

interface ProtectedRouteProps {
  children: React.ReactNode; // Explicitly type the children prop
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isTokenExpired = useCheckTokenExpiry();
  const token = useSelector((state: RootState) => state.userDetails.token);
  const dispatch = useDispatch();

  useEffect(() => {
    const performLogout = async () => {
      if (isTokenExpired && token) {
        try {
          await AuthService.logout(token);
        } catch (error) {
          console.error("Error during logout:", error);
        } finally {
          dispatch(logout());
        }
      }
    };

    performLogout();
  }, [isTokenExpired, token, dispatch]);

  if (!token || isTokenExpired) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
