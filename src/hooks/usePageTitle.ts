import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

interface PageTitleMap {
  [key: string]: string;
}

const pageTitleMap: PageTitleMap = {
  "/login": "Login",
  "/dashboard": "Dashboard",
  "/RegistrationPage": "Registration",
  "/RoutineReportsPA": "Routine Reports [PA]",
  "/RevisitPage": "Revisit",
  "/ListOfReportsPage": "Routine Reports [FO]",
  "/ContactListPage": "Contact List",
  "/UserListPage": "User List",
  "/ProfileListPage": "Profile List",
  "/AdmissionPage": "Patient Admission",
  "/AppointmentPage": "Appointment",
  "/ReasonListPage": "Reason List",
  "/ResourceListPage": "Resource List",
  "/BreakListPage": "Break List",
  "/PatientInvoiceCodePage": "Patient Invoice Code List",
  "/DepartmentListPage": "Department List",
  "/PaymentTypesPage": "Payments Type List",
  "/ServiceGroupsListPage": "Service Groups List",
  "/AlertPage": "Alert Manager",
  "/WardCategoryPage": "Room-Bed Category List",
  "/BedSetUpPage": "Room-Bed Set-Up",
  "/DeptUnitListPage": "Department Unit List",
  "/InsuranceListPage": "Insurance List",
  "/ProductListPage": "Product List",
  "/ProductTaxListPage": "Product Tax List",
  "/ProductOverviewPage": "Product Overview ",
  "/ManageBedPage": "Manage BedPage ",
  "/DiagnosisListPage": "Diagnosis List ",
  "/MedicationListPage": "Medication List ",
  "/MedicationFormPage": "Medication Form ",
  "/AppModifiedListPage": "App Modified List",
  "/ChargeDetailsPage": "Schedule of Charge List",
  "/DischargePage": "Patient Discharge ",
  "/WardBedTransferPage": "Patient Ward Bed Transfer ",
  "/MedicationFrequencyPage": "Medication Frequency",
  "/MedicationDosagePage": "Medication Dosage",
  "/ProcedureListPage": "Procedure List",
  "/MedicationGenericPage": "Medication Generic",
  "/DischargeSummaryPage": "Discharge Summary",
  // Add more mappings as needed
};

export const usePageTitle = () => {
  const [pageTitle, setPageTitle] = useState("eBios - Healthcare Solution");
  const location = useLocation();

  useEffect(() => {
    const titleSuffix = pageTitleMap[location.pathname] || "eBios Healthcare Solution";
    const title = `eBios - ${titleSuffix}`;
    document.title = title;
    setPageTitle(titleSuffix);
  }, [location.pathname]);

  return { pageTitle };
};
