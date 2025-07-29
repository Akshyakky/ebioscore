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
