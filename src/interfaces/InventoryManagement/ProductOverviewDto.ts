import { BaseDto } from "../../services/GenericEntityService/GenericEntityService";

export interface ProductOverviewDto extends BaseDto {
  pvID: number;
  productID: number;
  productCode?: string;
  fsbCode: string;
  rackNo?: string;
  shelfNo?: string;
  minLevelUnits?: number;
  maxLevelUnits?: number;
  dangerLevelUnits?: number;
  reOrderLevel?: number;
  avgDemand?: number;
  stockLevel?: number;
  supplierAllocation: string;
  poStatus: string;
  deptID: number;
  department?: string;
  defaultYN: string;
  isAutoIndentYN: string;
  productLocation?: string;
  rActiveYN: string;
  compID: number;
  compCode: string;
  compName: string;
  transferYN: string;
  rNotes?: string;
}
