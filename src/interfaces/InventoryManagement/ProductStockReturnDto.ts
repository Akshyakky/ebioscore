// Updated ProductStockReturnDto.ts - Aligned with Backend Structure

import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export enum ReturnType {
  Supplier = "SUP",
  Internal = "INT",
  Expired = "EXP",
  Damaged = "DAM",
  Physician = "PHY",
}
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
  details?: ProductStockReturnDetailDto[];
}
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
  freeRetQty?: number;
  freeRetUnitQty?: number;
  psdID: number;
  hsnCode?: string;
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
  cgst?: number;
  sgst?: number;
}
export interface ProductStockReturnCompositeDto {
  productStockReturn: ProductStockReturnDto;
  productStockReturnDetails: ProductStockReturnDetailDto[];
}
export interface ProductStockReturnSearchRequest {
  pageIndex?: number;
  pageSize?: number;
  startDate?: Date;
  endDate?: Date;
  dateFilterType?: DateFilterType;
  fromDepartmentID?: number;
  toDepartmentID?: number;
  supplierID?: number;
  physicianID?: number;
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
export interface ValidateReturnStockRequest {
  fromDepartmentId: number;
  returnDetails: ProductStockReturnDetailDto[];
}
export interface PhysicianReturnDto {
  physicianId: number;
  physicianName: string;
  physicianCode?: string;
  licenseNumber?: string;
  specialization?: string;
  contactNumber?: string;
  email?: string;
  isActive: boolean;
}

export interface CreatePhysicianReturnRequest {
  fromDepartmentId: number;
  physicianId: number;
  returnReason?: string;
  notes?: string;
  returnDetails: ProductStockReturnDetailDto[];
}

export interface PhysicianReturnSummaryDto {
  totalReturns: number;
  approvedReturns: number;
  pendingReturns: number;
  totalValue: number;
  totalItems: number;
  totalQuantity: number;
  topPhysicians: PhysicianReturnDto[];
}
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

export const getReturnTypeName = (returnTypeCode?: string): string => {
  switch (returnTypeCode) {
    case ReturnType.Supplier:
      return "Supplier Return";
    case ReturnType.Internal:
      return "Internal Transfer";
    case ReturnType.Expired:
      return "Expired Items";
    case ReturnType.Damaged:
      return "Damaged Items";
    case ReturnType.Physician:
      return "Physician Return";
    default:
      return returnTypeCode || "Unknown";
  }
};

export const requiresSupplierInfo = (returnTypeCode?: string): boolean => {
  return returnTypeCode === ReturnType.Supplier || returnTypeCode === ReturnType.Physician;
};

export const getSupplierLabel = (returnTypeCode?: string): string => {
  switch (returnTypeCode) {
    case ReturnType.Physician:
      return "Physician";
    case ReturnType.Supplier:
      return "Supplier";
    default:
      return "Supplier";
  }
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
};
