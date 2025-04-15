export interface OperationPermissionDetailsDto {
  repID: number;
  auAccessID?: number;
  appID: number;
  appUName: string;
  allowYN: string;
  rCreatedID: number;
  rCreatedBy: string;
  rCreatedOn: string;
  rModifiedID: number;
  rModifiedBy: string;
  rModifiedOn: string;
  compCode: string;
  compName: string;
  operationID?: number;
  operationName?: string;
  allow?: boolean;
  profDetID?: number;
  profileID: number;
  profileName: string;
  aOPRID: number;
  compID: number;
  rActiveYN: string;
  rNotes: string;
  reportYN: string;
}
