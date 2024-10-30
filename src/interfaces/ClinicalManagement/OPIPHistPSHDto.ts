// src/interfaces/ClinicalManagement/OPIPHistPSHDto.ts
import { BaseHistoryDto } from "./BaseHistoryDto";

export interface OPIPHistPSHDto extends BaseHistoryDto {
  opipPshID: number;
  opipPshDate: Date;
  opipPshDesc: string;
  opipPshNotes?: string;
}
