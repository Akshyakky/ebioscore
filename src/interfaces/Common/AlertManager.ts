import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface AlertDto extends BaseDto {
  payID: number;
  oPIPAlertID: number;
  oPIPNo: number;
  oPVID: number;
  pChartID: number;
  oPIPCaseNo: number;
  patOPIPYN: string;
  oPIPDate: string;
  alertDescription: string;
  rActiveYN: string;
  rCreatedOn: string;
  rCreatedID: number;
  rCreatedBy: string;
  rModifiedOn: string;
  rModifiedID: number;
  rModifiedBy: string;
  category: string;
  oldPChartID: number;
  pChartCode: string;
}
