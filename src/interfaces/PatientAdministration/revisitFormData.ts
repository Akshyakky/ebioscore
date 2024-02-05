export interface revisitFormData {
  opVID: number;
  pChartID: number;
  pVisitDate: string;
  patOPIP: string;
  attndPhyID: number;
  attendingPhysicianName: string;
  refSourceID: number;
  refSource: string;
  primPhyID: number;
  primaryPhysicianName: string;
  pVisitStatus: string;
  pVisitType: string;
  pVisitTypeText: string;
  rActiveYN: string;
  rCreatedID: number;
  rCreatedBy: string;
  rCreatedOn: string;
  rModifiedID: number;
  rModifiedBy: string;
  rModifiedOn: string;
  rNotes: string;
  pTypeID: number;
  pTypeCode: string;
  pTypeName: string;
  compID: number;
  compCode: string;
  compName: string;
  crossConsultation: string;
  deptID: number;
  deptName: string;
  opNumber: string;
  pChartCode: string;
  pChartCompID: number;
  refFacultyID: number;
  refFaculty: string;
  sourceID: number;
  source: string;
  refSourceID2: number;
  refSource2: string;
  oldPChartID: number;
  transferYN: string;
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
  // Add other fields as needed
}
