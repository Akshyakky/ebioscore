export interface LabRegisterData {
  labRegNo: number;
  patientFullName: string;
  patientUHID: string;
  patientStatus: string;
  patientRefCode: string;
  labRegisterDate: string;
  referralDoctor: string;
  sampleStatus: "Pending" | "Collected" | "Rejected";
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
