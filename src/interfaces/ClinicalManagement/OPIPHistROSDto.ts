// src/interfaces/ClinicalManagement/OPIPHistROSDto.ts
import { BaseHistoryDto } from "./BaseHistoryDto";

export interface OPIPHistROSDto extends BaseHistoryDto {
  opipRosID: number;
  opipRosDate: Date;
  opipRosDesc: string;
  opipRosNotes?: string;
}
