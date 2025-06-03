import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface DeptUnitListDto extends BaseDto {
  dulID: number;
  deptID: number;
  deptName?: string;
  unitDesc?: string;
  rActiveYN: string;
  rNotes?: string;
  transferYN?: string;
}
