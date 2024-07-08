export interface ProfileMastDto {
  profileID: number;
  profileCode: string;
  profileName: string;
  rActiveYN: string;
  compID: number;
  rNotes: string;
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

export interface OperationResult<T> {
  success: boolean;
  data?: T;
  affectedRows?: number;
  errorMessage?: string;
  errors?: any[];
}

export interface ProfileListSearchResult {
  profileID: number;
  profileCode: string;
  profileName: string;
  status: string;
  rNotes: string;
}
export interface ReportPermissionDto {
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
}

export interface ProfileDetailsDropdowns {
  mainModuleID: string;
  mainModuleName: string;
  subModuleID: string;
  subModuleName: string;
  repMainModuleID: string;
  repMainModuleName: string;
}
