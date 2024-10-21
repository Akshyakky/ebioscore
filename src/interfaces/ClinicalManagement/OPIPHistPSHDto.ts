// src/interfaces/ClinicalManagement/OPIPHistPSHDto.ts
import { BaseDto } from "../../services/GenericEntityService/GenericEntityService";

export interface OPIPHistPSHDto extends BaseDto {
  opipPshID: number;
  opipNo: number;
  opvID: number;
  pChartID: number;
  opipCaseNo: number;
  patOpipYn: string;
  opipPshDate: Date;
  opipPshDesc: string;
  opipPshNotes?: string;
  oldPChartID: number;
}
