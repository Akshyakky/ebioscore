import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface BPayTypeDto extends BaseDto {
  payID: number;
  payCode: string;
  payName: string;
  payMode: string;
  bankCharge: number;
  rNotes: string;
  rActiveYN: string;
  transferYN: string;
}
