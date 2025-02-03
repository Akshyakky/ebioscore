import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface BreakConSuspendData extends BaseDto {
  bCSID: number;
  bLID: number;
  hPLID: number;
  bCSStartDate: Date;
  bCSEndDate: Date;
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
}
