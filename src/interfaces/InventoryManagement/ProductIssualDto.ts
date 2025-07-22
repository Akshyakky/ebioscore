import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export enum IssualType {
  Department = 1,
  Physician = 2,
}

export interface ProductIssualDto extends BaseDto {
  pisid: number;
  pisDate: Date;
  issualType: IssualType;

  // Source Department (Always Required)
  fromDeptID: number;
  fromDeptName: string;

  // Department Issual Fields (Required for Department Issual)
  toDeptID: number;
  toDeptName: string;

  // Physician Issual Fields (Not used in Department Issual)
  recConID?: number;
  recConName?: string;

  auGrpID?: number;
  catDesc?: string;
  catValue?: string;
  indentNo?: string;
  pisCode?: string;
  approvedYN: string;
  approvedID?: number;
  approvedBy?: string;

  details?: ProductIssualDetailDto[];

  // Computed Properties
  readonly totalItems: number;
  readonly totalRequestedQty: number;
  readonly totalIssuedQty: number;
  readonly issualTypeName: string;
  readonly destinationInfo: string;
  readonly destinationID: number | null;
  readonly issualCodePrefix: string;
}

export interface ProductIssualDetailDto extends BaseDto {
  pisDetID: number;
  pisid: number;
  productID: number;
  productCode?: string;
  productName: string;
  catValue?: string;
  catDesc?: string;
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
  requestedQty: number;
  issuedQty: number;
  availableQty?: number;
  expiryYN?: string;
  psGrpID?: number;
  psGrpName?: string;
  pGrpID?: number;
  pGrpName?: string;
  taxID?: number;
  taxCode?: string;
  taxName?: string;
  hsnCode?: string;
  mrp?: number;
  manufacturerID?: number;
  manufacturerCode?: string;
  manufacturerName?: string;
  psbid?: number;
  remarks?: string;
}

export interface ProductIssualCompositeDto {
  productIssual: ProductIssualDto;
  details: ProductIssualDetailDto[];
}

export interface ProductIssualSearchRequest {
  pageIndex: number;
  pageSize: number;
  issualType?: IssualType;
  fromDepartmentID?: number;
  toDepartmentID?: number;
  physicianID?: number;
  pisCode?: string;
  indentNo?: string;
  approvedStatus?: string;
  startDate?: Date;
  endDate?: Date;
  dateFilterType?: eDateFilterType;
  sortBy?: string;
  sortAscending?: boolean;
}

export enum eDateFilterType {
  Today = 1,
  LastOneWeek = 2,
  LastOneMonth = 3,
  LastThreeMonths = 4,
  Custom = 5,
}

export interface ProductStockBalance {
  psbID: number;
  deptID: number;
  deptName?: string;
  productID: number;
  productCode: string;
  productName?: string;
  catValue?: string;
  categoryDescription?: string;
  mfID?: number;
  mfName?: string;
  manufacturerID?: number;
  manufacturerCode?: string;
  manufacturerName?: string;
  productUnitID?: number;
  productUnitName?: string;
  unitsPerPack?: number;
  productPackageID?: number;
  productPackageName?: string;
  batchNumber?: string;
  expiryDate?: Date;
  unitPrice?: number;
  tax?: number;
  sellUnitPrice?: number;
  productQuantityOnHand?: number;
  productUnitQuantityOnHand?: number;
  goodsReceiptNoteDate?: Date;
  prescriptionRequired?: string;
  isExpirable?: string;
  isSellable?: string;
  isTaxable?: string;
  productSubGroupID?: number;
  productSubGroupName?: string;
  productGroupName?: string;
  taxID?: number;
  taxCode?: string;
  taxName?: string;
  auGrpID?: number;
  goodsReceiptNoteDetailID?: number;
  maximumRetailPrice?: number;
  hsnCode?: string;
  rActiveYN?: string;
}

// Default values for Department Issual
export const defaultProductIssualDto = (): ProductIssualDto => ({
  pisid: 0,
  pisDate: new Date(),
  issualType: IssualType.Department,
  fromDeptID: 0,
  fromDeptName: "",
  toDeptID: 0,
  toDeptName: "",
  approvedYN: "N",
  catValue: "MEDI",
  catDesc: "REVENUE",
  auGrpID: 18,
  totalItems: 0,
  totalRequestedQty: 0,
  totalIssuedQty: 0,
  issualTypeName: "Department Issual",
  destinationInfo: "",
  destinationID: null,
  issualCodePrefix: "DIS",
});

export const defaultProductIssualDetailDto = (): ProductIssualDetailDto => ({
  pisDetID: 0,
  pisid: 0,
  productID: 0,
  productCode: "",
  productName: "",
  requestedQty: 0,
  issuedQty: 0,
  catValue: "MEDI",
  catDesc: "REVENUE",
  expiryYN: "N",
  pUnitsPerPack: 1,
});

export const defaultProductIssualCompositeDto = (): ProductIssualCompositeDto => ({
  productIssual: defaultProductIssualDto(),
  details: [],
});

export const defaultProductIssualSearchRequest = (): ProductIssualSearchRequest => ({
  pageIndex: 1,
  pageSize: 20,
  issualType: IssualType.Department,
  sortBy: "PISDate",
  sortAscending: false,
});

// Utility functions for Department Issual
export const isIssualEditable = (issual: ProductIssualDto): boolean => {
  return issual.approvedYN !== "Y";
};

export const isIssualApprovable = (issual: ProductIssualDto): boolean => {
  return issual.approvedYN !== "Y";
};

export const isIssualDeletable = (issual: ProductIssualDto): boolean => {
  return issual.approvedYN !== "Y";
};

export const calculateTotalItems = (details: ProductIssualDetailDto[]): number => {
  return details?.length ?? 0;
};

export const calculateTotalRequestedQty = (details: ProductIssualDetailDto[]): number => {
  return details?.reduce((sum, detail) => sum + detail.requestedQty, 0) ?? 0;
};

export const calculateTotalIssuedQty = (details: ProductIssualDetailDto[]): number => {
  return details?.reduce((sum, detail) => sum + detail.issuedQty, 0) ?? 0;
};

export const calculateIssualValue = (details: ProductIssualDetailDto[]): number => {
  return details.reduce((total, detail) => {
    const itemValue = (detail.unitPrice || 0) * detail.issuedQty;
    const taxValue = itemValue * ((detail.tax || 0) / 100);
    return total + itemValue + taxValue;
  }, 0);
};

export const getIssualTypeName = (issualType: IssualType): string => {
  return issualType === IssualType.Department ? "Department Issual" : "Physician Issual";
};

export const getIssualCodePrefix = (issualType: IssualType): string => {
  return issualType === IssualType.Department ? "DIS" : "PIS";
};

export const getExpiryStatus = (expiryDate?: Date): "EXPIRED" | "EXPIRING_SOON" | "EXPIRING_NORMAL" | "NORMAL" => {
  if (!expiryDate) return "NORMAL";

  const today = new Date();
  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "EXPIRED";
  if (diffDays <= 30) return "EXPIRING_SOON";
  if (diffDays <= 90) return "EXPIRING_NORMAL";
  return "NORMAL";
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatQuantity = (quantity: number): string => {
  return quantity.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
