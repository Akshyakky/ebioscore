// src/interfaces/ClinicalManagement/BaseHistoryDto.ts
import { RecordFields } from "../Common/RecordFields";

export interface BaseHistoryDto extends RecordFields {
  opipNo: number;
  opvID: number;
  pChartID: number;
  opipCaseNo: number;
  patOpip: string;
  oldPChartID: number;
}
