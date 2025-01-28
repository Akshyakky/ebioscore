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

export interface ProfileDetailDto {
  profDetID: number;
  profileID: number;
  profileName: string;
  aOPRID: number;
  compID: number;
  rActiveYN: string;
  rNotes: string;
  reportYN: string;
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
