export interface PatientDemoGraph {
  pChartID: number;
  pChartCode: string;
  pTitleVal: string;
  pTitle: string;
  pfName: string;
  plName: string;
  dob: string;
  pGender: string;
  pGenderVal: string;
  pBldGrp: string;
  pTypeID: number;
  pTypeName: string;
  pRegDate: string;
  pssnID: string;
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
  refSource: string;
}

export interface PatientDemoGraphError {
  pChartCode?: string;
  pTitleVal?: string;
  pfName?: string;
  plName?: string;
  dob?: string;
  pGenderVal?: string;
  pTypeID?: string;
  pssnID?: string;
  pAddPhone1?: string;
}
