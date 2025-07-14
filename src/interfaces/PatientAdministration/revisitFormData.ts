import { RecordFieldsWithPhysician } from "../Common/PhysicianReferralFields";

type YesNo = "Y" | "N";
export interface OPVisitDto extends RecordFieldsWithPhysician {
  opVID: number;
  pChartID: number;
  pChartCode: string;
  pVisitDate: Date;
  patOPIP: string;
  pVisitStatus: string;
  pVisitType: string;
  pVisitTypeText?: string;
  pTypeID?: number;
  pTypeCode?: string;
  pTypeName?: string;
  crossConsultation?: YesNo;
  deptID?: number;
  deptName?: string;
  opNumber?: string;
  pChartCompID?: number;
  refFacultyID?: number;
  refFaculty?: string;
  oldPChartID: number;
  attendingPhysicianName: string;
}

export interface GetPatientVisitHistory {
  visitDate: string;
  visitType: string;
  modifiedBy: string;
  departmentName: string;
  attendingPhysicianName: string;
  typeName: string;
  facName: string;
}
export interface RevisitFormErrors {
  pChartCode?: string;
  pTypeID?: string;
  deptID?: string;
  attndPhyID?: string;
  primPhyID?: string;
  attendingPhysicianName?: string;
  attendingPhysicianSpecialtyId?: string;
  attendingPhysicianSpecialty?: string;
}

export enum DateFilterType {
  Today = "Today",
  LastOneWeek = "LastOneWeek",
  LastOneMonth = "LastOneMonth",
  LastThreeMonths = "LastThreeMonths",
  Custom = "Custom",
}

export interface GetPatientAllVisitHistory {
  opVID: number;
  opNumber: string;
  pVisitDate: string;
  pVisitType: string;
  patOPIP: string;
  opipNo: number;
  opipCaseNo: number;
}
