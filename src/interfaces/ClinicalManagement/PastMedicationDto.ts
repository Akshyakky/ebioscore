// src/interfaces/ClinicalManagement/PastMedicationDto.ts

import { BaseDto } from "../../services/GenericEntityService/GenericEntityService";

export interface PastMedicationDto extends BaseDto {
  opipPastMedID: number;
  opipNo: number;
  pChartID: number;
  opvID: number;
  opipCaseNo: number;
  patOpip: string;
  opipDate: Date;
  details: PastMedicationDetailDto[];
  rActiveYN: string;
  compID: number;
  compCode: string;
  compName: string;
  transferYN: string;
  rNotes: string;
}

export interface PastMedicationDetailDto extends BaseDto {
  opipPastMedDtlID: number;
  opipPastMedID: number;
  mfID: number;
  mfName: string;
  mGenID: number;
  mGenCode: string;
  mGenName: string;
  mlID: number;
  medText: string;
  mdID: number | null;
  mdName: string;
  mFrqID: number | null;
  mFrqName: string;
  mInsID: number | null;
  mInsName: string;
  fromDate: Date | null;
  toDate: Date | null;
  rActiveYN: string;
  compID: number;
  compCode: string;
  compName: string;
  transferYN: string;
  rNotes: string;
}
