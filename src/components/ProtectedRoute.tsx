import React, { useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import { RootState } from "../store/reducers";
import useCheckTokenExpiry from "../hooks/useCheckTokenExpiry";
import { logout } from "../store/actionCreators";
import AuthService from "../services/AuthService/AuthService";
import MainLayout from "../layouts/MainLayout/MainLayout";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isTokenExpired = useCheckTokenExpiry();
  const token = useSelector((state: RootState) => state.userDetails.token);
  const dispatch = useDispatch();

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

  if (!token || isTokenExpired) {
    return <Navigate to="/login" />;
  }

  return <MainLayout>{children}</MainLayout>;
};

export default ProtectedRoute;