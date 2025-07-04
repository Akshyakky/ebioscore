// src/interfaces/ClinicalManagement/AllergyDto.ts
import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";
import { RecordFields } from "../Common/RecordFields";
import { BaseHistoryDto } from "./BaseHistoryDto";

export interface AllergyDto extends BaseDto {
  allergyMastDto: OPIPHistAllergyMastDto;
  details?: OPIPHistAllergyDetailDto[];
}

export interface OPIPHistAllergyMastDto extends BaseHistoryDto {
  opipAlgId?: number;
  opipDate: Date;
}

export interface OPIPHistAllergyDetailDto extends RecordFields {
  opipAlgDetailId: number;
  opipAlgId: number;
  mfId: number;
  mfName: string;
  mlId: number;
  medText: string;
  mGenId: number;
  mGenCode?: string;
  mGenName: string;
}
