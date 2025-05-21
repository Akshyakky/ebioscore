import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface IpDischargeDto extends BaseDto {
  dischgID: number;
  pChartID: number;
  admitID: number;
  dischgDate: Date;
  dischgTime: Date;
  dischgStatus: string;
  dischgPhyID?: number;
  dischgPhyName?: string;
  releaseBedYN: "Y" | "N";
  authorisedBy?: string;
  deliveryType?: string;
  dischargeCode?: string;
  dischgSumYN: "Y" | "N";
  facultyID?: number;
  faculty?: string;
  dischgType?: string;
  pChartCode?: string;
  pTitle: string;
  pfName?: string;
  pmName?: string;
  plName?: string;
  defineStatus?: string;
  defineSituation?: string;
  situation?: string;
  rActiveYN: "Y" | "N";
  transferYN: "Y" | "N";
  rNotes?: string;
}
