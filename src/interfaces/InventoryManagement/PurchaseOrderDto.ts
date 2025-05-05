import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";
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
  pOApprovedYN: string;
  pOCode?: string;
  pOSActionNo?: string;
  pOTypeValue?: string;
  pOType?: string;
  taxAmt?: number;
  totalAmt?: number;
  pOStatusCode?: string;
  pOStatus?: string;
  netCGSTTaxAmt: number;
  netSGSTTaxAmt?: number;
  totalTaxableAmt?: number;
  rActiveYN: string;
  transferYN: string;
  rNotes?: string;
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
  taxModeCode: string;
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
  hsnCode: string;
  cgstPerValue?: number;
  cgstTaxAmt?: number;
  sgstPerValue?: number;
  sgstTaxAmt?: number;
  taxableAmt?: number;
  transferYN: string;
  rNotes?: string;
  gstPerValue?: number;
}

export interface purchaseOrderSaveDto extends BaseDto {
  purchaseOrderMastDto: PurchaseOrderMastDto;
  purchaseOrderDetailDto: PurchaseOrderDetailDto[];
}

export interface GridRowData extends PurchaseOrderDetailDto {}

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
}

export interface PurchaseOrderHeaderProps {
  handleDepartmentChange: () => void;
}
