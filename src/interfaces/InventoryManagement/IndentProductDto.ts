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
  toDeptID: number | string;
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
  oldPChartID?: number;
}

export interface IndentDetailDto extends BaseDto {
  indentDetID: number;
  indentID?: number;
  productID?: number;
  productCode?: string;
  catValue?: string;
  pGrpID?: number;
  expiryYN?: string;
  ppkgID?: number;
  psGrpID?: number;
  pUnitID?: string;
  pUnitName?: string;
  unitPack?: number;
  requiredQty: number;
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
  stockLevel?: number; // New Field
  qoh?: number; // New Field
  average?: number; // New Field
  reOrderLevel?: number; // New Field
  minLevelUnits?: number; // New Field
  maxLevelUnits?: number; // New Field
  location?: string; // New Field
  netValue?: number; // New Field
  unitsPackage?: number; // New Field
  units?: string; // New Field
  package?: string; // New Field
  groupName?: string; // New Field
  baseUnit?: number; // New Field
  leadTime?: number; // New Field
  averageDemand?: number; // New Field
  rol?: number; // New Field
  roq?: number; // New Field
}
