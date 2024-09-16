// DeptUnitListDto.ts

export interface DeptUnitListDto {
  dulID: number;
  deptID: number;
  deptName?: string;
  unitDesc?: string;
  rcCompID: number;
  rmCompID: number;
  rActiveYN: string; // char in C# maps to string in TypeScript
  rNotes?: string;
  compID?: number;
  transferYN?: string; // char in C# maps to string in TypeScript
  compCode: string;
  compName: string;
}
