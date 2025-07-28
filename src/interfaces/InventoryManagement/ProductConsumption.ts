// src/interfaces/InventoryManagement/ProductConsumptionDto.ts

import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface ProductConsumptionMastDto extends BaseDto {
  deptConsID: number;
  deptConsCode?: string;
  deptConsDate?: Date;
  fromDeptID: number;
  fromDeptName?: string;
  auGrpID?: number;
  catDesc?: string;
  catValue?: string;
  totalItems: number;
  totalConsumedQty: number;
  totalValue: number;
  rActiveYN?: string;
  rCreatedBy?: string;
  rCreatedID?: number;
  rCreatedOn?: Date;
  rModifiedBy?: string;
  rModifiedID?: number;
  rModifiedOn?: Date;
  details?: ProductConsumptionDetailDto[];
}

export interface ProductConsumptionDetailDto extends BaseDto {
  deptConsDetID: number;
  deptConsID: number;
  psdid: number;
  pisid: number;
  psbid: number;
  pGrpID?: number;
  pGrpName?: string;
  productID: number;
  productCode?: string;
  productName: string;
  catValue: string;
  catDesc: string;
  mfID?: number;
  mfName?: string;
  pUnitID?: number;
  pUnitName?: string;
  pUnitsPerPack?: number;
  pkgID?: number;
  pkgName?: string;
  batchNo?: string;
  expiryDate?: Date;
  unitPrice?: number;

  tax?: number;
  sellUnitPrice?: number;
  affectedQty?: number;
  affectedUnitQty?: number;
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
  grnDetID: number;
  grnDate: Date;
  auGrpID: number;
  totalValue?: number;
  availableQty?: number;
  consumptionRemarks?: string;
  rActiveYN?: string;
}

export interface ProductConsumptionCompositeDto {
  productConsumption: ProductConsumptionMastDto;
  consumptionDetails: ProductConsumptionDetailDto[];
  totalItems: number;
  totalConsumedQty: number;
  totalValue: number;
}

export interface ProductConsumptionSearchRequest extends BaseDto {
  pageIndex: number;
  pageSize: number;
  dateFilterType?: DateFilterType;
  startDate?: Date;
  endDate?: Date;
  departmentID?: number;
  deptConsCode?: string;
  productName?: string;
  productGroupID?: number;
  sortBy?: string;
  sortAscending?: boolean;
  minConsumedQty?: number;
  maxConsumedQty?: number;
  categoryValue?: string;
}

export interface ValidateConsumptionStockRequest {
  departmentId: number;
  consumptionDetails: ProductConsumptionDetailDto[];
}

export enum DateFilterType {
  Today = "Today",
  LastOneWeek = "LastOneWeek",
  LastOneMonth = "LastOneMonth",
  LastThreeMonths = "LastThreeMonths",
  Custom = "Custom",
}

// Utility functions
export const calculateTotalItems = (details: ProductConsumptionDetailDto[]): number => {
  return details?.length || 0;
};

export const calculateTotalConsumedQty = (details: ProductConsumptionDetailDto[]): number => {
  return details?.reduce((sum, detail) => sum + (detail.affectedQty || 0), 0) || 0;
};

export const calculateTotalValue = (details: ProductConsumptionDetailDto[]): number => {
  return details?.reduce((sum, detail) => sum + (detail.totalValue || 0), 0) || 0;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const getConsumptionCodePrefix = (): string => {
  return "CONS";
};

export const getConsumptionTypeName = (): string => {
  return "Department Consumption";
};
