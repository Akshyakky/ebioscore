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
  rLocation: string;
  rLocationID: number;
  rActiveYN: string;
  rNotes?: string;
  rgrpID: number;
  compID?: number;
  deptID?: number;
  deptName?: string;
  rOrder?: number;
  transferYN?: string;
  dulID: number;
  unitDesc: string;
}

export interface WrBedDto {
  bedID: number;
  bedName: string;
  rlID: number;
  rActiveYN: string;
  rNotes?: string;
  bchID?: number;
  bchName?: string;
  bedRemarks?: string;
  blockBedYN?: string; // Default value 'N' can be handled in the application logic
  compID?: number;
  keyNr?: number;
  transferYN?: string;
  wbCatID?: number;
  wbCatName?: string;
  bedStatusValue?: string;
  bedStatus?: string;
}
