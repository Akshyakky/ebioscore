export interface PatientDemoGraph {
  pChartID: number;
  pChartCode: string;
  pTitleVal: string;
  pTitle: string;
  pfName: string;
  plName: string;
  pDob: Date;
  pGender: string;
  pGenderVal: string;
  pBldGrp: string;
  pTypeID: number;
  pTypeName: string;
  pRegDate: Date;
  indentityType: string;
  indentityValue: string;
  intIdPsprt: string;
  pAddStreet: string;
  patArea: string;
  patAreaVal: string;
  pAddCity: string;
  pAddCityVal: string;
  pAddActualCountry: string;
  pAddActualCountryVal: string;
  pAddPhone1: string;
  pAddEmail: string;
  PrimaryReferralSourceName: string;
}

export interface PatientDemoGraphError {
  pChartCode?: string;
  pTitleVal?: string;
  pfName?: string;
  plName?: string;
  dob?: string;
  pGenderVal?: string;
  pTypeID?: string;
  indentityValue?: string;
  pAddPhone1?: string;
}
