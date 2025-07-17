import BillingPage from "@/pages/billing/Billing/MainPage/BillingPage";
import TemplateListPage from "@/pages/clinicalManagement/TemplateList/MainPage/TemplateListPage";
import { AlertProvider } from "@/providers/AlertProvider";
import React, { lazy, Suspense } from "react";

//const AppointmentPage = lazy(() => import("@/pages/frontOffice/AppointmentPage/MainPage/AppointmentPage"));
const LogViewerPage = lazy(() => import("@/pages/common/LogViewerPage/LogViewerPage"));
//const ComponentEntryTypePage = lazy(() => import("@/pages/laboratory/ComponentEntryType/MainPage/ComponentEntryTypePage"));

// Lazy load components
const LoginPage = lazy(() => import("@/pages/common/LoginPage/LoginPage"));
const DashboardPage = lazy(() => import("@/pages/common/DashboardPage/DashboardPage"));
const RevisitPage = lazy(() => import("@/pages/patientAdministration/RevisitPage/MainPage/RevisitPage"));
const ContactListPage = lazy(() => import("@/pages/hospitalAdministration/ContactListPage/MainPage/ContactListPage"));
const ProfileListPage = lazy(() => import("@/pages/securityManagement/ProfileListPage/MainPage/ProfileListPage"));
const AdmissionPage = lazy(() => import("@/pages/patientAdministration/AdmissionPage/MainPage/AdmissionPage"));
const UserListPage = lazy(() => import("@/pages/securityManagement/UserListPage/MainPage/UserListPage"));
const ResourceListPage = lazy(() => import("@/pages/frontOffice/ResourceList/MainPage/ResourceListPage"));
const ReasonListPage = lazy(() => import("@/pages/frontOffice/ReasonList/MainPage/ReasonListPage"));
const BreakListPage = lazy(() => import("@/pages/frontOffice/BreakList/MainPage/BreakListPage"));
const PatientInvoiceCodePage = lazy(() => import("@/pages/billing/PatientInvoiceCodePage/MainPage/PatientInvoiceCodePage"));
const DepartmentListPage = lazy(() => import("@/pages/billing/DepartmentListPage/MainPage/DepartmentListPage"));
const PaymentTypesPage = lazy(() => import("@/pages/billing/PaymentTypesPage/MainPage/PaymentTypesPage"));
const ServiceGroupsListPage = lazy(() => import("@/pages/billing/ServiceGroupsListPage/MainPage/ServiceGroupsListPage"));
const WardCategoryPage = lazy(() => import("@/pages/hospitalAdministration/WardCategoryPage/MainPage/WardCategoryPage"));
const BedSetUpPage = lazy(() => import("@/pages/hospitalAdministration/Room-BedSetUp/MainPage/BedSetUpPage"));
const DeptUnitListPage = lazy(() => import("@/pages/hospitalAdministration/DeptUnitList/MainPage/DeptUnitListPage"));
const InsuranceListPage = lazy(() => import("@/pages/hospitalAdministration/InsuranceList/MainPage/InsuranceListPage"));
const ProductTaxListPage = lazy(() => import("@/pages/inventoryManagement/ProductTaxList/MainPage/ProductTaxListPage"));
const ProductOverviewPage = lazy(() => import("@/pages/inventoryManagement/ProductOverview/MainPage/ProductOverviewPage"));
const ManageBedsPage = lazy(() => import("@/pages/hospitalAdministration/ManageBeds/MainPage/ManageBedsPage"));
const DiagnosisListPage = lazy(() => import("@/pages/clinicalManagement/DiagnosisList/MainPage/DiagnosisListPage"));
const MedicationListPage = lazy(() => import("@/pages/clinicalManagement/MedicationList/MainPage/MedicationListPage"));
const AppModifiedListPage = lazy(() => import("@/pages/hospitalAdministration/AppModifiedList/MainPage/AppModifiedListPage"));
const ScheduleOfChargesPage = lazy(() => import("@/pages/billing/ScheduleOfChargesPage/MainPage/ScheduleOfChargesPage"));
const DischargePage = lazy(() => import("@/pages/patientAdministration/DischargePage/MainPage/DischargePage"));
const WardBedTransferPage = lazy(() => import("@/pages/patientAdministration/WardBedTransfer/MainPage/WardBedTransferPage"));
const MedicationFormPage = lazy(() => import("@/pages/clinicalManagement/medicationForm/MainPage/MedicationFormPage"));
const MedicationFrequencyPage = lazy(() => import("@/pages/clinicalManagement/MedicationFrequency/MainPage/MedicationFrequencyPage"));
const MedicationDosagePage = lazy(() => import("@/pages/clinicalManagement/MedicationDosage/MainPage/MedicationDosagePage"));
const MedicationInstructionPage = lazy(() => import("@/pages/clinicalManagement/MedicationInstruction/MainPage/MedicationInstructionPage"));
const ProcedureListPage = lazy(() => import("@/pages/clinicalManagement/ProcedureList/MainPage/ProcedureListPage"));
const MedicationGenericPage = lazy(() => import("@/pages/clinicalManagement/MedicationGeneric/MainPage/MedicationGenericPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/common/ForgotPasswordPage/ForgotPasswordPage"));
const IndentProductPage = lazy(() => import("@/pages/inventoryManagement/IndentProduct/MainPage/IndentProductPage"));
const NotFoundPage = lazy(() => import("@/pages/common/NotFoundPage/NotFoundPage"));
const AlertManager = lazy(() => import("@/pages/common/AlertManagerPage/MainPage/AlertManager"));
const ProductList = lazy(() => import("@/pages/inventoryManagement/ProductList/MainPage/ProductList"));
const ProductTransaction = lazy(() => import("@/pages/inventoryManagement/ProductTransaction/ProductTransaction"));
const PatientRegistrationRouter = lazy(() => import("@/pages/patientAdministration/RegistrationPage/PatientRegistrationRouter"));
const PatientRegistrationFormManager = lazy(() => import("@/pages/patientAdministration/RegistrationPage/MainPage/PatientRegistrationFormManager"));
const PatientRegistrationManager = lazy(() => import("@/pages/patientAdministration/RegistrationPage/MainPage/PatientRegistrationManager"));
const DeptUnitAllocationPage = lazy(() => import("@/pages/hospitalAdministration/DeptUnitAllocation/MainPage/DeptUnitAllocationPage"));
const MedicationRoutePage = lazy(() => import("@/pages/clinicalManagement/MedicationRoute/MainPage/MedicationRoutePage"));
const InvestigationListPage = lazy(() => import("@/pages/laboratory/InvestigationListPage/MainPage/InvestigationListPage"));
const PurchaseOrderPage = lazy(() => import("@/pages/inventoryManagement/PurchaseOrder/MainPage/PurchaseOrderPage"));
const GRNManagementPage = lazy(() => import("@/pages/inventoryManagement/GoodsRecieveNote/MainPage/GrnListPage"));
const ProductIssualPage = lazy(() => import("@/pages/inventoryManagement/ProductIssual/MainPage/ProductIssualPage"));

// Wrap components with Suspense
const wrapWithSuspense = (Component: React.ComponentType<any>) => {
  return (props: any) => React.createElement(Suspense, { fallback: React.createElement("div", null, "Loading...") }, React.createElement(Component, props));
};

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
    component: wrapWithSuspense(LoginPage),
    protected: false,
    providers: [AlertProvider],
    metadata: {
      title: "Home",
      category: "default",
    },
  },
  {
    path: "/login",
    component: wrapWithSuspense(LoginPage),
    protected: false,
    providers: [AlertProvider],
    metadata: {
      title: "Login",
      category: "default",
    },
  },
  {
    path: "/dashboard",
    component: wrapWithSuspense(DashboardPage),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Dashboard",
      category: "default",
    },
  },
  {
    path: "/RegistrationSearchPage",
    component: wrapWithSuspense(PatientRegistrationManager),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Registration",
      category: "patient",
    },
  },
  {
    path: "/RegistrationFormPage",
    component: wrapWithSuspense(PatientRegistrationFormManager),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Registration",
      category: "patient",
    },
  },
  {
    path: "/revisitpage",
    component: wrapWithSuspense(RevisitPage),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Revisit",
      category: "patient",
    },
  },
  {
    path: "/contactlistpage",
    component: wrapWithSuspense(ContactListPage),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Contact List",
      category: "admin",
    },
  },
  {
    path: "/userlistpage",
    component: wrapWithSuspense(UserListPage),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "User List",
      category: "admin",
    },
  },
  {
    path: "/profilelistpage",
    component: wrapWithSuspense(ProfileListPage),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Profile List",
      category: "admin",
    },
  },
  {
    path: "/admissionpage",
    component: wrapWithSuspense(AdmissionPage),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Patient Admission",
      category: "patient",
    },
  },
  {
    path: "/ResourceListPage",
    component: wrapWithSuspense(ResourceListPage),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Resource List",
      category: "default",
    },
  },
  {
    path: "/ReasonListPage",
    component: wrapWithSuspense(ReasonListPage),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Reason List",
      category: "default",
    },
  },
  {
    path: "/BreakListPage",
    component: wrapWithSuspense(BreakListPage),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Break List",
      category: "default",
    },
  },
  // {
  //   path: "/Appointmentpage",
  //   component: wrapWithSuspense(AppointmentPage),
  //   protected: true,
  //   providers: [AlertProvider],
  //   metadata: {
  //     title: "Appointments",
  //     category: "default",
  //   },
  // },
  {
    path: "/PatientInvoiceCodePage",
    component: wrapWithSuspense(PatientInvoiceCodePage),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Patient Invoice Code",
      category: "billing",
    },
  },
  {
    path: "/DepartmentListPage",
    component: wrapWithSuspense(DepartmentListPage),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Departments",
      category: "admin",
    },
  },
  {
    path: "/ServiceGroupsListPage",
    component: wrapWithSuspense(ServiceGroupsListPage),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Service Groups",
      category: "billing",
    },
  },
  {
    path: "/PaymentTypesPage",
    component: wrapWithSuspense(PaymentTypesPage),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Payment Types",
      category: "billing",
    },
  },
  {
    path: "/AlertPage",
    component: wrapWithSuspense(AlertManager),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Alerts",
      category: "default",
    },
  },
  {
    path: "/WardCategoryPage",
    component: wrapWithSuspense(WardCategoryPage),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Ward Categories",
      category: "admin",
    },
  },
  {
    path: "/BedSetUpPage",
    component: wrapWithSuspense(BedSetUpPage),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Bed Setup",
      category: "admin",
    },
  },
  {
    path: "/DeptUnitListPage",
    component: wrapWithSuspense(DeptUnitListPage),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Department Units",
      category: "admin",
    },
  },
  {
    path: "/InsuranceListPage",
    component: wrapWithSuspense(InsuranceListPage),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Insurance",
      category: "admin",
    },
  },
  {
    path: "/ProductListPage",
    component: wrapWithSuspense(ProductList),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Products",
      category: "inventory",
    },
  },
  {
    path: "/ProductTaxListPage",
    component: wrapWithSuspense(ProductTaxListPage),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Product Tax",
      category: "inventory",
    },
  },
  {
    path: "/ProductOverviewPage",
    component: wrapWithSuspense(ProductOverviewPage),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Product Overview",
      category: "inventory",
    },
  },
  {
    path: "/ManageBedPage",
    component: wrapWithSuspense(ManageBedsPage),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Manage Beds",
      category: "patient",
    },
  },
  {
    path: "/DiagnosisListPage",
    component: wrapWithSuspense(DiagnosisListPage),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Diagnosis List",
      category: "clinical",
    },
  },
  {
    path: "/MedicationListPage",
    component: wrapWithSuspense(MedicationListPage),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Medications",
      category: "clinical",
    },
  },
  {
    path: "/MedicationFormPage",
    component: wrapWithSuspense(MedicationFormPage),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Medication Forms",
      category: "clinical",
    },
  },
  {
    path: "/MedicationRoute",
    component: wrapWithSuspense(MedicationRoutePage),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Medication Routes",
      category: "clinical",
    },
  },
  {
    path: "/TemplateList",
    component: wrapWithSuspense(TemplateListPage),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Template List",
      category: "clinical",
    },
  },
  {
    path: "/AppModifiedListPage",
    component: wrapWithSuspense(AppModifiedListPage),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Modified Applications",
      category: "admin",
    },
  },
  {
    path: "/ChargeDetailsPage",
    component: wrapWithSuspense(ScheduleOfChargesPage),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Charge Details",
      category: "billing",
    },
  },
  {
    path: "/DischargePage",
    component: wrapWithSuspense(DischargePage),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Discharge",
      category: "patient",
    },
  },
  {
    path: "/WardBedTransferPage",
    component: wrapWithSuspense(WardBedTransferPage),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Ward/Bed Transfer",
      category: "patient",
    },
  },
  {
    path: "/MedicationFrequencyPage",
    component: wrapWithSuspense(MedicationFrequencyPage),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Medication Frequency",
      category: "clinical",
    },
  },
  {
    path: "/MedicationDosagePage",
    component: wrapWithSuspense(MedicationDosagePage),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Medication Dosage",
      category: "clinical",
    },
  },
  {
    path: "/ProcedureListPage",
    component: wrapWithSuspense(ProcedureListPage),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Procedures",
      category: "clinical",
    },
  },
  {
    path: "/MedicationGenericPage",
    component: wrapWithSuspense(MedicationGenericPage),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Generic Medications",
      category: "clinical",
    },
  },
  {
    path: "/MedicationInstructionPage",
    component: wrapWithSuspense(MedicationInstructionPage),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Medication Instructions",
      category: "clinical",
    },
  },
  {
    path: "/InvestigationListPage",
    component: wrapWithSuspense(InvestigationListPage),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Investigations",
      category: "clinical",
    },
  },
  // {
  //   path: "/ComponentEntryTypePage",
  //   component: wrapWithSuspense(ComponentEntryTypePage),
  //   protected: true,
  //   providers: [AlertProvider],
  //   metadata: {
  //     title: "Component Entry Types",
  //     category: "clinical",
  //   },
  // },
  {
    path: "/PurchaseOrderPage",
    component: wrapWithSuspense(PurchaseOrderPage),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Purchase Orders",
      category: "inventory",
    },
  },
  {
    path: "/ForgotPasswordPage",
    component: wrapWithSuspense(ForgotPasswordPage),
    protected: false,
    providers: [AlertProvider],
    metadata: {
      title: "Forgot Password",
      category: "default",
    },
  },
  {
    path: "/IndentProductPage",
    component: wrapWithSuspense(IndentProductPage),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Indent Product",
      category: "inventory",
    },
  },
  {
    path: "/LogModulePage",
    component: wrapWithSuspense(LogViewerPage),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Log Module",
      category: "admin",
    },
  },
  {
    path: "/ProductTransaction",
    component: wrapWithSuspense(ProductTransaction),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Product Transaction",
      category: "inventory",
    },
  },
  {
    path: "/DeptUnitAllocationPage",
    component: wrapWithSuspense(DeptUnitAllocationPage),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Department Unit Allocation",
      category: "admin",
    },
  },
  {
    path: "/GRNManagementPage",
    component: wrapWithSuspense(GRNManagementPage),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Goods Recieve Note",
      category: "inventory",
    },
  },
  {
    path: "/ProductIssualPage",
    component: wrapWithSuspense(ProductIssualPage),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "  Department Product Issual",
      category: "inventory",
    },
  },
  {
    path: "/Billing",
    component: wrapWithSuspense(BillingPage),
    protected: true,
    providers: [AlertProvider],
    metadata: {
      title: "Billing",
      category: "billing",
    },
  },
  // 404 Not Found route - must be placed last to catch all unmatched routes
  {
    path: "*",
    component: wrapWithSuspense(NotFoundPage),
    protected: false,
    providers: [AlertProvider],
    metadata: {
      title: "Page Not Found",
      category: "default",
    },
  },
];

export default routeConfig;
