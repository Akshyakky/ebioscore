import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

// Master receipt information
export interface BReceiptMastDto extends BaseDto {
  docID: number;
  docCode: number;
  docDate: Date;
  pChartID: number;
  docType: string;
  docCodeCd: string;
  oldPChartID?: number;
}

// Detailed receipt information
export interface BReceiptDto extends BaseDto {
  docSlNo: number;
  docID: number;
  docCode: number;
  docDate: Date;
  pChartID: number;
  pTitle?: string;
  docType: string;
  docAmount?: number;
  billID?: number;
  billAmount?: number;
  docAdjAmount?: number;
  docStatus?: string;
  crAmount?: number;
  authorizedBy?: string;
  tnsID?: number;
  docCodeCD: string;
  refundAmount?: number;
  transactionNumber?: number;
  patOpIp?: string;
  deptID?: number;
  deptName?: string;
  billCode?: string;
  pChartCode?: string;
  pFName?: string;
  pLName?: string;
  pMName?: string;
  crnType?: string;
  oldPChartID: number;
}

// Payment detail information
export interface BPayDetailDto extends BaseDto {
  payDetID: number;
  payID: number;
  payCode: string;
  payName: string;
  payMode: string;
  docID: number;
  paidAmt?: number;
  refNo?: string;
  refDate?: Date;
  payNotes?: string;
  docDate?: Date;
  transactionNr?: number;
  bank?: string;
  branch?: string;
  cardApprove?: string;
  payTypeNumber?: string;
  creditCardPer: number;
}

// Composite DTO for advance receipt operations
export interface AdvanceReceiptDto {
  receiptMaster: BReceiptMastDto;
  receiptDetail: BReceiptDto;
  paymentDetails: BPayDetailDto[];
}

// Summary information for a single receipt
export interface AdvanceReceiptSummary {
  receiptId: number;
  receiptCode: string;
  receiptDate: Date;
  originalAmount: number;
  adjustedAmount: number;
  balanceAmount: number;
  status: string;
  paymentMode: string;
}

// Patient advance summary with all receipts
export interface PatientAdvanceSummaryDto {
  patientId: number;
  patientName?: string;
  patientCode?: string;
  totalAdvanceAmount: number;
  totalAdjustedAmount: number;
  availableBalance: number;
  activeReceiptsCount: number;
  lastReceiptDate: Date;
  receipts: AdvanceReceiptSummary[];
}

// Form data structure for creating new advance receipts
export interface AdvanceReceiptFormData {
  uhidNo: string;
  patientId: number;
  receiptCode?: string;
  receiptDate: Date;
  paymentDetails: PaymentDetailFormData[];
}

// Payment form data structure
export interface PaymentDetailFormData {
  paymentType: string;
  paymentMode: string;
  amount: number;
  referenceNo?: string;
  referenceDate?: Date;
  notes?: string;
  bank?: string;
  branch?: string;
  cardApprovalCode?: string;
  paymentTypeNumber?: string;
}

// Advance receipt status constants
export enum AdvanceReceiptStatus {
  ACTIVE = "ACT",
  ADJUSTED = "ADJ",
  CANCELLED = "CAN",
}

// Payment modes enum
export enum PaymentMode {
  CASH = "CASH",
  CARD = "CARD",
  CHEQUE = "CHEQUE",
  UPI = "UPI",
  NEFT = "NEFT",
  RTGS = "RTGS",
}

// Document type constant
export const ADVANCE_DOC_TYPE = "ADV";
