export interface BreakConSuspendData {
    bCSID: number;           // Break Connection Suspend ID
    bLID: number;            // Break List ID
    hPLID: number | null;           // Hospital List ID
    bCSStartDate: Date;      // Break Connection Suspend Start Date
    bCSEndDate: Date;        // Break Connection Suspend End Date
    rActiveYN: string;       // Active status indicator ('Y' or 'N')
    rCreatedID: number;      // Record Created By User ID
    rCreatedBy: string;      // Record Created By Username
    rCreatedOn: Date;        // Record Created Date
    rModifiedID: number;     // Record Modified By User ID
    rModifiedBy: string;     // Record Modified By Username
    rModifiedOn: Date;       // Record Modified Date
    rNotes?: string | null;  // Additional notes (Optional)
    compID?: number | null;  // Company ID (Optional)
    compCode: string; // Company Code (Optional)
    compName?: string | null; // Company Name (Optional)
    transferYN?: 'Y' | 'N' | null; // Transfer indicator ('Y' or 'N', Optional)
    recordStatus?: string;   // Computed status based on rActiveYN (Optional)
  }
  