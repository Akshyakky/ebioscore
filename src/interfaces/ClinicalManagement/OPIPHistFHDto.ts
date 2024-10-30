import { BaseHistoryDto } from "./BaseHistoryDto";

// src/interfaces/ClinicalManagement/OPIPHistFHDto.ts
export interface OPIPHistFHDto extends BaseHistoryDto {
  opipFHID: number;
  opipFHDate: Date;
  opipFHDesc: string;
  opipFHNotes?: string;
}
