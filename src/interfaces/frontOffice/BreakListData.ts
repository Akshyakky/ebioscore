export interface BreakListData {
  bLID: number;
  bLName: string;
  bLStartTime: Date;
  bLEndTime: Date;
  bLStartDate: Date;
  bLEndDate: Date;
  bLFrqNo: number;
  bLFrqDesc: string;
  bLFrqWkDesc: string;
  bColor: string;
  rActiveYN: string;
  rCreatedID: number;
  rCreatedBy: string;
  rCreatedOn: Date;
  rModifiedID: number;
  rModifiedBy: string;
  rModifiedOn: Date;
  rNotes: string;
  isPhyResYN: string;
  compID: number;
  compCode: string;
  compName: string;
  transferYN?: string;
}

export interface BreakConDetailData {
  bCDID: number;
  blID: number;
  hPLID: number;
  rActiveYN: string;
  rCreatedID: number;
  rCreatedBy: string;
  rCreatedOn: Date;
  rModifiedID: number;
  rModifiedBy: string;
  rModifiedOn: Date;
  rNotes: string;
  compID: number;
  compCode: string;
  compName: string;
  transferYN: string;
}

export interface BreakListDto {
  breakListData: BreakListData;
  breakListConDetailsData: BreakConDetailData[];
}
