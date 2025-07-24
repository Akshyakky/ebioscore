export interface LabRegisterData {
  labRegNo: number;
  patientFullName: string;
  patientUHID: string;
  patientStatus: string;
  patientRefCode: string;
  labRegisterDate: string;
  referralDoctor: string;
  sampleStatus: string;
  wardName: string;
  roomName: string;
  bedName: string;
  comments: string;
  billedBy: string;
}

export interface LabRegisterInvestigationData {
  investigationId: number;
  investigationCode: string;
  investigationName: string;
  investigationCount: number;
  serviceGroupId: number;
  serviceGroupName: string;
  sampleStatus: string;
}

export interface GetLabRegistersListDto {
  labRegister: LabRegisterData;
  labRegisterInvestigationData: LabRegisterInvestigationData[];
}
