export interface BreakConSuspendData {
  bCSID: number;               // Break Connection Suspend ID
  bLID: number;                // Break List ID
  hPLID: number;               // Hospital List ID
  bCSStartDate: Date;          // Break Connection Suspend Start Date
  bCSEndDate: Date;            // Break Connection Suspend End Date
  rActiveYN: 'Y' | 'N';        // Active status indicator ('Y' or 'N')
  rCreatedOn: Date;            // Record Created Date
  rCreatedID: number;          // Record Created By User ID
  rCreatedBy: string;          // Record Created By Username
  rModifiedOn: Date;           // Record Modified Date
  rModifiedID: number;         // Record Modified By User ID
  rModifiedBy: string;         // Record Modified By Username
  rNotes: string | null;       // Additional notes (Nullable)
  compCode: string;            // Company Code
  compID: number | null;       // Company ID (Nullable)
  compName: string | null;     // Company Name (Nullable)
  transferYN: 'Y' | 'N' | null; // Transfer indicator ('Y', 'N', or null)
  status: string;              // Computed status based on rActiveYN ('Active' or 'Hidden')
}
