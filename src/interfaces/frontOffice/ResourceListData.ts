export interface ResourceListData {
  rLID: number;
  rLCode: string;
  rLName: string;
  rActiveYN: string;
  rCreatedOn: Date;
  rCreatedID: number;
  rCreatedBy: string; // Add this
  rModifiedOn: Date;
  rModifiedID: number;
  rModifiedBy: string; // Add this
  rNotes: string;
  rLValidateYN: string;
  rLOtYN: string;
  compID?: number;
  compCode?: string;
  compName?: string;
  transferYN?: string;
}

  export interface ResourceDetailsFields {
  rLID: number;
  rLCode: string;
  rLName: string;
  rNotes: string;
  rLValidateYN: string;
  rLOtYN: string;
}