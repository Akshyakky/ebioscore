export interface RegistrationFormErrors {
  firstName?: string;
  lastName?: string;
  pChartCode?: string;
  registrationDate?: string;
  paymentSource?: string;
  mobileNumber?: string;
  title?: string;
  indetityNo?: string;
  gender?: string;
  dateOfBirth?: string;
  department?: string;
  attendingPhysician?: string;
  primaryIntroducingSource?: string;
}
export interface PatientSearchResult {
  pChartID: number;
  pChartCode: string;
  pDob: string;
  pFName: string;
  pLName: string;
  pTitle: string;
  pAddPhone1: string;
  pRegDate: string;
  pGender: string;
  pssnID: string;
  pTypeName: string;
}

export interface PatientDemographicDetails {
  pChartCode: string;
  patientName: string;
  gender: string;
  dateOfBirthOrAge: string;
  patientType: string;
  patientPaymentSource: string;
  pBldGrp: string;
  mobileNumber: string;
}
