// Types for Product Stock Return functionality

import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

// Return types enum
export enum ReturnType {
  Supplier = "SUP",
  Internal = "INT",
  Expired = "EXP",
  Damaged = "DAM",
}

// Main stock return entity
export interface ProductStockReturnDto extends BaseDto {
  psrID: number;
  psrDate: Date;
  dtID: number;
  dtCode?: string;
  dtName: string;
  fromDeptID?: number;
  fromDeptName?: string;
  toDeptID?: number;
  toDeptName?: string;
  auGrpID?: number;
  authorisedBy?: string;
  catDesc?: string;
  catValue?: string;
  psrCode?: string;
  returnTypeCode?: string;
  returnType?: string;
  stkrCoinAdjAmt?: number;
  stkrGrossAmt?: number;
  stkrRetAmt?: number;
  stkrTaxAmt?: number;
  supplierID?: number;
  supplierName?: string;
  approvedYN: string;
  approvedID?: number;
  approvedBy?: string;

  // Additional calculated properties
  totalItems: number;
  totalReturnedQty: number;
  returnTypeName?: string;

  // Additional fields for UI
  details?: ProductStockReturnDetailDto[];
}

// Stock return detail entity
export interface ProductStockReturnDetailDto extends BaseDto {
  psrdID: number;
  psrID: number;
  productID: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  batchID?: number;
  batchNo?: string;
  expiryDate?: Date;
  manufacturedDate?: Date;
  grnDate: Date;
  prescriptionYN: string;
  expiryYN: string;
  sellableYN: string;
  taxableYN: string;
  psGrpID?: number;
  psGrpName?: string;
  manufacturerID?: number;
  manufacturerCode?: string;
  manufacturerName?: string;
  taxID?: number;
  taxCode?: string;
  taxName?: string;
  mrp?: number;
  transferYN?: string;
  freeRetQty?: number;
  freeRetUnitQty?: number;
  psdID: number;
  hsnCode?: string;

  // Additional properties for business logic
  productCode?: string;
  pUnitID?: number;
  pUnitName?: string;
  pUnitsPerPack?: number;
  pkgID?: number;
  pkgName?: string;
  availableQty?: number;
  psbid?: number;
  returnReason?: string;
  tax?: number;
  sellUnitPrice?: number;
  mfID?: number;
  mfName?: string;
  pGrpID?: number;
  pGrpName?: string;

  // UI helper properties
  cgst?: number;
  sgst?: number;
}

// Composite DTO for operations involving both header and details
export interface ProductStockReturnCompositeDto {
  productStockReturn: ProductStockReturnDto;
  productStockReturnDetails: ProductStockReturnDetailDto[];
}

// Search and filter parameters
export interface ProductStockReturnSearchRequest {
  pageIndex?: number;
  pageSize?: number;
  startDate?: Date;
  endDate?: Date;
  dateFilterType?: DateFilterType;
  fromDepartmentID?: number;
  toDepartmentID?: number;
  supplierID?: number;
  psrCode?: string;
  returnTypeCode?: string;
  approvedStatus?: string;
  sortBy?: string;
  sortAscending?: boolean;
}

export enum DateFilterType {
  Today = "Today",
  LastOneWeek = "LastOneWeek",
  LastOneMonth = "LastOneMonth",
  LastThreeMonths = "LastThreeMonths",
  Custom = "Custom",
}

// Validation request
export interface ValidateReturnStockRequest {
  fromDepartmentId: number;
  returnDetails: ProductStockReturnDetailDto[];
}

// Stock balance interface for available stock
export interface ProductStockBalance {
  psbid: number;
  deptID: number;
  deptName: string;
  productID: number;
  productName: string;
  productCode?: string;
  batchNumber?: string;
  expiryDate?: Date;
  productQuantityOnHand?: number;
  productUnitQuantityOnHand?: number;
  unitPrice?: number;
  sellingPrice?: number;
  tax?: number;
  sellUnitPrice?: number;
  pUnitName?: string;
  pUnitsPerPack?: number;
  manufacturerName?: string;
}

// Helper function to format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
};
