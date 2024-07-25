export interface BreakListData {
    bLID: number;                 
    bLName: string;               
    bLStartTime: string;          
    bLEndTime: string;           
    bLStartDate: string;          
    bLEndDate: string;           
    bLFrqNo: number;             
    bLFrqDesc: string;            
    bLFrqWkDesc: string;         
    bColor: string;              
    rCreatedID: number;          
    rCreatedBy: string;          
    rCreatedOn: string;        
    rModifiedID: number;        
    rModifiedBy: string;          
    rModifiedOn: string;          
    rNotes: string;               
    isPhyResYN?: string;           
    compID: number;              
    compCode: string;            
    compName: string;             
    transferYN: string;          
    resources:number[]
    // physicians:[]
  }
  
  

  