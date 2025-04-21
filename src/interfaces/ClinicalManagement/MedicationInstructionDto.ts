// src/interfaces/ClinicalManagement/MedicationInstructionDto.ts

import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface MedicationInstructionDto extends BaseDto {
  minsId: number;
  minsCode: string;
  minsName: string;
  modifyYn: string;
  defaultYn: string;
  rActiveYN: string;
  transferYN: string;
  rNotes: string;
}
