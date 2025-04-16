import React, { ReactNode, useMemo } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Provider as ReduxProvider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { LoadingProvider } from "./context/LoadingContext";
import { ThemeProvider } from "./context/Common/ThemeContext";
import { ToastContainer } from "react-toastify";
import { Box, Button, Typography, Container, CircularProgress } from "@mui/material";
import { Refresh } from "@mui/icons-material";
import "react-toastify/dist/ReactToastify.css";
import RouteErrorBoundary from "./components/RouteErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import routeConfig from "./routes/routeConfig";
import { persistor, store } from "./store";
import ErrorBoundary from "./components/ErrorBoundary";
import GlobalSpinner from "./components/GlobalSpinner/GlobalSpinner";
import { QueryProvider } from "./providers/QueryProvider";
import RouteNotFoundBoundary from "./components/RouteNotFoundBoundary";

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

const ErrorFallback = () => (
  <Container maxWidth="sm" sx={{ height: "100vh", display: "flex", alignItems: "center" }}>
    <Box sx={{ textAlign: "center", width: "100%" }}>
      <Typography variant="h4" gutterBottom color="error">
        Application Error
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        The application encountered a critical error and needs to be reloaded.
      </Typography>
      <Button variant="contained" startIcon={<Refresh />} onClick={() => window.location.reload()} size="large">
        Reload Application
      </Button>
    </Box>
  </Container>
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
            <RouteErrorBoundary routePath={path}>
              {isProtected ? (
                <ProtectedRoute>
                  {providers ? providers.reduceRight<ReactNode>((children, Provider) => <Provider>{children}</Provider>, <Component />) : <Component />}
                </ProtectedRoute>
              ) : (
                <Component />
              )}
            </RouteErrorBoundary>
          }
        />
      ));
  }, []);

  const memoizedRoutes = useMemo(() => renderRoutes(routeConfig), [renderRoutes]);

  return (
    <ReduxProvider store={store}>
      <PersistGate loading={<PersistLoadingFallback />} persistor={persistor}>
        <ErrorBoundary onError={handleAppError} fallback={<ErrorFallback />}>
          <QueryProvider>
            <ThemeProvider>
              <LoadingProvider>
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
              </LoadingProvider>
            </ThemeProvider>
          </QueryProvider>
        </ErrorBoundary>
      </PersistGate>
    </ReduxProvider>
  );
};

export default App;
