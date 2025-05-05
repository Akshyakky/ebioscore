import LoginPage from "../pages/common/LoginPage/LoginPage";
import DashboardPage from "../pages/common/DashboardPage/DashboardPage";
import RegistrationPage from "../pages/common/ExampleFormPage/RegistrationPage";
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
import ManageBedPage from "../pages/patientAdministration/ManageBed/MainPage/ManageBedPage";
import DiagnosisListPage from "../pages/clinicalManagement/DiagnosisList/MainPage/DiagnosisListPage";
import MedicationListPage from "../pages/clinicalManagement/MedicationList/MainPage/MedicationListPage";
import AppModifiedListPage from "../pages/hospitalAdministration/AppModifiedList/MainPage/AppModifiedListPage";
import ChargeDetailsPage from "../pages/billing/ChargeDetailsPage/MainPage/ChargeDetailsPage";
import DischargePage from "../pages/patientAdministration/DischargePage/MainPage/DischargePage";
import WardBedTransferPage from "../pages/patientAdministration/WardBedTransfer/MainPage/WardBedTransferPage";
import MedicationFormPage from "@/pages/clinicalManagement/medicationForm/MainPage/MedicationFormPage";
import MedicationFrequencyPage from "@/pages/clinicalManagement/MedicationFrequency/MainPage/MedicationFrequencyPage";
import MedicationDosagePage from "@/pages/clinicalManagement/MedicationDosage/MainPage/MedicationDosagePage";
import ProcedureListPage from "@/pages/clinicalManagement/ProcedureList/MainPage/ProcedureListPage";
import MedicationGenericPage from "@/pages/clinicalManagement/MedicationGeneric/MainPage/MedicationGenericPage";
import InvestigationListPage from "@/pages/laboratory/InvestigationListPage/MainPage/InvestigationListPage";
import ComponentEntryTypePage from "@/pages/laboratory/ComponentEntryType/MainPage/ComponentEntryTypePage";
import ForgotPasswordPage from "@/pages/common/ForgotPasswordPage/ForgotPasswordPage";
import IndentProductPage from "@/pages/inventoryManagement/IndentProduct/MainPage/IndentProductPage";
import NotFoundPage from "@/pages/common/NotFoundPage/NotFoundPage";
import { Navigate } from "react-router-dom";
import EmployeeRegistrationForm from "@/pages/common/ExampleFormPage/EmployeeRegistrationForm";
import AlertManager from "@/pages/common/AlertManagerPage/MainPage/AlertManager";
import GRNPage from "@/pages/inventoryManagement/GRN/MainPage/GRNPage";
import PurchaseOrderPage from "@/pages/inventoryManagement/PurchaseOrderX/MainPage/PurchaseOrderPage";
import LogModule from "@/pages/common/LogViewerPage/LogModule";
import ProductList from "@/pages/inventoryManagement/ProductList/MainPage/ProductList";

interface RouteConfig {
  path: string;
  component: React.ComponentType<any>;
  protected: boolean;
  providers?: React.ComponentType<any>[];
}

const routeConfig: RouteConfig[] = [
  // { path: "/", component: () => <Navigate to="/dashboard" />, protected: true },
  { path: "/login", component: LoginPage, protected: false },
  { path: "/dashboard", component: DashboardPage, protected: true },
  { path: "/registrationpage", component: RegistrationPage, protected: true, providers: [PatientSearchProvider] },
  { path: "/revisitpage", component: RevisitPage, protected: true, providers: [PatientSearchProvider] },
  { path: "/routinereportspa", component: RoutineReportsPA, protected: true },
  { path: "/listofreportspage", component: ListOfReportsPage, protected: true },
  { path: "/contactlistpage", component: ContactListPage, protected: true, providers: [ContactListSearchProvider] },
  { path: "/userlistpage", component: UserListPage, protected: true, providers: [UserListSearchProvider] },
  { path: "/profilelistpage", component: ProfileListPage, protected: true, providers: [ProfileListSearchProvider] },
  { path: "/admissionpage", component: AdmissionPage, protected: true, providers: [PatientSearchProvider] },
  { path: "/ResourceListPage", component: ResourceListPage, protected: true },
  { path: "/ReasonListPage", component: ReasonListPage, protected: true },
  { path: "/BreakListPage", component: BreakListPage, protected: true },
  { path: "/Appointmentpage", component: AppointmentPage, protected: true },
  { path: "/PatientInvoiceCodePage", component: PatientInvoiceCodePage, protected: true },
  { path: "/DepartmentListPage", component: DepartmentListPage, protected: true, providers: [UserListSearchProvider] },
  { path: "/ServiceGroupsListPage", component: ServiceGroupsListPage, protected: true },
  { path: "/PaymentTypesPage", component: PaymentTypesPage, protected: true },
  { path: "/AlertPage", component: AlertManager, protected: true, providers: [PatientSearchProvider] },
  { path: "/WardCategoryPage", component: WardCategoryPage, protected: true },
  { path: "/BedSetUpPage", component: BedSetUpPage, protected: true },
  { path: "/DeptUnitListPage", component: DeptUnitListPage, protected: true },
  { path: "/InsuranceListPage", component: InsuranceListPage, protected: true },
  { path: "/ProductListPage", component: ProductList, protected: true },
  { path: "/ProductTaxListPage", component: ProductTaxListPage, protected: true },
  { path: "/ProductOverviewPage", component: ProductOverviewPage, protected: true },
  { path: "/ManageBedPage", component: ManageBedPage, protected: true },
  { path: "/DiagnosisListPage", component: DiagnosisListPage, protected: true },
  { path: "/MedicationListPage", component: MedicationListPage, protected: true },
  { path: "/MedicationFormPage", component: MedicationFormPage, protected: true },
  { path: "/AppModifiedListPage", component: AppModifiedListPage, protected: true },
  { path: "/ChargeDetailsPage", component: ChargeDetailsPage, protected: true },
  { path: "/DischargePage", component: DischargePage, protected: true },
  { path: "/WardBedTransferPage", component: WardBedTransferPage, protected: true },
  { path: "/MedicationFrequencyPage", component: MedicationFrequencyPage, protected: true },
  { path: "/MedicationDosagePage", component: MedicationDosagePage, protected: true },
  { path: "/ProcedureListPage", component: ProcedureListPage, protected: true },
  { path: "/MedicationGenericPage", component: MedicationGenericPage, protected: true },
  { path: "/InvestigationListPage", component: InvestigationListPage, protected: true },
  { path: "/ComponentEntryTypePage", component: ComponentEntryTypePage, protected: true },
  { path: "/PurchaseOrderPage", component: PurchaseOrderPage, protected: true },
  { path: "/GRNPage", component: GRNPage, protected: true },
  { path: "/ForgotPasswordPage", component: ForgotPasswordPage, protected: false },
  { path: "/IndentProductPage", component: IndentProductPage, protected: true },
  { path: "/EmployeeRegistrationForm", component: EmployeeRegistrationForm, protected: true },
  { path: "/LogModulePage", component: LogModule, protected: true },
  // 404 Not Found route - must be placed last to catch all unmatched routes
  { path: "*", component: NotFoundPage, protected: false },
];

export default routeConfig;
