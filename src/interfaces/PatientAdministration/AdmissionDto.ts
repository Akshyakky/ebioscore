import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";
import { RecordFieldsWithPhysician } from "../Common/PhysicianReferralFields";
import { RecordFields } from "../Common/RecordFields";
type YesNo = "Y" | "N";
export interface IPAdmissionDto extends RecordFieldsWithPhysician {
  admitID: number;
  admitCode: string;
  pChartID: number;
  pChartCode: string;
  oPIPCaseNo: number;
  opipNo: number;
  patOPIP: string;
  admitDate: Date;
  admitStatus: string;
  provDiagnosisYN?: YesNo;
  insuranceYN: YesNo;
  ipStatus: string;
  dischargeAdviceYN: YesNo;
  nurseIns?: string;
  clerkIns?: string;
  pTitle: string;
  patientIns?: string;
  acApprovedBy?: string;
  acApprovedId?: number;
  acReason?: string;
  caseTypeCode: string;
  caseTypeName: string;
  deliveryCaseYN: YesNo;
  deptID?: number;
  deptName: string;
  pChartCompId?: number;
  pfName: string;
  plName: string;
  pmName: string;
  oldPChartID: number;
  visitGesy: string;
  dulId: number;
  advisedVisitNo: number;
  pTypeID: number;
  pTypeName: string;
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

export interface AdmissionDto extends BaseDto {
  ipAdmissionDto: IPAdmissionDto;
  ipAdmissionDetailsDto: IPAdmissionDetailsDto;
  wrBedDetailsDto: WrBedDetailsDto;
}
