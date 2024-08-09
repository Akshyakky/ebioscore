
// export interface BreakConDetailData {
//   hPLID: number;
//   bCDID: number;
//   blID: number;
//   rActiveYN: string;
//   rCreatedID: number;
//   rCreatedBy: string;
//   rCreatedOn: Date;
//   rModifiedID: number;
//   rModifiedBy: string;
//   rModifiedOn: Date;
//   rNotes: string;
//   transferYN: string;
//   compID: number;
//   compCode: string;
//   compName: string;
//   conResName: string;
//   breakName: string;
//   recordStatus: string;
//   conID: number;     // Optional if not used in the backend
// }



export interface BreakConDetailData {
  bCDID: number;
  bLID: number;
  hPLID: number;
  rActiveYN: string; // Ensure these are single characters
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
  transferYN?: 'Y' | 'N' | null; // Ensure this is a single character
  recordStatus?: 'Y' | 'N' | null;
}


