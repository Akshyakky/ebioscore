import React, { ReactNode, useMemo } from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider as ReduxProvider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store/store";
import { LoadingProvider } from "./context/LoadingContext";
import GlobalSpinner from "./components/GlobalSpinner/GlobalSpinner";
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider } from "./context/Common/ThemeContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import routeConfig from "./routes/routeConfig";
import ErrorBoundary from "./components/ErrorBoundary";
import RouteErrorBoundary from "./components/RouteErrorBoundary";
import { Box, Button, Typography, Container } from '@mui/material';
import { Refresh } from '@mui/icons-material';

interface RouteConfig {
  path: string;
  component: React.ComponentType<any>;
  protected: boolean;
  providers?: React.ComponentType<any>[];
}

const App: React.FC = () => {
  const handleAppError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log application-level errors
    console.error('Critical Application Error:', error);
    console.error('Error Info:', errorInfo);

    // You could implement your error logging service here
    // Example: logCriticalError({ error, errorInfo, level: 'CRITICAL' });
  };

  const renderRoutes = useMemo(() => {
    return (routes: RouteConfig[]) => routes.map(({
      path,
      component: Component,
      protected: isProtected,
      providers,
    }: RouteConfig) => (
      <Route
        key={path}
        path={path}
        element={
          <RouteErrorBoundary routePath={path}>
            {isProtected ? (
              <ProtectedRoute>
                {providers ? (
                  providers.reduceRight<ReactNode>(
                    (children, Provider) => (
                      <Provider>{children}</Provider>
                    ),
                    <Component />
                  )
                ) : (
                  <Component />
                )}
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
    <ErrorBoundary
      onError={handleAppError}
      fallback={
        <Container maxWidth="sm" sx={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
          <Box sx={{ textAlign: 'center', width: '100%' }}>
            <Typography variant="h4" gutterBottom color="error">
              Application Error
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              The application encountered a critical error and needs to be reloaded.
            </Typography>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={() => window.location.reload()}
              size="large"
            >
              Reload Application
            </Button>
          </Box>
        </Container>
      }
    >
      <ThemeProvider>
        <ReduxProvider store={store}>
          <PersistGate loading={null} persistor={persistor}>
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
                <Routes>
                  {memoizedRoutes}
                  <Route path="/" element={<Navigate replace to="/login" />} />
                </Routes>
              </Router>
            </LoadingProvider>
          </PersistGate>
        </ReduxProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;