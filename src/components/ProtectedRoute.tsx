import useCheckTokenExpiry from "@/hooks/useCheckTokenExpiry";
import AuthService from "@/services/AuthService/AuthService";
import { logout } from "@/store/features/auth/authSlice";
import { selectIsAuthenticated, selectUser } from "@/store/features/auth/selectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import React, { useCallback, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const isTokenExpired = useCheckTokenExpiry();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { token } = useAppSelector(selectUser);

  const performLogout = useCallback(async () => {
    if (isTokenExpired && token) {
      try {
        await AuthService.logout(token);
      } catch (error) {
        console.error("Error during logout:", error);
      } finally {
        dispatch(logout());
      }
    }
  }, [isTokenExpired, token, dispatch]);

  useEffect(() => {
    performLogout();
  }, [performLogout]);

  if (!isAuthenticated || isTokenExpired) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Just render children without wrapping in MainLayout
  // MainLayout is now handled at the route level
  return <>{children}</>;
};

export default ProtectedRoute;
