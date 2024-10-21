// src/interfaces/ClinicalManagement/OPIPHistSHDto.ts
import { BaseDto } from "../../services/GenericEntityService/GenericEntityService";

export interface OPIPHistSHDto extends BaseDto {
  opipSHID: number;
  opipNo: number;
  opvID: number;
  pChartID: number;
  opipCaseNo: number;
  patOpip: string;
  opipSHDate: Date;
  opipSHDesc: string;
  opipSHNotes?: string;
  oldPChartID: number;
}
