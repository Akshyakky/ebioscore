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
  "/AdmissionPage": "Admission",
  "/AppointmentPage": "Appointment",
  "/ReasonListPage": "ReasonList",
  "/ResourceListPage": "ResourceList",
  "/BreakListPage": "BreakList",
  "/PatientInvoiceCodePage": "Patient Invoice Code List",
  "/DepartmentListPage": "Department List",
  "/PaymentTypesPage": "Payments Type List",
  // Add more mappings as needed
};

export const usePageTitle = () => {
  const [pageTitle, setPageTitle] = useState("eBios - Healthcare Solution");
  const location = useLocation();

  useEffect(() => {
    const titleSuffix =
      pageTitleMap[location.pathname] || "eBios Healthcare Solution";
    const title = `eBios - ${titleSuffix}`;
    document.title = title;
    setPageTitle(titleSuffix);
  }, [location.pathname]);

  return { pageTitle };
};
