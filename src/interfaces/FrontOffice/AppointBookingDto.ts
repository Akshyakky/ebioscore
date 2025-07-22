import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface AppointBookingDto extends BaseDto {
  abID: number;
  abFName: string;
  abLName?: string;
  abMName?: string;
  hplID: number;
  providerName: string;
  rlID: number;
  rlName: string;
  arlID?: number;
  arlName?: string;
  abDuration: number;
  abDurDesc: string;
  abDate: Date;
  abTime: Date;
  pChartID?: number;
  pChartCode?: string;
  abPType: string;
  abStatus: string;
  appPhone1?: string;
  appPhone2?: string;
  patRegisterYN: string;
  otBookNo: number;
  atID?: number;
  atName?: string;
  pNatID?: number;
  pNatName?: string;
  patOPIP: string;
  admitID?: number;
  wNameID?: number;
  wName?: string;
  wCatID?: number;
  wCatName?: string;
  roomID?: number;
  roomName?: string;
  bedID?: number;
  bedName?: string;
  crID?: number;
  crName?: string;
  abEndTime: Date;
  procNotes?: string;
  arlInstructions?: string;
  abTitle?: string;
  cancelReason?: string;
  city?: string;
  dob?: Date;
  email?: string;
  pChartCompID?: number;
  rSchdleID?: number;
  rschdleBy?: string;
  pssnId?: string;
  intIdPsprt?: string;
  oldPChartID?: number;
}

export interface AppointmentFilterDto {
  hplID?: number;
  startDate?: Date;
  endDate?: Date;
  pChartID?: number;
  abStatus?: string;
  providerName?: string;
  patientName?: string;
}

export interface CancelAppointmentDto {
  appointmentId: number;
  cancelReason: string;
}

export interface ContactMastDto extends BaseDto {
  conID: number;
  conFName: string;
  conLName?: string;
  conMName?: string;
  isAppointmentYN: string;
  // Add other contact properties as needed
}

// Appointment status options
export const APPOINTMENT_STATUS_OPTIONS = [
  { value: "Scheduled", label: "Scheduled" },
  { value: "Confirmed", label: "Confirmed" },
  { value: "InProgress", label: "In Progress" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" },
  { value: "NoShow", label: "No Show" },
];

// Patient type options
export const PATIENT_TYPE_OPTIONS = [
  { value: "OP", label: "Outpatient" },
  { value: "IP", label: "Inpatient" },
  { value: "ER", label: "Emergency" },
];

// Duration description options
export const DURATION_OPTIONS = [
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "1 hour" },
  { value: "90", label: "1.5 hours" },
  { value: "120", label: "2 hours" },
];
