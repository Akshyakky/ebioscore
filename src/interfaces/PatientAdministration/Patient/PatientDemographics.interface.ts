// src/interfaces/Patient/PatientDemographics.interface.ts
export interface PatientDemographicsData {
  pChartID?: number;
  pChartCode?: string;
  patientName?: string;
  gender?: string;
  dateOfBirthOrAge?: string;
  pBldGrp?: string;
  mobileNumber?: string;
  patientType?: string;
  patientPaymentSource?: string;
  pfName?: string;
  plName?: string;
  pTitle?: string;
  pGender?: string;
  dob?: Date | string;
  pAddPhone1?: string;
  pAddEmail?: string;
  pAddStreet?: string;
  patArea?: string;
  pAddCity?: string;
  pAddActualCountry?: string;
  indentityType?: string;
  indentityValue?: string;
}
