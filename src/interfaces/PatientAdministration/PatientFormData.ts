import { RecordFieldsWithPhysician } from "../Common/PhysicianReferralFields";
import { OPVisitDto } from "./revisitFormData";

type YesNo = "Y" | "N";
export interface PatRegistersDto extends RecordFieldsWithPhysician {
  pChartID: number;
  pChartCode: string;
  pRegDate: Date;
  pTitleVal?: string;
  pTitle: string;
  pFName?: string;
  pMName?: string;
  pLName?: string;
  pDobOrAgeVal: string;
  pDobOrAge: string;
  pDob: Date;
  pGenderVal?: string;
  pGender: string;
  pBldGrp?: string;
  pTypeID?: number;
  pTypeCode?: string;
  pTypeName?: string;
  pFhName?: string;
  fatherBldGrp?: string;
  patMemID?: number;
  patMemName?: string;
  patMemDescription?: string;
  patMemSchemeExpiryDate: Date;
  patSchemeExpiryDateYN?: YesNo;
  patSchemeDescriptionYN?: YesNo;
  cancelReason?: string;
  cancelYN?: YesNo;
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
  pPob?: string;
  patCompNameVal?: string;
  patCompName?: string;
  patDataFormYN?: YesNo;
  intIdPsprt?: string;
  indentityType: string;
  indentityValue: string;
  patientType: string;
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
  pAddActualCountryVal?: string;
  pAddActualCountry?: string;
  patAreaVal?: string;
  patArea?: string;
  patDoorNo?: string;
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
  ethnicity?: string;
  pCountryOfOrigin?: string;
  pAgeNumber: number;
  pAgeDescriptionVal: string;
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
  lastVisit?: OPVisitDto;
}
