// DeptUnitListDto.ts

export interface DeptUnitListDto {
  dulID: number;
  deptID: number;
  deptName?: string;
  unitDesc?: string;
  rcCompID: number;
  rmCompID: number;
  rActiveYN: string;
  rNotes?: string;
  compID?: number;
  transferYN?: string;
  compCode: string;
  compName: string;
}
