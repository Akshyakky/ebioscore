import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

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
  taxModeCode?: string;
  taxModeDescription?: string;
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
  taxableAmt?: number;
  transferYN: string;
  rNotes?: string;
}

export interface purchaseOrderSaveDto {
  purchaseOrderMast: PurchaseOrderMastDto;
  purchaseOrderDetail: PurchaseOrderDetailDto[];
}
