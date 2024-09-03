export interface DeptUserDto {
  deptUserID: number;
  deptID: number;
  appID: number;
  rActiveYN: string;
  rNotes: string;
  allowIMYN: string;
  allowPMYN: string;
  transferYN: string;
  rCreatedID: number;
  rCreatedOn: Date;
  rCreatedBy: string;
  rModifiedID: number;
  rModifiedOn: Date;
  rModifiedBy: string;
  compID: number;
  compCode: string;
  compName: string;
}
