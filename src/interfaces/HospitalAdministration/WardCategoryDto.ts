import { BaseDto } from "../../services/GenericEntityService/GenericEntityService";

export interface WardCategoryDto extends BaseDto {
  wCatID: number;
  wCatCode: string;
  wCatName: string;
  rActiveYN: string;
  rNotes?: string;
  transferYN?: string;
}
