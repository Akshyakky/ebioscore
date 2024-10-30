// src/interfaces/ClinicalManagement/PastMedicationDto.ts

import { BaseDto } from "../../services/GenericEntityService/GenericEntityService";
import { BaseHistoryDto } from "./BaseHistoryDto";

export interface PastMedicationDto extends BaseHistoryDto {
  opipPastMedID: number;
  opipDate: Date;
  details: PastMedicationDetailDto[];
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
