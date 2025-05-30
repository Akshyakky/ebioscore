import { BaseDto } from "../../services/GenericEntityService/GenericEntityService";
export interface IpDischargeDetailsDto extends BaseDto {
  dischgDetID: number;
  dischgID: number;
  dchNotes?: string;
  admitDate: Date;
  AdviceOnDischarge?: string;
  birthHistory?: string;
  cheifCompliant?: string;
  conditionOnDischarge?: string;
  consultantID: number;
  specialityID: number;
  speciality?: string;
  consultants?: string;
  consultant?: string;
  courseInHospital?: string;
  deliveryDet?: string;
  development?: string;
  dischgDate: Date;
  familyHistory?: string;
  finalDiagnosis?: string;
  followUp?: string;
  history?: string;
  immunisation?: string;
  intraoperativeFinding?: string;
  investigations?: string;
  localExam?: string;
  menstrualExam?: string;
  neonatalDet?: string;
  obstericHistory?: string;
  otFindings?: string;
  pastHistory?: string;
  personalHistory?: string;
  physicalExam?: string;
  postOperTreatment?: string;
  procedureDone?: string;
  reportDate: Date;
  reviewDate: Date;
  riskFactor?: string;
  systemicExam?: string;
  treatmentGiven?: string;
  vaccination?: string;
}
