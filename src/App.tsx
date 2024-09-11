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
import { ThemeProvider } from "@mui/material/styles";
import theme from "./layouts/Themes/Theme";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import routeConfig from "./routes/routeConfig";

interface RouteConfig {
  path: string;
  component: React.ComponentType<any>;
  protected: boolean;
  providers?: React.ComponentType<any>[];
}

const App: React.FC = () => {
  const renderRoutes = useMemo(() => {
    return (routes: RouteConfig[]) => routes.map(
      ({
        path,
        component: Component,
        protected: isProtected,
        providers,
      }: RouteConfig) => (
        <Route
          key={path}
          path={path}
          element={
            isProtected ? (
              <ProtectedRoute>
                {providers ? (
                  providers.reduceRight<ReactNode>(
                    (children, Provider) => <Provider>{children}</Provider>,
                    <Component />
                  )
                ) : (
                  <Component />
                )}
              </ProtectedRoute>
            ) : (
              <Component />
            )
          }
        />
      )
    );
  }, []);

  const memoizedRoutes = useMemo(() => renderRoutes(routeConfig), [renderRoutes]);

  return (
    <ThemeProvider theme={theme}>
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
  );
};

export default App;