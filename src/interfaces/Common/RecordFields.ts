import { BaseDto } from "../../services/GenericEntityService/GenericEntityService";

export interface RecordFields extends BaseDto {
  compID: number;
  compCode: string;
  compName: string;
  rActiveYN: string;
  transferYN: string;
  rNotes: string;
}
