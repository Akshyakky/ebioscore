export interface AdmissionHistoryDto {
  serialNumber: number;
  admitID: number;
  admitCode: string;
  admitDate: Date;
  attendingPhysicianName: string;
  speciality: string;
  bedCategory: string;
  wardName: string;
  roomName: string;
  bedName: string;
  dischargeDate: Date | null;
  status: string;
}
