export interface BreakConDetailData {
  bCDID: number;
  blID: number;
  hPLID: number;
  rActiveYN: "Y" | "N";
  rCreatedID: number;
  rCreatedBy: string;
  rCreatedOn: Date;
  rModifiedID: number;
  rModifiedBy: string;
  rModifiedOn: Date;
  rNotes?: string | null;
  compID?: number | null;
  compCode?: string | null;
  compName?: string | null;
  transferYN?: 'Y' | 'N' | null;
  recordStatus: string;
}


