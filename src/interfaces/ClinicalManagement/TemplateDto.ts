import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface TemplateMastDto extends BaseDto {
  templateID: number;
  templateCode?: string;
  templateName: string;
  templateDescription: string;
  templateType: string;
  displayAllUsers: "Y" | "N" | "C";
  rActiveYN: "Y" | "N";
  transferYN: "Y" | "N";
  rNotes?: string;
}

export interface TemplateDetailDto extends BaseDto {
  templateDetailID: number;
  templateID: number;
  appID: number;
  rActiveYN: "Y" | "N";
  transferYN: "Y" | "N";
  rNotes?: string;
}
