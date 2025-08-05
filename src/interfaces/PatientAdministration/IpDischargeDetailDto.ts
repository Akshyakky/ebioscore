import { BaseDto } from "../../services/GenericEntityService/GenericEntityService";
export interface IpDischargeDetailDto extends BaseDto {
  dischgDetID: number;
  dischgID: number;
  dchNotes?: string | null;
  admitDate: string; // ISO date string
  adviceOnDischarge?: string | null;
  birthHistory?: string | null;
  cheifCompliant?: string | null;
  conditionOnDischarge?: string | null;
  consultantID: number;
  specialityID: number;
  speciality?: string | null;
  consultants?: string | null;
  consultant?: string | null;
  courseInHospital?: string | null;
  deliveryDet?: string | null;
  development?: string | null;
  dischgDate: string; // ISO date string
  familyHistory?: string | null;
  finalDiagnosis?: string | null;
  followUp?: string | null;
  history?: string | null;
  immunisation?: string | null;
  intraoperativeFinding?: string | null;
  investigations?: string | null;
  localExam?: string | null;
  menstrualExam?: string | null;
  neonatalDet?: string | null;
  obstericHistory?: string | null;
  otFindings?: string | null;
  pastHistory?: string | null;
  personalHistory?: string | null;
  physicalExam?: string | null;
  postOperTreatment?: string | null;
  procedureDone?: string | null;
  reportDate: string; // ISO date string
  reviewDate: string; // ISO date string
  riskFactor?: string | null;
  systemicExam?: string | null;
  treatmentGiven?: string | null;
  vaccination?: string | null;
}
