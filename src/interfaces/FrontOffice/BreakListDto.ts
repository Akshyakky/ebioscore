import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

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
  transferYN?: string;
}
export interface BreakDto extends BreakListData {
  hPLID: number;
  bCSID?: number;
  assignedName?: number;
  status?: string;
  bCSStartDate?: Date | string;
  bCSEndDate?: Date | string;
}

export interface BreakConDetailDto extends BaseDto {
  bCDID: number;
  blID: number;
  hPLID: number | null;
  rActiveYN: string;
  rNotes: string;
  transferYN: string;
}

export interface BreakListDto extends BaseDto {
  breakList: BreakListData;
  breakConDetails: BreakConDetailDto[];
}

export interface FrequencyDto {
  frequency: string;
  endDate: string;
  interval: number;
  weekDays: string[];
}

export interface BreakConSuspendDto extends BaseDto {
  bCSID: number;
  bLID: number;
  hPLID: number | null;
  bCSStartDate: Date | string;
  bCSEndDate: Date | string;
  rActiveYN?: string;
  rNotes?: string;
  transferYN?: string;
}
