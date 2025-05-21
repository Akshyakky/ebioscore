// src/interfaces/PatientAdministration/BedTransferRequestDto.ts
export interface BedTransferRequestDto {
  // Transfer Details
  admitID: number;
  pChartID: number;
  pChartCode: string;
  // New Bed Details
  bedID: number;
  bedName: string;
  rlID: number;
  rName: string;
  rGrpID: number;
  rGrpName: string;
  // New Physician Details
  treatPhyID: number;
  treatPhyName: string;
  treatingSpecialtyID: number;
  treatingPhySpecialty: string;
  // Audit Fields
  reasonForTransfer: string;
  transferDate: string;
  rNotes: string;
}
