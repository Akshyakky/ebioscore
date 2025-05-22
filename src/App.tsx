import React, { ReactNode, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Provider as ReduxProvider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ToastContainer } from "react-toastify";
import { Box, CircularProgress } from "@mui/material";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import routeConfig from "./routes/routeConfig";
import { persistor, store } from "./store";
import GlobalSpinner from "./components/GlobalSpinner/GlobalSpinner";
import { QueryProvider } from "./providers/QueryProvider";
import RouteNotFoundBoundary from "./components/RouteNotFoundBoundary";
import ThemeProvider from "./providers/ThemeProvider";

// Types
interface RouteConfig {
  path: string;
  component: React.ComponentType<any>;
  protected: boolean;
  providers?: React.ComponentType<any>[];
}

// Components
const PersistLoadingFallback = () => (
  <Box
    sx={{
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <CircularProgress size={60} thickness={4} />
  </Box>
);

const App: React.FC = () => {
  const handleAppError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error("Critical Application Error:", error);
    console.error("Error Info:", errorInfo);
  };

  const renderRoutes = useMemo(() => {
    return (routes: RouteConfig[]) =>
      routes.map(({ path, component: Component, protected: isProtected, providers }: RouteConfig) => (
        <Route
          key={path}
          path={path}
          element={
            <ErrorBoundary routePath={path} showBackButton>
              {isProtected ? (
                <ProtectedRoute>
                  {providers ? providers.reduceRight<ReactNode>((children, Provider) => <Provider>{children}</Provider>, <Component />) : <Component />}
                </ProtectedRoute>
              ) : (
                <Component />
              )}
            </ErrorBoundary>
          }
        />
      ));
  }, []);

  const memoizedRoutes = useMemo(() => renderRoutes(routeConfig), [renderRoutes]);

  return (
    <ReduxProvider store={store}>
      <PersistGate loading={<PersistLoadingFallback />} persistor={persistor}>
        <ErrorBoundary onError={handleAppError}>
          <QueryProvider>
            <ThemeProvider>
              <Router>
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
                    {memoizedRoutes}
                    <Route path="/" element={<Navigate replace to="/login" />} />
                  </Routes>
                </RouteNotFoundBoundary>
              </Router>
            </ThemeProvider>
          </QueryProvider>
        </ErrorBoundary>
      </PersistGate>
    </ReduxProvider>
  );
};

export default App;
