
export interface BreakConDetailData {
  breakName: string;        // Corresponds to 'breakName' in the backend
  conResName:string;       // Corresponds to 'conResName' in the backend
  recordStatus: string;     // Corresponds to 'recordStatus' in the backend
  blID: number;             // Corresponds to 'blID' in the backend
  conID: number;            // Corresponds to 'conID' in the backend
  bCDID?: number;          // Optional if not used in the backend
  hPLID: number;          // Optional if not used in the backend
  rActiveYN?: 'Y' | 'N';   // Optional if not used in the backend
  rCreatedID?: number;     // Optional if not used in the backend
  rCreatedBy?: string;     // Optional if not used in the backend
  rCreatedOn?: Date;       // Optional if not used in the backend
  rModifiedID?: number;    // Optional if not used in the backend
  rModifiedBy?: string;    // Optional if not used in the backend
  rModifiedOn?: Date;      // Optional if not used in the backend
  rNotes?: string;         // Optional if not used in the backend
  compID?: number;         // Optional if not used in the backend
  compCode?: string;       // Optional if not used in the backend
  compName?: string;       // Optional if not used in the backend
  transferYN?: 'Y' | 'N';  // Optional if not used in the backend
}
