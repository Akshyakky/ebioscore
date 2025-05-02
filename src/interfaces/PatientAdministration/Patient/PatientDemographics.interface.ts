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
  pTitleVal: string;
  pTitle?: string;
  pGender?: string;
  pGenderVal: string;
  dob?: Date | string;
  pAddPhone1?: string;
  pAddEmail?: string;
  pAddStreet?: string;
  patArea?: string;
  patAreaVal: string;
  pAddCity?: string;
  pAddCityVal: string;
  pAddActualCountry?: string;
  pAddActualCountryVal: string;
  indentityType?: string;
  indentityValue?: string;
  pTypeID: number;
  pTypeName: string;
  pRegDate: Date;
  intIdPsprt: string;
  PrimaryReferralSourceName: string;
}
