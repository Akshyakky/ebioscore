export interface AlertDto {
  payID: number;
  oPIPAlertID: number;
  oPIPNo: number;
  oPVID: number;
  pChartID: number;
  oPIPCaseNo: number;
  patOPIPYN: string;
  oPIPDate: Date;
  alertDescription: string;
  rActiveYN: string;
  rCreatedOn: Date;
  rCreatedID: number;
  rCreatedBy: string;
  rModifiedOn: Date;
  rModifiedID: number;
  rModifiedBy: string;
  category: string;
  oldPChartID: number;
  pChartCode: string;
}
