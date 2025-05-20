import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface RecordFields extends BaseDto {
  rActiveYN: string;
  transferYN: string;
  rNotes: string;
}
