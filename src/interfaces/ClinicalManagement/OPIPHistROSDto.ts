// src/interfaces/ClinicalManagement/OPIPHistROSDto.ts
import { BaseDto } from "../../services/GenericEntityService/GenericEntityService";

export interface OPIPHistROSDto extends BaseDto {
  opipRosID: number;
  opipNo: number;
  opvID: number;
  PChartID: number;
  opipCaseNo: number;
  patOpip: string;
  opipRosDate: Date;
  opipRosDesc: string;
  opipRosNotes?: string;
  oldPChartID: number;
}
