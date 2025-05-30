// src/interfaces/ClinicalManagement/MedicationFrequencyDto.ts

import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface MedicationFrequencyDto extends BaseDto {
  mFrqId: number;
  mFrqCode: string;
  mFrqName: string;
  modifyYN: string;
  defaultYN: string;
  rActiveYN: string;
  transferYN: string;
  rNotes: string;
  mFrqSnomedCode: string;
}
