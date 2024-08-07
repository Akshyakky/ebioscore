// Define the data interface
export interface BreakConDetailData {
    bCDID: number;
    bLID: number;
    hPLID: number;
    rActiveYN: 'Y' | 'N'; 
    rCreatedID: number;
    rCreatedBy: string;
    rCreatedOn: Date;
    rModifiedID: number;
    rModifiedBy: string;
    rModifiedOn: Date;
    rNotes?: string; 
    compID?: number;
    compCode?: string;
    compName?: string;
    transferYN?: 'Y' | 'N';
  }