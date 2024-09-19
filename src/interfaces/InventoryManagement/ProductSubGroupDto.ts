import { BaseDto } from "../../services/GenericEntityService/GenericEntityService";

export interface ProductSubGroupDto extends BaseDto {
  psGrpCode: string;
  psGrpName: string;
  modifyYN: string;
  defaultYN: string;
  compID: number;
  compCode: string;
  compName: string;
  transferYN: string;
  rNotes?: string;
}
