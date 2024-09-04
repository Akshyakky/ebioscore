export interface UserListData {
  appID: number;
  appUserName: string;
  appGeneralCode: string;
  rActiveYN: string;
  rCreatedOn: string;
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
  digSignPath: string;
  transferYN?: string;
  appCode: string;
  appUAccess?: string;
  profileID: number;
  conName: string;
  repID: number;
}

export interface UserListSearchResult {
  profileID: number;
  profileCode: string;
  profileName: string;
  status: string;
  rNotes: string;
  rActiveYN: string;
}

export interface UserMastDto {
  profileID: number;
  profileCode: string;
  profileName: string;
  rActiveYN: string;
  compID: number;
  rNotes: string;
}

export interface UserPermissionDto {
  repID: number;
  auAccessID?: number;
  appID: number;
  appUName: string;
  aOPRID?: number;
  allowYN: string;
  rActiveYN: string;
  rCreatedID: number;
  rCreatedBy: string;
  rCreatedOn: string;
  rModifiedID: number;
  rModifiedBy: string;
  rModifiedOn: string;
  rNotes: string;
  compID: number;
  compCode: string;
  compName: string;
  profileID: number;
  operationID?: number;
  profDetID?: number;
  operationName?: string;
  allow?: boolean;
}
export interface UserPermissionDropdowns {
  mainModuleID: string;
  mainModuleName: string;
  subModuleID: string;
  subModuleName: string;
  repMainModuleID: string;
  repMainModuleName: string;
}

interface UserPermission {
  profDetID?: number;
  reportID: number;
  reportName: string;
  allow: boolean;
}
