import { BaseDto } from "../../services/GenericEntityService/GenericEntityService";
import { RecordFields } from "../Common/RecordFields";
export interface ChargeDetailsDto extends BaseDto {
  chargeInfo: BChargeDto;
  chargeDetails: BChargeDetailsDto[];
  chargeAliases: BChargeAliasDto[];
  chargeFaculties?: BChargeFacultyDto[];
  chargePackDetails?: BChargePackDto[];
}
export interface BChargeDto extends RecordFields {
  chargeID: number;
  chargeCode: string;
  chargeDesc: string;
  chargesHDesc?: string;
  chargeDescLang?: string;
  cShortName: string;
  chargeType: string;
  sGrpID: number;
  chargeTo: string;
  chargeStatus: string;
  chargeBreakYN: string;
  bChID: number;
  regServiceYN?: string;
  regDefaultServiceYN?: string;
  isBedServiceYN?: string;
  doctorShareYN?: string;
  cNhsCode?: string;
  cNhsEnglishName?: string;
  nhsCstWt?: string;
  chargeCost?: string;
  scheduleDate?: Date;
  picName?: string;
  wardCategoryName?: string;
  serviceGroupName?: string;
  facultyNames?: string;
}
export interface BChargeDetailsDto extends RecordFields {
  chDetID: number;
  chargeID: number;
  pTypeID: number;
  wCatID: number;
  dcValue?: number;
  hcValue?: number;
  chValue: number;
  chargeStatus: string;
  serviceGroupName?: string;
  facultyNames?: string;
}
export interface BChargeAliasDto extends RecordFields {
  chaliasID: number;
  chargeID: number;
  pTypeID: number;
  chargeDesc: string;
  chargeDescLang: string;
  picName?: string;
  wardCategoryName?: string;
}
export interface BChargeFacultyDto extends RecordFields {
  bchfID: number;
  chargeID: number;
  aSubID: number;
}
export interface BChargePackDto extends RecordFields {
  pkDetID: number;
  chDetID: number;
  chargeID: number;
  chargeRevise: string;
  chargeStatus: string;
  DcValue: number;
  hcValue: number;
  chValue: number;
}
