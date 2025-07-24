// src/pages/billing/Billing/MainPage/types.ts
import { z } from "zod";

// Service Schema
export const BillServicesDtoSchema = z.object({
  billDetID: z.number().default(0),
  billID: z.number().default(0),
  chargeDt: z.union([z.date(), z.string()]).default(new Date()),
  chargeID: z.number(),
  chargeCode: z.string().default(""),
  chargeDesc: z.string().default(""),
  chargeDescLang: z.string().optional(),
  cHValue: z.number().default(0),
  chUnits: z.number().optional().default(1),
  chDisc: z.number().optional().default(0),
  actualDDValue: z.number().optional().default(0),
  actualHCValue: z.number().optional().default(0),
  dCValue: z.number().optional().default(0),
  drPercShare: z.number().optional().default(0),
  dValDisc: z.number().optional().default(0),
  hCValue: z.number().optional().default(0),
  hospPercShare: z.number().optional().default(0),
  hValDisc: z.number().optional().default(0),
  packID: z.number().optional(),
  packName: z.string().optional(),
  physicianID: z.number().optional(),
  PhysicianName: z.string().optional(),
  sGRPID: z.number().optional(),
  sGRPName: z.string().optional(),
  opipNo: z.number().optional(),
  bCHID: z.number(),
  bCHName: z.string().default(""),
  physicianYN: z.string().default("N"),
  nHSXessAmt: z.number().optional().default(0),
  actualAmt: z.number().optional().default(0),
  procedureID: z.number().optional(),
  procedureName: z.string().optional(),
  chargeCost: z.number().default(0),
  deptID: z.number().optional(),
  deptName: z.string().optional(),
  rActiveYN: z.string().default("Y"),
  transferYN: z.string().default("N"),
  rNotes: z.string().optional(),
});

// Product Schema
export const BillProductsDtoSchema = z.object({
  productID: z.number(),
  productName: z.string().optional(),
  batchNo: z.string().min(1),
  expiryDate: z.union([z.date(), z.string()]),
  grnDetID: z.number().min(1),
  deptID: z.number().min(1),
  deptName: z.string(),
  selectedQuantity: z.number().default(0),
  productQOH: z.number().default(0),
  hValue: z.number().optional().default(0),
  hospPercShare: z.number().optional().default(0),
  hValDisc: z.number().optional().default(0),
  packID: z.number().optional(),
  packName: z.string().optional(),
  rActiveYN: z.string().default("Y"),
});

export const BillPaymentDetailsDtoSchema = z.object({
  paymentID: z.number().min(1),
  paymentMode: z.string().min(1),
  paymentCode: z.string(),
  paymentName: z.string(),
  paidAmount: z.number().min(0),
  paymentNote: z.string().optional(),
  referenceNumber: z.string().optional(),
  bank: z.string().optional(),
  branch: z.string().optional(),
  clientID: z.number().optional(),
  clientCode: z.string().optional(),
  clientName: z.string().optional(),
});

// Main Billing Schema
export const billingSchema = z.object({
  pChartID: z.number().min(1, "Patient selection is required"),
  pChartCode: z.string().default(""),
  pFName: z.string().default(""),
  pLName: z.string().optional().default(""),
  pMName: z.string().optional().default(""),
  pTitle: z.string().optional().default(""),
  billID: z.number().default(0),
  billCode: z.string().default(""),
  billDate: z.date().default(new Date()),
  pTypeID: z.number().min(1, "Payment source is required"),
  pTypeName: z.string().default(""),
  pTypeCode: z.string().optional().default(""),
  patOPIP: z.enum(["O", "I"]).default("O"),
  billStatus: z.enum(["A", "C", "D"]).default("A"),
  physicianID: z.number().optional(),
  physicianName: z.string().optional(),
  referralID: z.number().optional(),
  referralName: z.string().optional(),
  referral2ID: z.number().optional(),
  referralName2: z.string().optional(),
  billMisc: z.string().optional().default(""),
  admitID: z.number().default(0),
  opipCaseNo: z.number().default(0),
  opIPNo: z.number().default(0),
  disapprovedEmpID: z.number().optional(),
  disapproveEmpName: z.string().optional(),
  groupDisc: z.number().optional().default(0),
  langType: z.string().optional(),
  patMemID: z.number().optional(),
  patMemName: z.string().optional(),
  pckAmount: z.number().optional(),
  pckCode: z.string().optional(),
  pckID: z.number().optional(),
  pckName: z.string().optional(),
  strProfitOrLoss: z.string().optional(),
  profitOrLoss: z.number().optional(),
  sourceID: z.number().default(0),
  source: z.string().optional(),
  oldPChartID: z.number().default(0),
  drBillID: z.number().default(0),
  billGrossAmt: z.number().default(0),
  billDiscAmt: z.number().default(0),
  visitReferenceCode: z.string().optional().default(""),
  rActiveYN: z.string().default("Y"),
  transferYN: z.string().optional().default("N"),
  rNotes: z.string().optional().default(""),
  billServices: z.array(BillServicesDtoSchema).default([]),
  billProducts: z.array(BillProductsDtoSchema).default([]),
  billPaymentDetails: z.array(BillPaymentDetailsDtoSchema).default([]),
});

export type BillingFormData = z.infer<typeof billingSchema>;
export type BillServiceData = z.infer<typeof BillServicesDtoSchema>;
export type BillProductData = z.infer<typeof BillProductsDtoSchema>;
export type BillPaymentDetailsData = z.infer<typeof BillPaymentDetailsDtoSchema>;

// Grid row interfaces
export interface BillServiceRow extends BillServiceData {
  id: string | number;
}

export interface BillProductRow extends BillProductData {
  id: string | number;
}

// Dropdown option interface
export interface DropdownOption {
  value: string | number;
  label: string;
}
