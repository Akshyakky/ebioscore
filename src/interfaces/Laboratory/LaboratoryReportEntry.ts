export interface LabRegisterData {
  labRegNo: number;
  patientFullName: string;
  patientUHID: string;
  patientStatus: string;
  patientRefCode: string;
  labRegisterDate: string;
  referralDoctor: string;
  sampleStatus: "Pending" | "Partially Collected" | "Collected" | "Rejected";
  wardName: string;
  roomName: string;
  bedName: string;
  comments: string;
  investigationCount: number;
  invSamplePendingCount: number;
  invSampleCollectedCount: number;
  billedBy: string;
}

export interface GetLabRegistersListDto {
  labRegister: LabRegisterData;
}

export interface InvStatusResponseDto {
  LabRegNo: number;
  ServiceTypeID: number;
  investigationName: string;
  sampleStatus: "Pending" | "Partially Collected" | "Collected" | "Rejected";
  investigationId: number;
  sampleType: string;
  investigationCode: string;
}

export interface SampleStatusUpdateRequestDto {
  LabRegNo: number;
  ServiceTypeID: number;
  InvestigationID: number;
  SampleCollectionStatus: "Pending" | "Collected" | "Rejected";
  SampleCollectionDate: Date;
  SampleRejectionReason: string;
}

//

export interface LabEnterResultDto {
  labRegNo: number;
  serviceTypeId: number;
  technicianId?: number;
  technicianName?: string;
  isTechnicianApproved?: boolean;
  labConsultantId?: number;
  labConsultantName?: string;
  isLabConsultantApproved?: boolean;
  departmentId: number;
  departmentName: string;
  results: LabResultItemDto[];
}

export interface LabResultItemDto {
  investigationId: number;
  investigationCode: string;
  investigationName: string;
  remarks?: string;
  printOrder: number;
  componentResults?: ComponentResultDto[];
}
export interface ComponentResultDto {
  componentId: number;
  componentCode: string;
  componentName: string;
  patuentValue: string;
  unit?: string;
  status: "Normal" | "Abnormal";
  resultTypeId: 1 | 2 | 3 | 4 | 5 | 6 | 7; // 1: Single Line Alphanumeric, 2: Single Line Numeric, 3: Multi Line, 4: Multiple Selection, 5: Reference Values, 6: Template Values
  resultTypeName: string;
  resultUnit?: string;
  referenceRange?: ReferenceRangeDto;
  resultStatus: "Normal" | "Abnormal";
  comments?: string;
  interpretation?: string;
  order?: number;
  mainGroupId?: number;
  mainGroupName?: string;
  subTitleId?: number;
  subTitleName?: string;
  remarks?: string;
}
export interface ReferenceRangeDto {
  lowerValue?: number;
  UpperValue?: number;
  referenceRange?: string;
  normal?: string;
}
