import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface UserListDto extends BaseDto {
  appID: number;
  appUserName: string;
  appGeneralCode: string;
  conID: number;
  appUcatCode: string;
  appUcatType: string;
  adminUserYN: string;
  conCompId?: number;
  digSignPath: string;
  appCode: string;
  appUAccess?: string;
  profileID: number;
  rActiveYN: string;
  rNotes?: string;
  transferYN?: string;
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
  rNotes: string;
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

export interface UserListPermissionDto {
  accessDetailID: number;
  accessID: number;
  accessName: string;
  allowAccess: string;
}
