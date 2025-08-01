// src/interfaces/InventoryManagement/Product/GrnProductSearch.interface.ts
export interface GrnProductOption {
  productID: number;
  productCode?: string;
  productName: string;
  productCategory?: string;
  manufacturerName?: string;
  batchNo?: string;
  expiryDate?: Date;
  availableQty?: number;
  unitPrice?: number;
  grnDetID: number;
  grnID: number;
  grnCode?: string;
  grnDate?: Date;
  deptID: number;
  deptName?: string;
  supplierName?: string;
  rActiveYN: string;
  hsnCode: string;

  // Key fields from GrnDetailDto
  recvdQty?: number;
  acceptQty?: number;
  freeItems?: number;
  tax?: number;
  sellUnitPrice?: number;
  mrp?: number;
  mfID?: number;
  mfName?: string;

  // Additional GRN fields
  invoiceNo?: string;
  invDate?: string;
  supplierID?: number;
  supplrID?: number;
  supplrName?: string;
}

export interface GrnProductSearchResult {
  productID: number;
  productCode?: string;
  productName?: string;
  catValue: string;
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
  availableQty?: number;
  prescriptionYN?: string;
  expiryYN?: string;
  sellableYN?: string;
  taxableYN?: string;
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
  grnDetID: number;
  grnID: number;
  grnCode?: string;
  grnDate?: Date;
  deptID: number;
  deptName?: string;
  supplierID?: number;
  supplierName?: string;
  defaultPrice?: number;
  rActiveYN: string;

  // Critical fields for Stock Return
  recvdQty?: number;
  acceptQty?: number;
  invoiceNo?: string;
  invDate?: string;

  // Additional fields from GRN
  supplrID?: number;
  supplrName?: string;
  freeItems?: number;
}
