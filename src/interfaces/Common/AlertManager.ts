import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface AlertDto extends BaseDto {
  oPIPAlertID: number;
  oPIPNo: number;
  oPVID: number;
  pChartID: number;
  oPIPCaseNo: number;
  patOPIPYN: string;
  oPIPDate: string;
  alertDescription: string;
  rActiveYN: string;
  category: string;
  oldPChartID: number;
  pChartCode: string;
}
