import { BaseDto } from "../../services/GenericEntityService/GenericEntityService";

export interface AppModifyFieldDto extends BaseDto {
  amlID: number;
  amlCode: string;
  amlName: string;
  amlField: string;
  defaultYN: "Y" | "N";
  modifyYN: "Y" | "N";
  rActiveYN: "Y" | "N";
  transferYN: "Y" | "N";
  rNotes?: string | null;
}

export interface AppModifiedMast extends BaseDto {
  fieldID: number;
  fieldCode: string;
  fieldName: string;
  auGrpID: number;
  rActiveYN: "Y" | "N";
  transferYN: "Y" | "N";
  rNotes?: string | null;
}
