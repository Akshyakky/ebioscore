export const SAMPLE_STATUS = {
  PENDING: "Pending",
  PARTIALLY_COLLECTED: "Partially Collected",
  COLLECTED: "Collected",
  PARTIALLY_COMPLETED: "Partially Completed",
  COMPLETED: "Completed",
  PARTIALLY_APPROVED: "Partially Approved",
  APPROVED: "Approved",
  REJECTED: "Rejected",
} as const;

export const SAMPLE_STATUS_OPTIONS = [
  { value: "all", label: "All Report Status" },
  { value: "pending", label: "Sample Pending" },
  { value: "collected", label: "Sample Collected" },
  { value: "rejected", label: "Sample Rejected" },
  { value: "completed", label: "Report Completed" },
  { value: "approved", label: "Report Approved" },
  { value: "deleted", label: "Deleted" },
];

export const PATIENT_STATUS_OPTIONS = [
  { value: "all", label: "All Patients" },
  { value: "op", label: "Out-Patient (OP)" },
  { value: "ip", label: "In-Patient (IP)" },
];

export const SAMPLE_STATUS_UPDATE_OPTIONS = [
  { value: "P", label: "Pending" },
  { value: "C", label: "Collected" },
  { value: "R", label: "Rejected" },
];

export const APPROVAL_STATUS = {
  YES: "Y" as const,
  NO: "N" as const,
};
