// src/interfaces/ClinicalManagement/MedicationFrequencyDto.ts

import { BaseDto } from "../../services/GenericEntityService/GenericEntityService";

export interface MedicationFrequencyDto extends BaseDto {
  mfrqId: number;
  mfrqCode: string;
  mfrqName: string;
  modifyYn: string;
  defaultYn: string;
  rActiveYN: string;
  compID: number;
  compCode: string;
  compName: string;
  transferYN: string;
  rNotes: string;
}
