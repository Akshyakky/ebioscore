export interface AdmissionDto {
  // IPAdmission properties
  admitID?: number;
  pChartID: number;
  oPIPCaseNo?: number;
  patOPIP: string;
  admitPhyID?: number;
  admitPhyName?: string;
  admitDate: Date;
  admitStatus: string;
  pMLCID?: number;
  provDiagnosisYN?: string;
  insuranceYN: string;
  ipStatus: string;
  dischargeAdviceYN: string;
  nurseIns?: string;
  clerkIns?: string;
  pTitle: string;
  patientIns?: string;
  acApprovedBy?: string;
  acApprovedId?: number;
  acReason?: string;
  admitCode?: string;
  caseTypeID?: number;
  caseTypeName?: string;
  deliveryCaseYN: string;
  deptID?: number;
  deptName?: string;
  pChartCompId?: number;
  primPhySpecialtyId?: number;
  primPhySpecialty?: string;
  reffPhySpecialtyId?: number;
  reffPhySpecialty?: string;
  pChartCode: string;
  pfName: string;
  plName: string;
  pmName?: string;
  refSourceId2?: number;
  refSource2?: string;
  oldPChartID: number;
  visitGesy?: string;
  dulId: number;
  advisedVisitNo: number;

  // WrBedDetails properties
  bedDetID?: number;
  bedID?: number;
  bedName?: string;
  bedStatusValue?: string;
  bedDeptID?: number;
  rlID?: number;
  rName?: string;
  rGrpID?: number;
  rGrpName?: string;
  patDeptID?: number;
  adID?: number;
  tin?: Date;
  tout?: Date;
  dischgID?: number;
  dischgDate?: Date;
  transactionType?: string;
  isChildYN?: string;
  isBoApplicableYN?: string;

  // RecordFields properties
  rActiveYN: string;
  compID: number;
  compCode: string;
  compName: string;
  transferYN: string;
  rNotes?: string;
}
