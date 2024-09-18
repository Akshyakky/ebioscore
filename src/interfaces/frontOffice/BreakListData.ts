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
