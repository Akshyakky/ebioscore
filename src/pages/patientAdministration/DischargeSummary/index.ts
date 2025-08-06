// src/pages/patientAdministration/DischargeSummary/index.ts
export { default as DischargeSummaryForm } from "./Form/DischargeSummaryForm";
export { default as useDischargeSummary, useDischargeSummaryStatus } from "./hooks/useDischargeSummary";
export { default as DischargeSummaryPage } from "./MainPage/DischargeSummaryPage";

// Re-export interfaces for convenience
export type { IpDischargeDetailDto } from "@/interfaces/PatientAdministration/IpDischargeDetailDto";
