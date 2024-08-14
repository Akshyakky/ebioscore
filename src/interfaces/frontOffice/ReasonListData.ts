export interface ReasonListData {
    arlID: number;
    arlCode: string;
    arlName: string;
    arlDuration: number;
    arlDurDesc: string;
    arlColor: number;
    rActiveYN: string;
    rCreatedOn: Date; // Use Date if you plan to convert to/from Date objects
    rCreatedID: number;
    rCreatedBy: string;
    rModifiedOn: Date; // Use Date if you plan to convert to/from Date objects
    rModifiedID: number;
    rModifiedBy: string;
    rNotes: string;
    compCode: string;
    compID: number;
    compName: string;
    transferYN: string;
    rlName: string;
    rlID: string | number;
  }
  



