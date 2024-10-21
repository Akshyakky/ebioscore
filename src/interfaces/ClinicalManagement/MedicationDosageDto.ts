// src/interfaces/ClinicalManagement/MedicationDosageDto.ts

import { BaseDto } from "../../services/GenericEntityService/GenericEntityService";

export interface MedicationDosageDto extends BaseDto {
  mdId: number;
  mdCode: string;
  mdName: string;
  modifyYn: string;
  defaultYn: string;
  rActiveYN: string;
  compID: number;
  compCode: string;
  compName: string;
  transferYN: string;
  rNotes: string;
}
