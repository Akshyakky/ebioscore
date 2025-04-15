import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface ReasonListData extends BaseDto {
  arlID: number;
  arlCode: string;
  arlName: string;
  arlDuration: number;
  arlDurDesc: string;
  arlColor: number;
  rActiveYN: string;
  rCreatedOn: Date;
  rCreatedID: number;
  rCreatedBy: string;
  rModifiedOn: Date;
  rModifiedID: number;
  rModifiedBy: string;
  rNotes: string;
  compCode: string;
  compID: number;
  compName: string;
  transferYN: string;
  rlName: string;
  rlID: number;
}
