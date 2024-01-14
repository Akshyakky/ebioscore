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
import LoginPage from "./pages/commonPages/LoginPage/LoginPage";
import DashboardPage from "./pages/commonPages/DashboardPage/DashboardPage";
import { PageTitle } from "../src/hooks/PageTitle";
import { LoadingProvider } from "./context/LoadingContext";
import GlobalSpinner from "./components/GlobalSpinner/GlobalSpinner";
import ProtectedRoute from "./components/ProtectedRoute";
import RegistrationPage from "./pages/patientAdministration/RegistrationPage/MainPage/RegistrationPage";
import { PatientSearchProvider } from "./context/PatientSearchContext";

const App: React.FC = () => {
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <LoadingProvider>
          <Router>
            <GlobalSpinner />
            <PageTitle />{" "}
            {/* This will set the page title based on the route */}
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/RegistrationPage"
                element={
                  <ProtectedRoute>
                    <PatientSearchProvider>
                      <RegistrationPage />
                    </PatientSearchProvider>
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate replace to="/login" />} />
            </Routes>
          </Router>
        </LoadingProvider>
      </PersistGate>
    </ReduxProvider>
  );
};
export default App;
