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
import { LoadingProvider } from "./context/LoadingContext";
import GlobalSpinner from "./components/GlobalSpinner/GlobalSpinner";
import ProtectedRoute from "./components/ProtectedRoute";
import RegistrationPage from "./pages/patientAdministration/RegistrationPage/MainPage/RegistrationPage";
import { PatientSearchProvider } from "./context/PatientSearchContext";
import RoutineReportsPA from "./pages/patientAdministration/ReportPage/MainPage/RoutineReportsPAPage";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../src/layouts/SideBar/Theme";
import RevisitPage from "./pages/patientAdministration/RevisitPage/MainPage/RevisitPage";

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <ReduxProvider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <LoadingProvider>
            <Router>
              <GlobalSpinner />
              {/* <PageTitle />{" "} */}
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
                <Route
                  path="/RevisitPage"
                  element={
                    <ProtectedRoute>
                      <PatientSearchProvider>
                        <RevisitPage />
                      </PatientSearchProvider>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/RoutineReportsPA"
                  element={
                    <ProtectedRoute>
                      <RoutineReportsPA />
                    </ProtectedRoute>
                  }
                />
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
