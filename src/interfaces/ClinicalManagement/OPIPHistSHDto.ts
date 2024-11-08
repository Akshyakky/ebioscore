import { BaseHistoryDto } from "./BaseHistoryDto";

// src/interfaces/ClinicalManagement/OPIPHistSHDto.ts
export interface OPIPHistSHDto extends BaseHistoryDto {
  opipSHID: number;
  opipSHDate: Date;
  opipSHDesc: string;
  opipSHNotes?: string;
}
