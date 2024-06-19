// routes/routeConfig.ts
import LoginPage from "../pages/commonPages/LoginPage/LoginPage";
import DashboardPage from "../pages/commonPages/DashboardPage/DashboardPage";
import RegistrationPage from "../pages/patientAdministration/RegistrationPage/MainPage/RegistrationPage";
import RevisitPage from "../pages/patientAdministration/RevisitPage/MainPage/RevisitPage";
import RoutineReportsPA from "../pages/patientAdministration/RoutineReportsPage/MainPage/RoutineReportsPAPage";
import ListOfReportsPage from "../pages/routineReports/MainPage/ListOfReportsPage";
import { PatientSearchProvider } from "../context/PatientSearchContext";
import ContactListPage from "../pages/hospitalAdministration/ContactListPage/MainPage/ContactListPage";
import { ContactListSearchProvider } from "../context/hospitalAdministration/ContactListSearchContext";
import UserListPage from "../pages/securityManagement/UserListPage/MainPage/UserListPage";
import ProfileListPage from "../pages/securityManagement/ProfileListPage/MainPage/ProfileListPage";

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
  {
    path: "/ContactListPage",
    component: ContactListPage,
    protected: true,
    providers: [ContactListSearchProvider],
  },
  {
    path: "/UserListPage",
    component: UserListPage,
    protected: true,
  },
  {
    path: "/ProfileListPage",
    component: ProfileListPage,
    protected: true,
  },
  // Add more routes here as needed
];

export default routeConfig;
