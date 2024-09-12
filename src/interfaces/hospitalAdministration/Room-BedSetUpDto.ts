export interface RoomGroupDto {
  rGrpID: number;
  rGrpCode?: string;
  rGrpName: string;
  Key: number;
  groupYN: string;
  rActiveYN: string;
  compID?: number;
  rNotes?: string;
  transferYN?: string;
  deptID: number;
  deptName?: string;
  gender?: string;
  genderValue?: string;
  rGrpTypeValue?: string;
  showinboYN: string;
  teachingYN: string;
}

export interface RoomListDto {
  rlID: number;
  rlCode?: string;
  rName: string;
  noOfBeds: number;
  rLocation?: string;
  rActiveYN: string;
  rNotes?: string;
  rgrpID: number;
  compID?: number;
  deptID?: number;
  deptName?: string;
  rLocationID?: number;
  rOrder?: number;
  transferYN?: string;
}
