import LoginPage from "../pages/common/LoginPage/LoginPage";
import DashboardPage from "../pages/common/DashboardPage/DashboardPage";
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
import ReasonListPage from "../pages/frontOffice/ReasonList/MainPage/ReasonListPage";
import BreakListPage from "../pages/frontOffice/BreakList/MainPage/BreakListPage";
import AppointmentPage from "../pages/frontOffice/AppointmentPage/MainPage/AppointmentPage";
import PatientInvoiceCodePage from "../pages/billing/PatientInvoiceCodePage/MainPage/PatientInvoiceCodePage";
import DepartmentListPage from "../pages/billing/DepartmentListPage/MainPage/DepartmentListPage";
import PaymentTypesPage from "../pages/billing/PaymentTypesPage/MainPage/PaymentTypesPage";
import ServiceGroupsListPage from "../pages/billing/ServiceGroupsListPage/MainPage/ServiceGroupsListPage";
import WardCategoryPage from "../pages/hospitalAdministration/WardCategoryPage/MainPage/WardCategoryPage";
import BedSetUpPage from "../pages/hospitalAdministration/Room-BedSetUp/MainPage/BedSetUpPage";
import DeptUnitListPage from "../pages/hospitalAdministration/DeptUnitList/MainPage/DeptUnitListPage";
import InsuranceListPage from "../pages/hospitalAdministration/InsuranceList/MainPage/InsuranceListPage";
import ProductListPage from "../pages/inventoryManagement/ProductList/MainPage/ProductListPage";
import ProductTaxListPage from "../pages/inventoryManagement/ProductTaxList/MainPage/ProductTaxListPage";
import ProductOverviewPage from "../pages/inventoryManagement/ProductOverview/MainPage/ProductOverviewPage";
import AlertPage from "../pages/common/AlertManagerPage/MainPage/Alertpage";
import ManageBedPage from "../pages/patientAdministration/ManageBed/MainPage/ManageBedPage";
import DiagnosisListPage from "../pages/clinicalManagement/Diagnosis/MainPage/DiagnosisListPage";

interface RouteConfig {
  path: string;
  component: React.ComponentType<any>;
  protected: boolean;
  providers?: React.ComponentType<any>[];
}

const routeConfig: RouteConfig[] = [
  { path: "/login", component: LoginPage, protected: false },
  { path: "/dashboard", component: DashboardPage, protected: true },
  { path: "/registrationpage", component: RegistrationPage, protected: true, providers: [PatientSearchProvider] },
  { path: "/revisitpage", component: RevisitPage, protected: true, providers: [PatientSearchProvider] },
  { path: "/routinereportspa", component: RoutineReportsPA, protected: true },
  { path: "/listofreportspage", component: ListOfReportsPage, protected: true },
  { path: "/contactlistpage", component: ContactListPage, protected: true, providers: [ContactListSearchProvider] },
  { path: "/userlistpage", component: UserListPage, protected: true, providers: [UserListSearchProvider] },
  { path: "/profilelistpage", component: ProfileListPage, protected: true, providers: [ProfileListSearchProvider] },
  { path: "/alertPage", component: AlertPage, protected: true, providers: [PatientSearchProvider] },
  { path: "/admissionpage", component: AdmissionPage, protected: true, providers: [PatientSearchProvider] },
  { path: "/ResourceListPage", component: ResourceListPage, protected: true },
  { path: "/ReasonListPage", component: ReasonListPage, protected: true },
  { path: "/BreakListPage", component: BreakListPage, protected: true },
  { path: "/Appointmentpage", component: AppointmentPage, protected: true },
  { path: "/PatientInvoiceCodePage", component: PatientInvoiceCodePage, protected: true },
  { path: "/DepartmentListPage", component: DepartmentListPage, protected: true, providers: [UserListSearchProvider] },
  { path: "/ServiceGroupsListPage", component: ServiceGroupsListPage, protected: true },
  { path: "/PaymentTypesPage", component: PaymentTypesPage, protected: true },
  { path: "/AlertPage", component: AlertPage, protected: true },
  { path: "/WardCategoryPage", component: WardCategoryPage, protected: true },
  { path: "/BedSetUpPage", component: BedSetUpPage, protected: true },
  { path: "/DeptUnitListPage", component: DeptUnitListPage, protected: true },
  { path: "/InsuranceListPage", component: InsuranceListPage, protected: true },
  { path: "/ProductListPage", component: ProductListPage, protected: true },
  { path: "/ProductTaxListPage", component: ProductTaxListPage, protected: true },
  { path: "/ProductOverviewPage", component: ProductOverviewPage, protected: true },
  { path: "/ManageBedPage", component: ManageBedPage, protected: true },
  { path: "/DiagnosisListPage", component: DiagnosisListPage, protected: true },
];

export default routeConfig;
