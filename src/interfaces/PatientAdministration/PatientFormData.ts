export interface PatRegistersDto {
  pChartID: number;
  pChartCode: string;
  pRegDate: string;
  pTitleVal?: string;
  pTitle: string;
  pFName?: string;
  pMName?: string;
  pLName?: string;
  pDobOrAgeVal: string;
  pDobOrAge: string;
  pDob: string;
  pAgeType?: string;
  pApproxAge?: number;
  pGenderVal?: string;
  pGender: string;
  pssnID?: string;
  pBldGrp?: string;
  compID?: number;
  compCode?: string;
  compName?: string;
  rActiveYN: string;
  rNotes?: string;
  pTypeID?: number;
  pTypeCode?: string;
  pTypeName?: string;
  pFhName?: string;
  fatherBldGrp?: string;
  sapID?: string;
  patMemID?: number;
  patMemName?: string;
  patMemDescription?: string;
  patMemSchemeExpiryDate: string;
  patSchemeExpiryDateYN?: string;
  patSchemeDescriptionYN?: string;
  cancelReason?: string;
  cancelYN?: string;
  consultantID: number;
  consultantName?: string;
  deptID?: number;
  deptName?: string;
  facultyID?: number;
  faculty?: string;
  langType?: string;
  pChartCompID?: number;
  pExpiryDate?: Date;
  regTypeVal?: string;
  physicianRoom?: string;
  regType?: string;
  sourceID: number;
  sourceName?: string;
  pPob?: string;
  patCompNameVal?: string;
  patCompName?: string;
  patDataFormYN?: string;
  intIdPsprt?: string;
  transferYN?: string;
}

export interface PatAddressDto {
  pAddID: number;
  pChartID: number;
  pChartCode: string;
  pAddType: string;
  pAddMailVal?: string;
  pAddMail?: string;
  pAddSMSVal?: string;
  pAddSMS?: string;
  pAddEmail?: string;
  pAddStreet?: string;
  pAddStreet1?: string;
  pAddCityVal?: string;
  pAddCity?: string;
  pAddState?: string;
  pAddPostcode?: string;
  pAddCountryVal?: string;
  pAddCountry?: string;
  pAddPhone1?: string;
  pAddPhone2?: string;
  pAddPhone3?: string;
  pAddWorkPhone?: string;
  compCode?: string;
  compID?: number;
  compName?: string;
  pAddActualCountryVal?: string;
  pAddActualCountry?: string;
  patAreaVal?: string;
  patArea?: string;
  patDoorNo?: string;
  pChartCompID?: number;
}

export interface PatOverviewDto {
  patOverID: number;
  pChartID: number;
  pChartCode: string;
  pPhoto?: string;
  pMaritalStatus?: string;
  pReligion?: string;
  pEducation?: string;
  pOccupation?: string;
  pEmployer?: string;
  pAgeNumber: number;
  pAgeDescription?: string;
  pAgeDescriptionVal?: string;
  ethnicity?: string;
  pCountryOfOrigin?: string;
  compID?: number;
  compCode?: string;
  compName?: string;
  pChartCompID?: number;
  transferYN: string;
}

export interface OpvisitDto {
  visitTypeVal: string;
  visitType: string;
}

export interface PatientRegistrationDto {
  patRegisters: PatRegistersDto;
  patAddress: PatAddressDto;
  patOverview: PatOverviewDto;
  opvisits: OpvisitDto;
}
