// src/interfaces/ClinicalManagement/MedicationDosageDto.ts

import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface MedicationDosageDto extends BaseDto {
  mDId: number;
  mDCode: string;
  mDName: string;
  modifyYN: string;
  defaultYN: string;
  rActiveYN: string;
  transferYN: string;
  rNotes: string;
  mDSnomedCode: string;
}
