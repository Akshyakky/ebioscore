import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface ProfileMastDto extends BaseDto {
  profileID: number;
  profileCode: string;
  profileName: string;
  rActiveYN: string;
  rNotes: string;
  compID: number;
  compCode: string;
  compName: string;
  transferYN: string;
}

export interface ProfileDetailDto extends BaseDto {
  profDetID: number;
  profileID: number;
  profileName: string;
  accessID: number;
  accessName: string;
  profileType: string;
  rActiveYN: string;
  compID: number;
  compCode: string;
  compName: string;
  rNotes: string;
  transferYN: string;
}
export interface AppUserModuleDto extends BaseDto {
  aUGrpID: number;
  aUGrpName: string;
  modOrder: number;
  langType: string;
  isCMYN: string;
  icon: string;
  imageUrl: string;
  menuUrl: string;
  rActiveYN: string;
  rNotes: string;
  compID: number;
  compCode: string;
  compName: string;
  transferYN: string;
}
export interface AppSubModuleDto extends BaseDto {
  aSubID: number;
  aUGrpID: number;
  aSubName: string;
  clinicalYN: string;
  modOrder: number;
  bChID: number;
  aSubIcon: string;
  saveMsgYN: string;
  langType: string;
  appComActivityYN: string;
  cMYN: string;
  imageUrl: string;
  menuUrl: string;
  rActiveYN: string;
  rNotes: string;
  compID: number;
  compCode: string;
  compName: string;
  transferYN: string;
}

export interface ProfileModulesDto {
  profDetID: number;
  profileID: number;
  profileName: string;
  aOprID: number;
  aOprName: string;
  aSubID: number;
  aSubName: string;
  aUGrpID: number;
  aUGrpName: string;
}

export interface ProfileModuleOperationDto extends BaseDto {
  profileID: number;
  profDetID: number;
  profileName: string;
  operationID: number;
  operationName: string;
  allow: boolean;
}
export interface ProfileListSearchResult {
  profileID: number;
  profileCode: string;
  profileName: string;
  status: string;
  rNotes: string;
  rActiveYN: string;
}
export interface ReportPermissionDto {
  auAccessID: number;
  operationID: number;
  profDetID: number;
  operationName: string;
  allow: boolean;
}

export interface ReportPermission {
  apAccessID: number;
  repID: any;
  allowYN: any;
  rActiveYN: any;
  reportID: number;
  reportName: string;
  allow: boolean;
  profDetID?: number;
  profileID: number;
  reportYN: any;
}

export interface ProfileDetailsDropdowns {
  mainModuleID: string;
  mainModuleName: string;
  subModuleID: string;
  subModuleName: string;
  repMainModuleID: string;
  repMainModuleName: string;
}
