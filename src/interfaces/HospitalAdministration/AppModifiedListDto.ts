import { BaseDto } from "../../services/GenericEntityService/GenericEntityService";

export interface AppModifyFieldDto extends BaseDto {
  amlID: number;
  amlCode: string;
  amlName: string;
  amlField: string;
  defaultYN: string;
  modifyYN: string;
  rActiveYN: string;
  transferYN: string;
  rNotes?: string | null;
}

export interface AppModifiedMast extends BaseDto {
  fieldID: number;
  fieldCode: string;
  fieldName: string;
  auGrpID: number;
  rActiveYN: string;
  transferYN: string;
  rNotes?: string | null;
}
