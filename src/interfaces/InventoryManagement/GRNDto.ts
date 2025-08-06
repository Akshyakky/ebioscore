// src/interfaces/InventoryManagement/GRNDto.ts

import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

// ADDED: New interface for product issuals within a GRN detail
export interface GrnProductIssualDto {
  toDeptID: number;
  toDeptName: string;
  issuualQty: number;
  indentNo?: string | null;
  remarks?: string | null;
  createIssual: boolean;
}

export interface GrnMastDto extends BaseDto {
  grnID: number;
  deptID: number;
  deptName: string;
  grnDate: string;
  invoiceNo: string;
  invDate: string;
  supplrID: number;
  supplrName: string;
  tot?: number;
  disc?: number;
  netTot?: number;
  auGrpID?: number;
  balanceAmt?: number;
  catDesc?: string;
  catValue?: string;
  coinAdj?: number;
  dcNo?: string;
  discPercentageYN?: string;
  grnApprovedBy?: string;
  grnApprovedID?: number;
  grnApprovedYN: string;
  grnStatusCode?: string;
  grnStatus?: string;
  otherAmt?: number;
  poCoinAdjAmt?: number;
  poDate?: string;
  poDiscAmt?: number;
  poID?: number;
  poNo?: string;
  poTotalAmt?: number;
  taxAmt?: number;
  transDeptID?: number;
  transDeptName?: string;
  grnCode?: string;
  grnType?: string;
  totalTaxableAmt?: number;
  netCGSTTaxAmt?: number;
  netSGSTTaxAmt?: number;

  // ADDED: Enhanced properties for issual integration
  createProductIssuals: boolean;
  defaultIssualIndentNo?: string | null;
  defaultIssualRemarks?: string | null;
}

export interface GrnDetailDto extends BaseDto {
  grnDetID: number;
  grnID: number;
  pGrpID?: number;
  pGrpName?: string;
  productID: number;
  productCode?: string;
  catValue: string;
  mfID?: number;
  pUnitID?: number;
  pUnitName?: string;
  pUnitsPerPack?: number;
  pkgID?: number;
  batchNo?: string;
  expiryDate?: string;
  unitPrice?: number;
  tax?: number;
  sellUnitPrice?: number;
  recvdQty?: number;
  acceptQty?: number;
  freeItems?: number;
  productValue?: number;
  productNotes?: string;
  psGrpID?: number;
  chargeablePercent?: number;
  discAmt?: number;
  discPercentage?: number;
  expiryYN?: string;
  isFreeItemYN?: string;
  itemMrpValue?: number;
  itemTotalProfit?: number;
  itemTotalVat?: number;
  manufacturerCode?: string;
  manufacturerID?: number;
  manufacturerName?: string;
  mrpAbated?: number;
  mrp?: number;
  poDetID?: number;
  requiredUnitQty?: number;
  taxAfterDiscOnMrpYN?: string;
  taxAfterDiscYN?: string;
  taxCode?: string;
  taxID?: number;
  taxModeCode?: string;
  taxModeDescription?: string;
  taxModeID?: string;
  taxName?: string;
  taxOnFreeItemsYN?: string;
  taxOnMrpYN?: string;
  taxOnUnitPriceYN?: string;
  catDesc?: string;
  mfName?: string;
  pkgName?: string;
  productName?: string;
  psGrpName?: string;
  refNo?: string;
  hsnCode?: string;
  cgstPerValue?: number;
  cgstTaxAmt?: number;
  sgstPerValue?: number;
  sgstTaxAmt?: number;
  taxableAmt?: number;
  defaultPrice: number;

  // ADDED: Enhanced property for issual integration
  productIssuuals: GrnProductIssualDto[];
}
export interface GrnDto {
  grnMastDto: GrnMastDto;
  grnDetailDto: GrnDetailDto[];
}

export interface GrnGridItemDto extends GrnDetailDto {
  rol?: number;
  currentStock?: number;
  stockValue?: number;
}

export interface GrnSearchRequest {
  dateFilterType?: string;
  startDate?: string;
  endDate?: string;
  supplierID?: number;
  departmentID?: number;

  invoiceNo?: string;
  grnCode?: string;
  grnStatus?: string;
  approvedStatus?: string;
  pageIndex?: number;
  pageSize?: number;
  sortBy?: string;
  sortAscending?: boolean;
}
