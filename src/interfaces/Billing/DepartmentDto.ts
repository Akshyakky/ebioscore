import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface DepartmentDto extends BaseDto {
  deptID: number;
  deptCode: string;
  deptName: string;
  deptType: string;
  deptStore: string;
  rActiveYN: string;
  rNotes: string;
  deptLocation: string;
  deptSalesYN: string;
  deptStorePhYN: string;
  dlNumber: string;
  isUnitYN: string;
  superSpecialityYN: string;
  unit: string;
  isStoreYN: string;
  autoConsumptionYN: string;
  dischargeNoteYN: string;
  compID: number;
  compCode: string;
  compName: string;
  transferYN: string;
}
