import { BaseDto } from "../../services/GenericEntityService/GenericEntityService";

export interface AppModifyFieldDto extends BaseDto {
  amlID: number;
  amlCode: string;
  amlName: string;
  amlField: string;
  defaultYN: "N" | "Y";
  modifyYN: "N" | "Y";
  rActiveYN: "N" | "Y";
  transferYN: "N" | "Y";
  rNotes?: string | null;
}

export interface AppModifiedMast extends BaseDto {
  fieldID: number;
  fieldCode: string;
  fieldName: string;
  auGrpID: number;
  rActiveYN: "N" | "Y";
  transferYN: "N" | "Y";
  rNotes?: string | null;
}
