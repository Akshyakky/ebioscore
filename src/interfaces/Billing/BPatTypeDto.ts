import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface BPatTypeDto extends BaseDto {
  pTypeID: number;
  pTypeCode: string;
  pTypeName: string;
  rActiveYN: string;
  rNotes: string;
  isInsuranceYN: string;
  transferYN: string;
}
