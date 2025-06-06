import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface MedicationGenericDto extends BaseDto {
  mGenID: number;
  mGenCode?: string;
  mGenName: string;
  modifyYN: string;
  defaultYN: string;
  rActiveYN: string;
  transferYN: string;
  rNotes?: string;
  mGSnomedCode?: string;
}
