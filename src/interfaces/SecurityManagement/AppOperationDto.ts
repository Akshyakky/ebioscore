import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface AppOperationDto extends BaseDto {
  aOprID: number;
  aSubID: number;
  aOprName: string;
  auGrpID: number;
  langType: string;
  transferYN: string;
  rNotes: string;
}
