import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface ReasonListData extends BaseDto {
  arlID: number;
  arlCode: string;
  arlName: string;
  arlDuration: number;
  arlDurDesc: string;
  arlColor: number;
  rActiveYN: string;
  rNotes: string;
  transferYN: string;
  rlName: string;
  rlID: number;
}
