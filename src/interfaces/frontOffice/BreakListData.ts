

export interface BreakListData {
  hPLID: number;
  bLID: number;
  bLName: string;
  bLStartTime: Date;   // Adjusted to Date
  bLEndTime: Date;     // Adjusted to Date
  bLStartDate: Date;   // Adjusted to Date
  bLEndDate: Date;     // Adjusted to Date
  bLFrqNo: number;
  bLFrqDesc: string;
  bLFrqWkDesc?: string; // Nullable
  bColor?: string;     // Nullable
  rActiveYN: 'Y' | 'N'; // Use 'Y' and 'N' to match the char type
  rCreatedID: number;
  rCreatedBy: string;
  rCreatedOn: Date;    // Adjusted to Date
  rModifiedID: number;
  rModifiedBy: string;
  rModifiedOn: Date;   // Adjusted to Date
  rNotes?: string;     // Nullable
  isPhyResYN: 'Y' | 'N'; // Use 'Y' and 'N' to match the char type
  compID: number;     // Nullable
  compCode?: string;   // Nullable
  compName?: string;   // Nullable
  transferYN?: 'Y' | 'N'; // Nullable and use 'Y' and 'N' to match the char type
  resources: string;    // Adjust if you have a specific type for resources
  frequencyDetails: string;
}







