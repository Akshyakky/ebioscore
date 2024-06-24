export interface ProfileMastDto {
  profileID: number;
  profileCode: string;
  profileName: string;
  rActiveYN: string;
  compID: number;
  rNotes: string;
}

// Assuming this file is located at src/interfaces/SecurityManagement/ProfileListData.ts

// Assuming this file is located at src/interfaces/SecurityManagement/ProfileListData.ts

export interface ProfileDetailDto {
  profDetID: number;
  profileID: number;
  profileName: string;
  aOPRID: number;
  // operationID: number; // Add this property
  compID: number;
  rActiveYN: string;
  rNotes: string;
  reportYN: string;
}

export interface OperationResult<T> {
  success: boolean;
  data?: T; // data can be undefined
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
  operationName: string;
  allow: boolean;
}
