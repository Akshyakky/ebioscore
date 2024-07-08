export interface UserListData {
    appID: number;
    appUserName: string;
    appGeneralCode: string;
    rActiveYN: string;
    rCreatedOn: string; // Use string type for API compatibility
    rCreatedID: number;
    rCreatedBy: string;
    rModifiedOn: string; 
    rModifiedID: number;
    rModifiedBy: string;
    rNotes?: string;
    conID: number;
    appUcatCode: string;
    appUcatType: string;
    adminUserYN: string;
    compCode: string;
    compID?: number;
    compName: string;
    conCompId?: number;
    digSignPath?: string;
    transferYN?: string;
    appCode: string;
    appUAccess?: string;
    profileID?: number;
    conName: string;
  }


  export interface UserListSearchResult {
    profileID: number;
    profileCode: string;
    profileName: string;
    status: string;
    rNotes: string;
  }

  export interface serMastDto {
    profileID: number;
    profileCode: string;
    profileName: string;
    rActiveYN: string;
    compID: number;
    rNotes: string;
  }

