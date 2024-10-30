// src/interfaces/ClinicalManagement/OPIPHistPMHDto.ts
import { BaseHistoryDto } from "./BaseHistoryDto";

export interface OPIPHistPMHDto extends BaseHistoryDto {
  opippmhId: number;
  opippmhDate: Date;
  opippmhDesc: string;
  opippmhNotes?: string;
}
