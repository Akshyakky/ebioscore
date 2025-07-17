// src/interfaces/Billing/BillingDto.ts

import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface BillsDto extends BaseDto {
  billID: number;
  billCode: string;
  billDate: Date | string;
  pChartID: number;
  pTypeID: number;
  pTypeCode?: string;
  pTitle: string;
  patOPIP: "O" | "I";
  pTypeName: string;
  billGrossAmt: number;
  billDiscAmt: number;
  billStatus: "A" | "C" | "D";
  physicianID?: number;
  physicianName?: string;
  referralID?: number;
  referralName?: string;
  billMisc?: string;
  admitID: number;
  opipCaseNo: number;
  opIPNo: number;
  disapprovedEmpID?: number;
  disapproveEmpName?: string;
  groupDisc?: number;
  langType?: string;
  patMemID?: number;
  patMemName?: string;
  pckAmount?: number;
  pckCode?: string;
  pckID?: number;
  pckName?: string;
  strProfitOrLoss?: string;
  profitOrLoss?: number;
  sourceID: number;
  source?: string;
  pChartCode?: string;
  pFName: string;
  pLName?: string;
  pMName?: string;
  referral2ID?: number;
  referralName2?: string;
  oldPChartID: number;
  drBillID: number;
  rActiveYN?: string;
  transferYN?: string;
  rNotes?: string;
}

export interface BillServicesDto extends BaseDto {
  billDetID: number;
  billID: number;
  chargeDt: Date | string;
  chargeID: number;
  chargeCode: string;
  chargeDesc: string;
  chargeDescLang?: string;
  cHValue: number;
  chUnits?: number;
  chDisc?: number;
  actualDDValue?: number;
  actualHCValue?: number;
  dCValue?: number;
  drPercShare?: number;
  dValDisc?: number;
  hCValue?: number;
  hospPercShare?: number;
  hValDisc?: number;
  packID?: number;
  packName?: string;
  physicianID?: number;
  PhysicianName?: string;
  sGRPID?: number;
  sGRPName?: string;
  opipNo?: number;
  bCHID: number;
  bCHName: string;
  physicianYN: string;
  nHSXessAmt?: number;
  actualAmt?: number;
  procedureID?: number;
  procedureName?: string;
  chargeCost: number;
  rActiveYN?: string;
  transferYN?: string;
  rNotes?: string;
}

export interface BillProductsDto extends BaseDto {
  productID: number;
  productName: string;
  batchNo: string;
  expiryDate: Date | string;
  grnDetID: number;
  deptID: number;
  deptName: string;
  selectedQuantity: number;
  hValue: number;
  hospPercShare?: number;
  hValDisc?: number;
  packID?: number;
  packName?: string;
  rActiveYN?: string;
}

export interface BillSaveRequest {
  bill: BillsDto;
  billServices: BillServicesDto[];
  billProducts: BillProductsDto[];
}
