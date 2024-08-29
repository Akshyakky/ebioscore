
export interface BreakListData {
  hPLID: number;
  bLID: number;
  bLName: string;
  bLStartTime: Date;   
  bLEndTime: Date;     
  bLStartDate: Date;  
  bLEndDate: Date;     
  bLFrqNo: number;
  bLFrqDesc: string;
  bLFrqWkDesc?: string; 
  bColor?: string;     
  rActiveYN: "Y" | "N";
  rCreatedID: number;
  rCreatedBy: string;
  rCreatedOn: Date;   
  rModifiedID: number;
  rModifiedBy: string;
  rModifiedOn: Date;   
  rNotes?: string;     
  isPhyResYN: string; 
  compID: number;     
  compCode: string;   
  compName: string;   
  transferYN?: 'Y' | 'N'; 
  resources: string;    
  frequencyDetails: string;
}





















