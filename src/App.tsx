import { Box, CircularProgress } from "@mui/material";
import React, { ReactNode, useMemo } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { PersistGate } from "redux-persist/integration/react";
import ErrorBoundary from "./components/ErrorBoundary";
import GlobalSpinner from "./components/GlobalSpinner/GlobalSpinner";
import ProtectedRoute from "./components/ProtectedRoute";
import RouteNotFoundBoundary from "./components/RouteNotFoundBoundary";
import MainLayout from "./layouts/MainLayout/MainLayout";
import { QueryProvider } from "./providers/QueryProvider";
import ThemeProvider from "./providers/ThemeProvider";
import routeConfig from "./routes/routeConfig";
import { persistor, store } from "./store";

// Types
interface RouteConfig {
  path: string;
  component: React.ComponentType<any>;
  protected: boolean;
  providers?: React.ComponentType<any>[];
}

const PersistLoadingFallback = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
    <CircularProgress />
  </Box>
);

// Layout wrapper for protected routes
const ProtectedLayout: React.FC = () => {
  return (
    <ProtectedRoute>
      <MainLayout>
        <Outlet />
      </MainLayout>
    </ProtectedRoute>
  );
};

// Public layout wrapper (for login, etc.)
const PublicLayout: React.FC = () => {
  return <Outlet />;
};

const App: React.FC = () => {
  const handleAppError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error("Critical Application Error:", error);
    console.error("Error Info:", errorInfo);
  };

  // Separate protected and public routes
  const { protectedRoutes, publicRoutes } = useMemo(() => {
    const protectedRoutesArray: RouteConfig[] = [];
    const publicRoutesArray: RouteConfig[] = [];

    routeConfig.forEach((route) => {
      if (route.protected) {
        protectedRoutesArray.push(route);
      } else {
        publicRoutesArray.push(route);
      }
    });

    return { protectedRoutes: protectedRoutesArray, publicRoutes: publicRoutesArray };
  }, []);

  const renderRoutes = useMemo(() => {
    return (routes: RouteConfig[]) =>
      routes.map(({ path, component: Component, providers }: RouteConfig) => (
        <Route
          key={path}
          path={path}
          element={
            <ErrorBoundary routePath={path} showBackButton>
              {providers ? providers.reduceRight<ReactNode>((children, Provider) => <Provider>{children}</Provider>, <Component />) : <Component />}
            </ErrorBoundary>
          }
        />
      ));
  }, []);

  const memoizedProtectedRoutes = useMemo(() => renderRoutes(protectedRoutes), [renderRoutes, protectedRoutes]);
  const memoizedPublicRoutes = useMemo(() => renderRoutes(publicRoutes), [renderRoutes, publicRoutes]);

  return (
    <ReduxProvider store={store}>
      <PersistGate loading={<PersistLoadingFallback />} persistor={persistor}>
        <ErrorBoundary onError={handleAppError}>
          <QueryProvider>
            <ThemeProvider>
              <BrowserRouter>
                <GlobalSpinner delay={500} color="secondary" size={50} />
                <ToastContainer
                  position="top-right"
                  autoClose={1500}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                />
                <RouteNotFoundBoundary>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<PublicLayout />}>
                      {memoizedPublicRoutes}
                    </Route>

                    {/* Protected routes wrapped in persistent layout */}
                    <Route path="/" element={<ProtectedLayout />}>
                      {memoizedProtectedRoutes}
                    </Route>

                    {/* Root redirect */}
                    <Route index element={<Navigate replace to="/login" />} />
                  </Routes>
                </RouteNotFoundBoundary>
              </BrowserRouter>
            </ThemeProvider>
          </QueryProvider>
        </ErrorBoundary>
      </PersistGate>
    </ReduxProvider>
  );
};

export default App;
