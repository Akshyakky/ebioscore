import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface BPatTypeDto extends BaseDto {
  pTypeID: number;
  pTypeCode: string;
  pTypeName: string;
  isInsuranceYN: string;
  rActiveYN: string;
  rNotes: string;
  transferYN: string;
}
