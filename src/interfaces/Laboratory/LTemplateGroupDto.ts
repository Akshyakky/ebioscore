import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface LTemplateGroupDto extends BaseDto {
  tGroupID: number;
  tRgpCode?: string;
  tGroupName?: string;
  modifyYN: string;
  defaultYN: string;
  rActiveYN: string;
  transferYN: string;
  rNotes?: string;
}
