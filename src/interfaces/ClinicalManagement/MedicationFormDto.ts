import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface MedicationFormDto extends BaseDto {
  mFID: number;
  mFCode?: string;
  mFName: string;
  modifyYN: string;
  defaultYN: string;
  rActiveYN: string;
  transferYN: string;
  rNotes?: string;
  mFSnomedCode?: string;
}
