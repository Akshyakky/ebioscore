import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface ProductIssualDto extends BaseDto {
  pisid: number;
  pisDate: Date;
  fromDeptID: number;
  fromDeptName: string;
  toDeptID: number;
  toDeptName: string;
  auGrpID?: number;
  catDesc?: string;
  catValue?: string;
  indentNo?: string;
  pisCode?: string;
  recConID?: number;
  recConName?: string;
  approvedYN: string;
  approvedID?: number;
  approvedBy?: string;
  details?: ProductIssualDetailDto[];
  readonly totalItems: number;
  readonly totalRequestedQty: number;
  readonly totalIssuedQty: number;
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
  rActiveYN: string; // New field for active status
  remarks?: string;
}

export interface ProductIssualCompositeDto {
  productIssual: ProductIssualDto;
  details: ProductIssualDetailDto[];
}

export interface ProductIssualSearchRequest {
  pageIndex: number;
  pageSize: number;
  fromDepartmentID?: number;
  toDepartmentID?: number;
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

export interface ProductIssualValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface StockValidationResult {
  isValid: boolean;
  insufficientStockProducts: {
    productName: string;
    available: number;
    requested: number;
  }[];
}

export interface ApprovalRequest {
  issualId: number;
  approverComments?: string;
}

export interface PrintOptions {
  issualId: number;
  includeDetails: boolean;
  includeStockMovement: boolean;
  format: "PDF" | "EXCEL";
}

export interface IssualStatistics {
  totalIssuals: number;
  approvedIssuals: number;
  pendingIssuals: number;
  todayIssuals: number;
  thisWeekIssuals: number;
  thisMonthIssuals: number;
  totalValue: number;
  averageProcessingTime: number;
}

export interface StockMovement {
  movementId: number;
  issualId: number;
  productId: number;
  productName: string;
  fromDepartmentId: number;
  fromDepartmentName: string;
  toDepartmentId: number;
  toDepartmentName: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  movementDate: Date;
  batchNumber?: string;
  expiryDate?: Date;
  reference: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
}

export interface AuditTrail {
  auditId: number;
  entityType: string;
  entityId: number;
  action: "CREATE" | "UPDATE" | "DELETE" | "APPROVE";
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  userId: number;
  userName: string;
  timestamp: Date;
  comments?: string;
}

export type {
  ProductIssualSearchRequest as IssualSearchRequest,
  ProductIssualCompositeDto as ProductIssualComposite,
  ProductIssualDetailDto as ProductIssualDetail,
  ProductIssualDto as ProductIssualMaster,
  ProductStockBalance as StockBalance,
};

export const defaultProductIssualDto = (): ProductIssualDto => ({
  pisid: 0,
  pisDate: new Date(),
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
  rActiveYN: "Y", // New field for active status
});

export const defaultProductIssualCompositeDto = (): ProductIssualCompositeDto => ({
  productIssual: defaultProductIssualDto(),
  details: [],
});

export const defaultProductIssualSearchRequest = (): ProductIssualSearchRequest => ({
  pageIndex: 1,
  pageSize: 20,
  sortBy: "PISDate",
  sortAscending: false,
});

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
