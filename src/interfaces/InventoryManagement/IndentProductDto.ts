import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface IndentSaveRequestDto extends BaseDto {
  IndentMaster: IndentMastDto;
  IndentDetails: IndentDetailDto[];
}

export interface IndentMastDto extends BaseDto {
  indentID: number;
  fromDeptID?: number;
  fromDeptName?: string;
  pChartID?: number;
  toDeptID?: number;
  toDeptName?: string;
  indentDate?: string;
  auGrpID?: number;
  autoIndentYN?: string;
  catDesc?: string;
  catValue?: string;
  indentAcknowledgement?: string;
  indentApprovedYN?: string;
  indentCode?: string;
  indentTypeValue?: string;
  indentType?: string;
  indexpiryYN?: string;
  indGrnStatusCode?: string;
  indGrnStatus?: string;
  pChartCode?: string;
  transferYN?: string;
  indStatusCode?: string;
  indStatus?: string;
  remarks?: string;
  oldPChartID?: number;
}

export interface IndentDetailDto extends BaseDto {
  indentDetID: number;
  indentID?: number;
  productID?: number;
  productCode?: string;
  catValue?: string;
  pGrpID?: number;
  rOL?: number;
  expiryYN?: string;
  ppkgID?: number;
  psGrpID?: number;
  pUnitID?: number;
  pUnitName?: string;
  unitPack?: number;
  requiredQty?: number;
  requiredUnitQty?: number;
  poNo?: number;
  deptIssualYN: string;
  receivedQty?: number;
  manufacturerID?: number;
  manufacturerCode?: string;
  manufacturerName?: string;
  deptIssualID?: number;
  grnDetID?: number;
  imrMedID?: number;
  indentDetStatusCode?: string;
  indGrnDetStatusCode?: string;
  supplierID?: number;
  supplierName?: string;
  catDesc?: string;
  mfName?: string;
  pGrpName?: string;
  ppkgName?: string;
  productName?: string;
  psGrpName?: string;
  hsnCode?: string;
  tax?: number;
  cgstPerValue?: number;
  sgstPerValue?: number;
}
