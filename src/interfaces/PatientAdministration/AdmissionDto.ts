import { RecordFields } from "../Common/RecordFields";

export interface IPAdmissionDto extends RecordFields {
  admitID: number;
  admitCode: string;
  pChartID: number;
  pChartCode: string;
  oPIPCaseNo?: number;
  patOPIP: string;
  attendingPhyID?: number;
  attendingPhyName: string;
  primaryPhyID?: number;
  primaryPhyName: string;
  primaryRefferalSourceID?: number;
  primaryRefferalSourceName: string;
  secondaryRefferalSourceID?: number;
  secondaryRefferalSourceName: string;
  admitDate: Date;
  admitStatus: string;
  provDiagnosisYN?: "Y" | "N";
  insuranceYN: "Y" | "N";
  ipStatus: string;
  dischargeAdviceYN: "Y" | "N";
  nurseIns?: string;
  clerkIns?: string;
  pTitle: string;
  patientIns?: string;
  acApprovedBy?: string;
  acApprovedId?: number;
  acReason?: string;
  caseTypeID?: number;
  caseTypeName: string;
  deliveryCaseYN: "Y" | "N";
  deptID?: number;
  deptName: string;
  pChartCompId?: number;
  attndPhySpecialtyId?: number;
  attndPhySpecialty?: string;
  primPhySpecialtyId?: number;
  primPhySpecialty?: string;
  pfName: string;
  plName: string;
  pmName: string;
  oldPChartID: number;
  visitGesy: string;
  dulId: number;
  advisedVisitNo: number;
  pTypeID: number;
  pTypeName: number;
  patNokID: number;
}

export interface IPAdmissionDetailsDto extends RecordFields {
  adID: number;
  pChartID: number;
  admitID: number;
  wCatID: number;
  wCatCode?: string;
  wCatName: string;
  wNameID?: number;
  wNameCode?: string;
  wName?: string;
  rlID: number;
  rlCode?: string;
  rName: string;
  bedID: number;
  bedName: string;
  bStatus: string;
  transFromDate?: Date;
  transToDate?: Date;
  plannedProc?: string;
  admissionType?: string;
  patientStatus?: string;
  advPhyID?: number;
  advPhyName?: string;
  treatPhyID?: number;
  treatPhyName?: string;
  facID?: number;
  facName?: string;
  bStatusValue: string;
  patientStatusValue?: string;
  admitCode?: string;
  pChartCode?: string;
  pChartIDCompID?: number;
  roomLocation?: string;
  treatingPhySpecialty?: string;
  treatingSpecialtyID?: number;
  oldPChartID: number;
}

export interface WrBedDetailsDto extends RecordFields {
  bedDetID?: number;
  bedID?: number;
  bedName?: string;
  bedStatusValue?: string;
  bedDeptID?: number;
  rlID?: number;
  rName?: string;
  rGrpID?: number;
  rGrpName?: string;
  pChartID?: number;
  pChartCode?: string;
  pTitle?: string;
  pfName?: string;
  patDeptID?: number;
  adID?: number;
  admitID?: number;
  admitDate?: Date;
  tin?: Date;
  tout?: Date;
  dischgID?: number;
  dischgDate?: Date;
  transactionType?: string;
  isChildYN?: "Y" | "N";
  isBoApplicableYN?: "Y" | "N";
  oldPChartID?: number;
}

export interface AdmissionDto {
  IPAdmissionDto: IPAdmissionDto;
  IPAdmissionDetailsDto: IPAdmissionDetailsDto;
  WrBedDetailsDto: WrBedDetailsDto;
}
