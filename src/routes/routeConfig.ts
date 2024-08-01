import LoginPage from "../pages/commonPages/LoginPage/LoginPage";
import DashboardPage from "../pages/commonPages/DashboardPage/DashboardPage";
import RegistrationPage from "../pages/patientAdministration/RegistrationPage/MainPage/RegistrationPage";
import RevisitPage from "../pages/patientAdministration/RevisitPage/MainPage/RevisitPage";
import RoutineReportsPA from "../pages/patientAdministration/RoutineReportsPage/MainPage/RoutineReportsPAPage";
import ListOfReportsPage from "../pages/routineReports/MainPage/ListOfReportsPage";
import { PatientSearchProvider } from "../context/PatientSearchContext";
import ContactListPage from "../pages/hospitalAdministration/ContactListPage/MainPage/ContactListPage";
import { ContactListSearchProvider } from "../context/hospitalAdministration/ContactListSearchContext";
import ProfileListPage from "../pages/securityManagement/ProfileListPage/MainPage/ProfileListPage";
import { ProfileListSearchProvider } from "../context/SecurityManagement/ProfileListSearchContext";
import AdmissionPage from "../pages/patientAdministration/AdmissionPage/MainPage/AdmissionPage";
import { UserListSearchProvider } from "../context/SecurityManagement/UserListSearchContext";
import UserListPage from "../pages/securityManagement/UserListPage/MainPage/UserListPage";
import ResourceListPage from "../pages/frontOffice/ResourceList/MainPage/ResourceListPage";
import { ResourceListProvider } from "../context/frontOffice/ResourceListContext";
import ReasonListPage from "../pages/frontOffice/ReasonList/MainPage/ReasonListPage";
import BreakListPage from "../pages/frontOffice/BreakList/MainPage/BreakListPage";
import AppointmentPage from "../pages/frontOffice/AppointmentPage/MainPage/AppointmentPage";

interface RouteConfig {
  path: string;
  component: React.ComponentType<any>;
  protected: boolean;
  providers?: React.ComponentType<any>[];
}

const routeConfig: RouteConfig[] = [
  { path: "/login", component: LoginPage, protected: false },
  { path: "/dashboard", component: DashboardPage, protected: true },
  {
    path: "/registrationpage",
    component: RegistrationPage,
    protected: true,
    providers: [PatientSearchProvider],
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
    path: "/contactlistpage",
    component: ContactListPage,
    protected: true,
    providers: [ContactListSearchProvider],
  },
  {
    path: "/userlistpage",
    component: UserListPage,
    protected: true,
    providers: [UserListSearchProvider],
  },
  {
    path: "/profilelistpage",
    component: ProfileListPage,
    protected: true,
    providers: [ProfileListSearchProvider],
  },
  {
    path: "/admissionpage",
    component: AdmissionPage,
    protected: true,
    providers: [PatientSearchProvider],
  },


  {
    path: "/ResourceListPage",
    component: ResourceListPage,
    protected: true,
    providers: [ResourceListProvider],
  },


  {
    path: "/ReasonListPage",
    component: ReasonListPage,
    protected: true,
    providers: [ResourceListProvider],
  },

  {
    path: "/BreakListPage",
    component: BreakListPage,
    protected: true,
    providers: [ResourceListProvider],
  },


  // Add more routes here as needed
  {
    path: "/appointmentpage",
    component: AppointmentPage,
    protected: true,
  },
];

export default routeConfig;
