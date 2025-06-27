// src/interfaces/ClinicalManagement/PastMedicationDto.ts

import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";
import { BaseHistoryDto } from "./BaseHistoryDto";

export interface PastMedicationDto {
  pastMedicationMastDto: PastMedicationMastDto;
  details: PastMedicationDetailDto[];
}

export interface PastMedicationMastDto extends BaseHistoryDto {
  opipPastMedID: number;
  opipDate: Date;
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
  mdID: number;
  mdName: string;
  mFrqID: number;
  mFrqName: string;
  mInsID: number;
  mInsName: string;
  fromDate: Date;
  toDate: Date;
}
