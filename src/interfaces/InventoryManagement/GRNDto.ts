import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface GRNMastDto extends BaseDto {
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
  grnDetails?: GRNDetailDto[];
}

export interface GRNDetailDto extends BaseDto {
  grnDetID: number;
  grnID: number;
  pGrpID?: number;
  pGrpName?: string;
  productID: number;
  productCode?: string;
  productName?: string;
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
  psGrpName?: string;
  refNo?: string;
  hsnCode?: string;
  cgstPerValue?: number;
  cgstTaxAmt?: number;
  sgstPerValue?: number;
  sgstTaxAmt?: number;
  taxableAmt?: number;
  defaultPrice: number;
  //
  _recievedQty: number;
  _serialNo: number;
  _pastReceivedPack: number;
  _unitPrice: number;
  _sellingUnitPrice: number;
}

export interface GRNDto {
  gRNMastDto: GRNMastDto;
  gRNDetailsDto: GRNDetailDto[];
}

export const initialMastData: GRNMastDto = {
  grnID: 0,
  deptID: 0,
  deptName: "",
  grnDate: new Date().toISOString(),
  invoiceNo: "",
  invDate: new Date().toISOString(),
  supplrID: 0,
  supplrName: "",
  tot: 0,
  disc: 0,
  netTot: 0,
  auGrpID: 18,
  balanceAmt: 0,
  catDesc: "REVENUE",
  catValue: "MEDI",
  coinAdj: 0,
  dcNo: ".",
  discPercentageYN: "N",
  grnApprovedBy: "",
  grnApprovedID: 0,
  grnApprovedYN: "Y",
  grnStatusCode: "COMP",
  grnStatus: "Completed",
  otherAmt: 0,
  poCoinAdjAmt: 0,
  poDate: new Date().toISOString(),
  poDiscAmt: 0,
  poID: 0,
  poNo: "",
  poTotalAmt: 0,
  taxAmt: 0,
  transDeptID: 0,
  transDeptName: "",
  grnCode: "",
  grnType: "INV",
  totalTaxableAmt: 0,
  netCGSTTaxAmt: 0,
  netSGSTTaxAmt: 0,
  grnDetails: [],
  rActiveYN: "Y",
  transferYN: "N",
  rNotes: null,
  pODate: new Date().toISOString(),
};
