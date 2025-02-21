import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface LTemplateGroupDto extends BaseDto {
  tGroupID: number;
  tRgpCode?: string;
  tGroupName?: string;
  modifyYN: string;
  defaultYN: string;
  rActiveYN: string;
  compID: number;
  compCode: string;
  compName: string;
  transferYN: string;
  rNotes?: string;
  rCreatedOn?: Date;
  rModifiedOn?: Date;
  rModifiedBy?: string;
  rCreatedIdNr?: number;
  rModifiedId?: number;
}
