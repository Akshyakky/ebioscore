export interface BPayTypeDto {
  payID: number;
  payCode: string;
  payName: string;
  payMode: string;
  bankCharge: number;
  rNotes: string;
  rActiveYN: string;
  rCreatedID: number;
  rCreatedOn: Date;
  rCreatedBy: string;
  rModifiedID: number;
  rModifiedOn: Date;
  rModifiedBy: string;
  compID: number;
  compCode: string;
  compName: string;
  transferYN: string;
}
