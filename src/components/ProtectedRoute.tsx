// src/components/ProtectedRoute/index.tsx
import React, { useEffect, useCallback, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import useCheckTokenExpiry from "@/hooks/useCheckTokenExpiry";
import MainLayout from "@/layouts/MainLayout/MainLayout";
import AuthService from "@/services/AuthService/AuthService";
import { logout } from "@/store/features/auth/authSlice";
import { selectIsAuthenticated, selectUser } from "@/store/features/auth/selectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const isTokenExpired = useCheckTokenExpiry();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { token } = useAppSelector(selectUser);
  const [isLoading, setIsLoading] = useState(true);

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
    const checkAuth = async () => {
      try {
        await performLogout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [performLogout]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="h6" color="text.secondary">
          Verifying authentication...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated || isTokenExpired) {
    // Save the attempted URL for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <MainLayout>{children}</MainLayout>;
};

export default React.memo(ProtectedRoute);
