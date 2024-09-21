import { BaseDto } from "../../services/GenericEntityService/GenericEntityService";

export interface ProductGroupDto extends BaseDto {
  pgrpID: number;
  pgrpCode?: string;
  pgrpName?: string;
  modifyYN: string;
  defaultYN: string;
  rActiveYN: string;
  compID: number;
  compCode: string;
  compName: string;
  transferYN: string;
  rNotes?: string;
}

export interface ProductUnitDto extends BaseDto {
  punitID: number;
  punitCode?: string;
  punitName?: string;
  modifyYN: string;
  defaultYN: string;
  rActiveYN: string;
  compID: number;
  compCode: string;
  compName: string;
  transferYN: string;
  rNotes?: string;
}

export interface ProductSubGroupDto extends BaseDto {
  psGrpID: number;
  psGrpCode?: string;
  psGrpName?: string;
  modifyYN: string;
  defaultYN: string;
  rActiveYN: string;
  compID: number;
  compCode: string;
  compName: string;
  transferYN: string;
  rNotes?: string;
}
