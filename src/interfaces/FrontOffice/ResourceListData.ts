import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface ResourceListData extends BaseDto {
  rLID: number;
  rLCode: string;
  rLName: string;
  rActiveYN: string;
  rNotes: string;
  rLValidateYN: string;
  rLOtYN: string;
  transferYN?: string;
}
