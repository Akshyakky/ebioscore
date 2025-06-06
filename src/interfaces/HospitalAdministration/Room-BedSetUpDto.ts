import { BaseDto } from "../../services/GenericEntityService/GenericEntityService";

export interface RoomGroupDto extends BaseDto {
  rGrpID: number;
  rGrpCode?: string;
  rGrpName: string;
  key: number;
  groupYN: string;
  rActiveYN: string;
  rNotes?: string;
  transferYN?: string;
  deptID: number;
  deptName?: string;
  gender?: string;
  genderValue?: string;
  rGrpTypeValue?: string;
  showinboYN: string;
  teachingYN: string;
  parentGroupName?: string;
}

export interface RoomListDto extends BaseDto {
  rlID: number;
  rlCode?: string;
  rName: string;
  noOfBeds: number;
  rLocation: string;
  rLocationID: number;
  rActiveYN: string;
  rNotes?: string;
  rgrpID: number;
  deptID?: number;
  deptName?: string;
  rOrder?: number;
  transferYN?: string;
  dulID: number;
  unitDesc: string;
  roomGroup?: {
    rGrpName: string;
  };
}

export interface WrBedDto extends BaseDto {
  bedID: number;
  bedName: string;
  rlID: number;
  rActiveYN: string;
  rNotes?: string;
  bchID?: number;
  bchName?: string;
  bedRemarks?: string;
  blockBedYN?: string;
  key: number;
  transferYN?: string;
  wbCatID?: number;
  wbCatName?: string;
  bedStatusValue?: string;
  bedStatus?: string;
  roomList?: {
    rName: string;
    roomGroup?: {
      rGrpID: number;
      rGrpName: string;
      deptID: number;
      deptName: string;
    };
  };
}
