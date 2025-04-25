// src/interfaces/Common/AlertManager.ts
import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface AlertDto extends BaseDto {
  oPIPAlertID: number;
  oPIPNo: number;
  oPVID: number;
  pChartID: number;
  pChartCode?: string;
  oPIPCaseNo: number;
  patOPIPYN: "O" | "I" | string;
  oPIPDate: Date;
  alertDescription: string;
  rActiveYN: "Y" | "N";
  category: string;
  oldPChartID: number;
  transferYN: "Y" | "N";
}
