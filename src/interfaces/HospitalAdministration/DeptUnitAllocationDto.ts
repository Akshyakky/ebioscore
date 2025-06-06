import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface DeptUnitAllocationDto extends BaseDto {
  dUAID: number;
  deptID: number;
  deptName?: string;
  dulID: number;
  unitDesc?: string;
  uASTIME: Date;
  uAETIME: Date;
  facultyID: number;
  facultyName?: string;
  roomID: number;
  roomName?: string;
  resourceID: number;
  resourceName?: string;
  occurance1YN?: string;
  occurance2YN?: string;
  occurance3YN?: string;
  occurance4YN?: string;
  occurance5YN?: string;
  occuranceAllYN?: string;
  sunYN?: string;
  monYN?: string;
  tueYN?: string;
  wedYN?: string;
  thuYN?: string;
  friYN?: string;
  satYN?: string;
  allDaysYN?: string;
  specialityID?: number;
  unitHeadYN?: string;
  rActiveYN: string;
  rNotes?: string;
  transferYN?: string;
}
