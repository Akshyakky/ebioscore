import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface ResourceListData extends BaseDto {
  rLID: number;
  rLCode: string;
  rLName: string;
  rActiveYN: string;
  rCreatedOn: Date;
  rCreatedID: number;
  rCreatedBy: string;
  rModifiedOn: Date;
  rModifiedID: number;
  rModifiedBy: string;
  rNotes: string;
  rLValidateYN: string;
  rLOtYN: string;
  compID?: number;
  compCode?: string;
  compName?: string;
  transferYN?: string;
}
