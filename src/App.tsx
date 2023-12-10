import React from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider as ReduxProvider } from "react-redux";

import store from "./store/store";
import LoginPage from "./pages/commonPages/LoginPage/LoginPage";
import DashboardPage from "./pages/commonPages/DashboardPage/DashboardPage";
import { PageTitle } from "../src/hooks/PageTitle";
import { LoadingProvider } from "./context/LoadingContext";
import GlobalSpinner from "./components/GlobalSpinner/GlobalSpinner";

const App: React.FC = () => {
  return (
    <ReduxProvider store={store}>
      <LoadingProvider>
        <Router>
          <GlobalSpinner />
          <PageTitle /> {/* This will set the page title based on the route */}
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/" element={<Navigate replace to="/login" />} />
          </Routes>
        </Router>
      </LoadingProvider>
    </ReduxProvider>
  );
};
export default App;
