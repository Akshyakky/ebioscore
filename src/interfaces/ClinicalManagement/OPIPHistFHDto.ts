// src/interfaces/ClinicalManagement/OPIPHistFHDto.ts
import { BaseDto } from "../../services/GenericEntityService/GenericEntityService";

export interface OPIPHistFHDto extends BaseDto {
  opipFHID: number;
  opipNo: number;
  opvID: number;
  pChartID: number;
  opipCaseNo: number;
  patOpip: string;
  opipFHDate: Date;
  opipFHDesc?: string;
  opipFHNotes?: string;
  oldPChartID: number;
}
