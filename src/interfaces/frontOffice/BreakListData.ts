import { BaseDto } from "../../services/GenericEntityService/GenericEntityService";

export interface BreakListData extends BaseDto {
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

export interface BreakConDetailData extends BaseDto {
  bCDID: number;
  blID: number;
  hPLID: number | null;
  rActiveYN: string;
  rNotes: string;
  compID: number;
  compCode: string;
  compName: string;
  transferYN: string;
}

export interface BreakListDto extends BaseDto {
  breakListData: BreakListData;
  breakListConDetailsData: BreakConDetailData[];
}
