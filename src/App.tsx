//App.tsx
import React from "react";
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
import theme from "../src/layouts/SideBar/Theme";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import routeConfig from "./routes/routeConfig";

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <ReduxProvider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <LoadingProvider>
            <Router>
              <GlobalSpinner />
              {/* ToastContainer added here */}
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
                {routeConfig.map(
                  ({
                    path,
                    component: Component,
                    protected: isProtected,
                    provider: Provider,
                    providers,
                  }) => (
                    <Route
                      key={path}
                      path={path}
                      element={
                        isProtected ? (
                          <ProtectedRoute>
                            {providers ? (
                              providers.reduceRight(
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
                        )
                      }
                    />
                  )
                )}
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
