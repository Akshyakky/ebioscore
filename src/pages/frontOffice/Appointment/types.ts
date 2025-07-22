export interface AppointmentData {
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
  abEndTime: Date;
  pChartID?: number;
  pChartCode?: string;
  abPType: string;
  abStatus: string;
  appPhone1?: string;
  appPhone2?: string;
  patRegisterYN: string;
  cancelReason?: string;
  procNotes?: string;
}

export interface BreakData {
  bLID: number;
  bLName: string;
  bLStartTime: Date;
  bLEndTime: Date;
  bLStartDate: Date;
  bLEndDate: Date;
  hPLID: number;
  assignedName: string;
  isPhyResYN: string;
  rActiveYN: string;
}

export interface WorkHoursData {
  hwrkID: number;
  langType: string;
  daysDesc: string;
  startTime: Date | null;
  endTime: Date | null;
  wkHoliday: string;
  rActiveYN: string;
}

export interface BookingFormData {
  patientSearch: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  provider: string;
  resource: string;
  appointmentDate: Date;
  appointmentTime: string;
  duration: number;
  notes: string;
}

export interface TimeSlot {
  time: string;
  hour: number;
  minute: number;
}

export interface AppointmentLayout {
  appointment: AppointmentData;
  column: number;
  totalColumns: number;
}
