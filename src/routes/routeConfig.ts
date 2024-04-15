// routes/routeConfig.ts
import LoginPage from "../pages/commonPages/LoginPage/LoginPage";
import DashboardPage from "../pages/commonPages/DashboardPage/DashboardPage";
import RegistrationPage from "../pages/patientAdministration/RegistrationPage/MainPage/RegistrationPage";
import RevisitPage from "../pages/patientAdministration/RevisitPage/MainPage/RevisitPage";
import RoutineReportsPA from "../pages/patientAdministration/RoutineReportsPage/MainPage/RoutineReportsPAPage";
import ListOfReportsPage from "../pages/routineReports/MainPage/ListOfReportsPage";
import { PatientSearchProvider } from "../context/PatientSearchContext";

const routeConfig = [
  { path: "/login", component: LoginPage, protected: false },
  { path: "/dashboard", component: DashboardPage, protected: true },
  {
    path: "/registrationpage",
    component: RegistrationPage,
    protected: true,
    providers: [PatientSearchProvider], //provider: PatientSearchProvider,
  },
  {
    path: "/revisitpage",
    component: RevisitPage,
    protected: true,
    providers: [PatientSearchProvider],
  },
  { path: "/routinereportspa", component: RoutineReportsPA, protected: true },
  { path: "/listofreportspage", component: ListOfReportsPage, protected: true },
  // Add more routes here as needed
];

export default routeConfig;
