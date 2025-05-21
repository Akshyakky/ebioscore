export interface OperationPermissionDetailsDto {
  repID: number;
  auAccessID?: number;
  appID: number;
  appUName: string;
  allowYN: string;
  operationID?: number;
  operationName?: string;
  allow?: boolean;
  profDetID?: number;
  profileID: number;
  profileName: string;
  aOPRID: number;
  rActiveYN: string;
  rNotes: string;
  reportYN: string;
}
