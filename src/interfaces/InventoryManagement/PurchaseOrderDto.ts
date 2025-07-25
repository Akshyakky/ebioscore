import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";
import { ProductSearchResult } from "./Product/ProductSearch.interface";
import { ProductListDto } from "./ProductListDto";

export interface PurchaseOrderMastDto extends BaseDto {
  pOID: number;
  supplierID: number;
  supplierName?: string;
  fromDeptID: number;
  fromDeptName?: string;
  pODate: string;
  auGrpID?: number;
  catDesc?: string;
  catValue?: string;
  coinAdjAmt?: number;
  discAmt?: number;
  netAmt?: number;
  pOAcknowledgement?: string;
  pOApprovedBy?: string;
  pOApprovedID?: number;
  pOApprovedNo?: string;
  pOApprovedYN: "Y" | "N";
  pOCode?: string;
  pOSActionNo?: string;
  pOTypeValue?: string;
  pOType?: string;
  taxAmt?: number;
  totalAmt?: number;
  pOStatusCode?: string;
  pOStatus?: string;
  netCGSTTaxAmt?: number;
  netSGSTTaxAmt?: number;
  totalTaxableAmt?: number;
  rActiveYN: "Y" | "N";
  transferYN: "Y" | "N";
  rNotes?: string;
  disableApprovedFields?: boolean;
}

export interface PurchaseOrderDetailDto extends BaseDto {
  pODetID: number;
  pOID: number;
  indentID: number;
  indentDetID: number;
  productID: number;
  productCode?: string;
  catValue?: string;
  pGrpID: number;
  pSGrpID: number;
  pUnitID: number;
  pUnitName?: string;
  pPkgID?: number;
  unitPack?: number;
  requiredUnitQty?: number;
  requiredPack?: number;
  pOYN: string;
  grnDetID?: number;
  receivedQty?: number;
  manufacturerID?: number;
  manufacturerCode?: string;
  manufacturerName?: string;
  discAmt?: number;
  discPercentageAmt?: number;
  freeQty?: number;
  isFreeItemYN: string;
  mfID?: number;
  mrpAbdated?: number;
  netAmount?: number;
  pODetStatusCode?: string;
  profitOnMrp?: number;
  taxAfterDiscOnMrp: string;
  taxAfterDiscYN: string;
  taxAmtOnMrp?: number;
  taxAmt?: number;
  taxModeCode?: string;
  taxModeDescription: string;
  taxModeID?: number;
  taxOnFreeItemYN: string;
  taxOnMrpYN: string;
  taxOnUnitPrice: string;
  totAmt: number;
  catDesc?: string;
  mfName?: string;
  pGrpName?: string;
  pPkgName?: string;
  productName?: string;
  pSGrpName?: string;
  hsnCode?: string;
  cgstPerValue?: number;
  cgstTaxAmt?: number;
  sgstPerValue?: number;
  sgstTaxAmt?: number;
  transferYN: string;
  rNotes?: string;
  gstPerValue?: number;
  gstTaxAmt?: number;
  taxableAmt?: number;
  unitPrice?: number;
}

export interface purchaseOrderSaveDto extends BaseDto {
  purchaseOrderMastDto: PurchaseOrderMastDto;
  purchaseOrderDetailDto: PurchaseOrderDetailDto[];
}

export interface PurchaseOrderFormData {
  purchaseOrderMast: PurchaseOrderMastDto;
  purchaseOrderDetails: PurchaseOrderDetailDto[];
  selectedProduct?: ProductSearchResult | null;
}

export const initialPOMastDto: PurchaseOrderMastDto = {
  pOID: 0,
  supplierID: 0,
  supplierName: "",
  fromDeptID: 0,
  fromDeptName: "",
  pODate: "",
  auGrpID: 0,
  catDesc: "",
  catValue: "",
  coinAdjAmt: 0,
  discAmt: 0,
  netAmt: 0,
  pOAcknowledgement: "",
  pOApprovedBy: "",
  pOApprovedID: 0,
  pOApprovedNo: "",
  pOApprovedYN: "N",
  pOCode: "",
  pOSActionNo: "",
  pOTypeValue: "",
  pOType: "",
  taxAmt: 0,
  totalAmt: 0,
  pOStatusCode: "",
  pOStatus: "",
  netCGSTTaxAmt: 0,
  netSGSTTaxAmt: 0,
  totalTaxableAmt: 0,
  rActiveYN: "Y",
  transferYN: "Y",
  rNotes: "",
};
export interface DepartmentInfo {
  departmentId: number;
  departmentName: string;
}
export interface DiscountFooterProps {
  totDiscAmtPer?: number;
  isDiscPercentage?: boolean;
}

export interface PurchaseOrderState {
  departmentInfo: DepartmentInfo | null;
  purchaseOrderMastData: PurchaseOrderMastDto | null;
  purchaseOrderDetails: PurchaseOrderDetailDto[];
  selectedProduct: ProductListDto | null;
  discountFooter: DiscountFooterProps;
  disableApprovedFields: boolean;
}

export interface PurchaseOrderHeaderProps {
  handleDepartmentChange: () => void;
}
