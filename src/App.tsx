import React, { ReactNode, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Provider as ReduxProvider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ToastContainer } from "react-toastify";
import { Box, Button, Typography, Container, CircularProgress } from "@mui/material";
import { Refresh } from "@mui/icons-material";
import RouteErrorBoundary from "./components/RouteErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import routeConfig from "./routes/routeConfig";
import { persistor, store } from "./store";
import ErrorBoundary from "./components/ErrorBoundary";
import GlobalSpinner from "./components/GlobalSpinner/GlobalSpinner";
import { QueryProvider } from "./providers/QueryProvider";
import RouteNotFoundBoundary from "./components/RouteNotFoundBoundary";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import lightTheme from "./layouts/Themes/LightTheme";

// Types
interface RouteConfig {
  path: string;
  component: React.ComponentType<any>;
  protected: boolean;
  providers?: React.ComponentType<any>[];
}

// Loading fallback for PersistGate
const PersistLoadingFallback = () => (
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
      Loading Application...
    </Typography>
  </Box>
);

// Error fallback component
const ErrorFallback = () => (
  <Container maxWidth="md">
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        textAlign: "center",
        gap: 2,
      }}
    >
      <Typography variant="h4" color="error" gutterBottom>
        Something went wrong
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        We apologize for the inconvenience. Please try refreshing the page.
      </Typography>
      <Button variant="contained" startIcon={<Refresh />} onClick={() => window.location.reload()} sx={{ mt: 2 }}>
        Refresh Page
      </Button>
    </Box>
  </Container>
);

const App: React.FC = () => {
  const handleAppError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error("Critical Application Error:", error);
    console.error("Error Info:", errorInfo);
    // Add your error reporting service here
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
    <ErrorBoundary onError={handleAppError} fallback={<ErrorFallback />}>
      <ReduxProvider store={store}>
        <PersistGate loading={<PersistLoadingFallback />} persistor={persistor}>
          <ThemeProvider theme={lightTheme}>
            <CssBaseline />
            <QueryProvider>
              <Router>
                <GlobalSpinner delay={500} color="secondary" size={50} />
                <ToastContainer
                  position="top-right"
                  autoClose={3000}
                  hideProgressBar={false}
                  newestOnTop
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="colored"
                />
                <RouteNotFoundBoundary>
                  <Routes>
                    {memoizedRoutes}
                    <Route path="/" element={<Navigate replace to="/dashboard" />} />
                  </Routes>
                </RouteNotFoundBoundary>
              </Router>
            </QueryProvider>
          </ThemeProvider>
        </PersistGate>
      </ReduxProvider>
    </ErrorBoundary>
  );
};

export default App;
