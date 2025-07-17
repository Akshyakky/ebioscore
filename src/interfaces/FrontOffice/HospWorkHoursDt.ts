// src/interfaces/FrontOffice/HospWorkHoursDto.ts
export interface HospWorkHoursDto {
  hwrkID: number;
  langType: string;
  daysDesc: string;
  startTime: Date | null;
  endTime: Date | null;
  wkHoliday: string;
  rActiveYN: string;
  rNotes?: string;
  transferYN: string;
}

export interface WorkHoursFilterDto {
  langType?: string;
  daysDesc?: string;
  wkHoliday?: string;
  status?: string;
}

// Language and day options for dropdowns
export const LANGUAGE_OPTIONS = [
  { value: "EN", label: "English" },
  { value: "AR", label: "Arabic" },
  { value: "FR", label: "French" },
  { value: "ES", label: "Spanish" },
  { value: "GR", label: "Greek" },
];

export const DAY_OPTIONS = [
  { value: "SUNDAY", label: "Sunday" },
  { value: "MONDAY", label: "Monday" },
  { value: "TUESDAY", label: "Tuesday" },
  { value: "WEDNESDAY", label: "Wednesday" },
  { value: "THURSDAY", label: "Thursday" },
  { value: "FRIDAY", label: "Friday" },
  { value: "SATURDAY", label: "Saturday" },
];

export const HOLIDAY_OPTIONS = [
  { value: "Y", label: "Yes" },
  { value: "N", label: "No" },
];

export const STATUS_OPTIONS = [
  { value: "Y", label: "Active" },
  { value: "N", label: "Inactive" },
];
