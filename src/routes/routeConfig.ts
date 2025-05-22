import LoginPage from "../pages/common/LoginPage/LoginPage";
import DashboardPage from "../pages/common/DashboardPage/DashboardPage";
import RevisitPage from "../pages/patientAdministration/RevisitPage/MainPage/RevisitPage";
import { PatientSearchProvider } from "../context/PatientSearchContext";
import ContactListPage from "../pages/hospitalAdministration/ContactListPage/MainPage/ContactListPage";
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
import EmployeeRegistrationForm from "@/pages/common/ExampleFormPage/EmployeeRegistrationForm";
import AlertManager from "@/pages/common/AlertManagerPage/MainPage/AlertManager";
import PurchaseOrderPage from "@/pages/inventoryManagement/PurchaseOrder/MainPage/PurchaseOrderPage";
import LogModule from "@/pages/common/LogViewerPage/LogModule";
import ProductList from "@/pages/inventoryManagement/ProductList/MainPage/ProductList";
import ProductTransaction from "@/pages/inventoryManagement/ProductTransaction/ProductTransaction";
import RegistrationPage from "@/pages/patientAdministration/RegistrationPage/MainPage/RegistrationPage";

interface RouteConfig {
  path: string;
  component: React.ComponentType<any>;
  protected: boolean;
  providers?: React.ComponentType<any>[];
  metadata?: {
    title: string;
    category: "admin" | "patient" | "clinical" | "billing" | "inventory" | "default";
    icon?: React.ElementType;
    color?: string;
  };
}

const routeConfig: RouteConfig[] = [
  // { path: "/", component: () => <Navigate to="/dashboard" />, protected: true },
  {
    path: "/",
    component: LoginPage, // or use: () => <Navigate to="/login" />
    protected: false,
    metadata: {
      title: "Home",
      category: "default",
    },
  },
  {
    path: "/login",
    component: LoginPage,
    protected: false,
    metadata: {
      title: "Login",
      category: "default",
    },
  },
  {
    path: "/dashboard",
    component: DashboardPage,
    protected: true,
    metadata: {
      title: "Dashboard",
      category: "default",
    },
  },
  {
    path: "/registrationpage",
    component: RegistrationPage,
    protected: true,
    providers: [PatientSearchProvider],
    metadata: {
      title: "Registration",
      category: "patient",
    },
  },
  {
    path: "/revisitpage",
    component: RevisitPage,
    protected: true,
    providers: [PatientSearchProvider],
    metadata: {
      title: "Revisit",
      category: "patient",
    },
  },
  {
    path: "/contactlistpage",
    component: ContactListPage,
    protected: true,
    metadata: {
      title: "Contact List",
      category: "admin",
    },
  },
  {
    path: "/userlistpage",
    component: UserListPage,
    protected: true,
    providers: [UserListSearchProvider],
    metadata: {
      title: "User List",
      category: "admin",
    },
  },
  {
    path: "/profilelistpage",
    component: ProfileListPage,
    protected: true,
    providers: [ProfileListSearchProvider],
    metadata: {
      title: "Profile List",
      category: "admin",
    },
  },
  {
    path: "/admissionpage",
    component: AdmissionPage,
    protected: true,
    providers: [PatientSearchProvider],
    metadata: {
      title: "Patient Admission",
      category: "patient",
    },
  },
  {
    path: "/ResourceListPage",
    component: ResourceListPage,
    protected: true,
    metadata: {
      title: "Resource List",
      category: "default",
    },
  },
  {
    path: "/ReasonListPage",
    component: ReasonListPage,
    protected: true,
    metadata: {
      title: "Reason List",
      category: "default",
    },
  },
  {
    path: "/BreakListPage",
    component: BreakListPage,
    protected: true,
    metadata: {
      title: "Break List",
      category: "default",
    },
  },
  {
    path: "/Appointmentpage",
    component: AppointmentPage,
    protected: true,
    metadata: {
      title: "Appointments",
      category: "default",
    },
  },
  {
    path: "/PatientInvoiceCodePage",
    component: PatientInvoiceCodePage,
    protected: true,
    metadata: {
      title: "Patient Invoice Code",
      category: "billing",
    },
  },
  {
    path: "/DepartmentListPage",
    component: DepartmentListPage,
    protected: true,
    providers: [UserListSearchProvider],
    metadata: {
      title: "Departments",
      category: "admin",
    },
  },
  {
    path: "/ServiceGroupsListPage",
    component: ServiceGroupsListPage,
    protected: true,
    metadata: {
      title: "Service Groups",
      category: "billing",
    },
  },
  {
    path: "/PaymentTypesPage",
    component: PaymentTypesPage,
    protected: true,
    metadata: {
      title: "Payment Types",
      category: "billing",
    },
  },
  {
    path: "/AlertPage",
    component: AlertManager,
    protected: true,
    providers: [PatientSearchProvider],
    metadata: {
      title: "Alerts",
      category: "default",
    },
  },
  {
    path: "/WardCategoryPage",
    component: WardCategoryPage,
    protected: true,
    metadata: {
      title: "Ward Categories",
      category: "admin",
    },
  },
  {
    path: "/BedSetUpPage",
    component: BedSetUpPage,
    protected: true,
    metadata: {
      title: "Bed Setup",
      category: "admin",
    },
  },
  {
    path: "/DeptUnitListPage",
    component: DeptUnitListPage,
    protected: true,
    metadata: {
      title: "Department Units",
      category: "admin",
    },
  },
  {
    path: "/InsuranceListPage",
    component: InsuranceListPage,
    protected: true,
    metadata: {
      title: "Insurance",
      category: "admin",
    },
  },
  {
    path: "/ProductListPage",
    component: ProductList,
    protected: true,
    metadata: {
      title: "Products",
      category: "inventory",
    },
  },
  {
    path: "/ProductTaxListPage",
    component: ProductTaxListPage,
    protected: true,
    metadata: {
      title: "Product Tax",
      category: "inventory",
    },
  },
  {
    path: "/ProductOverviewPage",
    component: ProductOverviewPage,
    protected: true,
    metadata: {
      title: "Product Overview",
      category: "inventory",
    },
  },
  {
    path: "/ManageBedPage",
    component: ManageBedPage,
    protected: true,
    metadata: {
      title: "Manage Beds",
      category: "patient",
    },
  },
  {
    path: "/DiagnosisListPage",
    component: DiagnosisListPage,
    protected: true,
    metadata: {
      title: "Diagnosis List",
      category: "clinical",
    },
  },
  {
    path: "/MedicationListPage",
    component: MedicationListPage,
    protected: true,
    metadata: {
      title: "Medications",
      category: "clinical",
    },
  },
  {
    path: "/MedicationFormPage",
    component: MedicationFormPage,
    protected: true,
    metadata: {
      title: "Medication Forms",
      category: "clinical",
    },
  },
  {
    path: "/AppModifiedListPage",
    component: AppModifiedListPage,
    protected: true,
    metadata: {
      title: "Modified Applications",
      category: "admin",
    },
  },
  {
    path: "/ChargeDetailsPage",
    component: ChargeDetailsPage,
    protected: true,
    metadata: {
      title: "Charge Details",
      category: "billing",
    },
  },
  {
    path: "/DischargePage",
    component: DischargePage,
    protected: true,
    metadata: {
      title: "Discharge",
      category: "patient",
    },
  },
  {
    path: "/WardBedTransferPage",
    component: WardBedTransferPage,
    protected: true,
    metadata: {
      title: "Ward/Bed Transfer",
      category: "patient",
    },
  },
  {
    path: "/MedicationFrequencyPage",
    component: MedicationFrequencyPage,
    protected: true,
    metadata: {
      title: "Medication Frequency",
      category: "clinical",
    },
  },
  {
    path: "/MedicationDosagePage",
    component: MedicationDosagePage,
    protected: true,
    metadata: {
      title: "Medication Dosage",
      category: "clinical",
    },
  },
  {
    path: "/ProcedureListPage",
    component: ProcedureListPage,
    protected: true,
    metadata: {
      title: "Procedures",
      category: "clinical",
    },
  },
  {
    path: "/MedicationGenericPage",
    component: MedicationGenericPage,
    protected: true,
    metadata: {
      title: "Generic Medications",
      category: "clinical",
    },
  },
  {
    path: "/InvestigationListPage",
    component: InvestigationListPage,
    protected: true,
    metadata: {
      title: "Investigations",
      category: "clinical",
    },
  },
  {
    path: "/ComponentEntryTypePage",
    component: ComponentEntryTypePage,
    protected: true,
    metadata: {
      title: "Component Entry Types",
      category: "clinical",
    },
  },
  {
    path: "/PurchaseOrderPage",
    component: PurchaseOrderPage,
    protected: true,
    metadata: {
      title: "Purchase Orders",
      category: "inventory",
    },
  },
  {
    path: "/ForgotPasswordPage",
    component: ForgotPasswordPage,
    protected: false,
    metadata: {
      title: "Forgot Password",
      category: "default",
    },
  },
  {
    path: "/IndentProductPage",
    component: IndentProductPage,
    protected: true,
    metadata: {
      title: "Indent Product",
      category: "inventory",
    },
  },
  {
    path: "/EmployeeRegistrationForm",
    component: EmployeeRegistrationForm,
    protected: true,
    metadata: {
      title: "Employee Registration",
      category: "admin",
    },
  },
  {
    path: "/LogModulePage",
    component: LogModule,
    protected: true,
    metadata: {
      title: "Log Module",
      category: "admin",
    },
  },
  {
    path: "/ProductTransaction",
    component: ProductTransaction,
    protected: true,
    metadata: {
      title: "Product Transaction",
      category: "inventory",
    },
  },
  // 404 Not Found route - must be placed last to catch all unmatched routes
  {
    path: "*",
    component: NotFoundPage,
    protected: false,
    metadata: {
      title: "Page Not Found",
      category: "default",
    },
  },
];

export default routeConfig;
