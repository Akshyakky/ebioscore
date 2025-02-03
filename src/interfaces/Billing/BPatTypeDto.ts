import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface BPatTypeDto extends BaseDto {
  pTypeID: number;
  pTypeCode: string;
  pTypeName: string;
  rActiveYN: string;
  rNotes: string;
  compID: number;
  compCode: string;
  compName: string;
  isInsuranceYN: string;
  transferYN: string;
  rCreatedID: number;
  rCreatedOn: Date;
  rCreatedBy: string;
  rModifiedID: number;
  rModifiedOn: Date;
  rModifiedBy: string;
}
