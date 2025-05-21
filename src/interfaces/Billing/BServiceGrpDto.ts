import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface BServiceGrpDto extends BaseDto {
  sGrpID: number;
  sGrpCode: string;
  sGrpName: string;
  modifyYN: string;
  defaultYN: string;
  rActiveYN: string;
  rNotes: string;
  prnSGrpOrder: number;
  labServiceYN: string;
  isTherapyYN: string;
}
