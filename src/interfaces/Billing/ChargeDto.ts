// src/interfaces/Billing/ChargeDto.ts

import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface BChargeDto extends BaseDto {
  chargeID: number;
  chargeCode: string;
  chargeDesc: string;
  chargesHDesc?: string;
  chargeDescLang?: string;
  cShortName?: string;
  chargeType: string;
  chargeTo: string;
  chargeStatus: string;
  chargeBreakYN: "Y" | "N";
  regServiceYN?: "Y" | "N";
  regDefaultServiceYN?: "Y" | "N";
  isBedServiceYN?: "Y" | "N";
  doctorShareYN?: "Y" | "N";
  cNhsCode?: string;
  cNhsEnglishName?: string;
  chargeCost?: number;
  serviceGroupID?: number;
  rActiveYN?: "Y" | "N";
  rTransferYN?: "Y" | "N";
  rNotes?: string;
  ChargeDetails: BChargeDetailDto[];
  DoctorShares: BDoctorSharePercShareDto[];
  ChargeAliases: BChargeAliasDto[];
  ChargeFaculties: BChargeFacultyDto[];
  ChargePacks: BChargePackDto[];
}

export interface BDoctorSharePercShareDto extends BaseDto {
  docShareID: number;
  chargeID: number;
  conID: number;
  doctorShare: number;
  hospShare: number;
  rActiveYN?: "Y" | "N";
  rTransferYN?: "Y" | "N";
  rNotes?: string;
}

export interface BChargeDetailDto extends BaseDto {
  chDetID: number;
  chargeID: number;
  pTypeID: number;
  wCatID: number;
  DcValue?: number;
  hcValue?: number;
  chValue: number;
  chargeStatus: string;
  rActiveYN?: "Y" | "N";
  rTransferYN?: "Y" | "N";
  rNotes?: string;
  ChargePacks: BChargePackDto[];
}

export interface BChargePackDto extends BaseDto {
  chPackID: number;
  chargeID: number;
  chDetID?: number;
  chargeRevise: string;
  chargeStatus: string;
  dcValue?: number;
  hcValue?: number;
  chValue: number;
  effectiveFromDate?: Date;
  effectiveToDate?: Date;
  rActiveYN?: "Y" | "N";
  rTransferYN?: "Y" | "N";
  rNotes?: string;
}

export interface BChargeFacultyDto extends BaseDto {
  chFacID: number;
  chargeID: number;
  aSubID: number;
  rActiveYN?: "Y" | "N";
  rTransferYN?: "Y" | "N";
  rNotes?: string;
}

export interface BChargeAliasDto extends BaseDto {
  chAliasID: number;
  chargeID: number;
  pTypeID: number;
  chargeDesc: string;
  chargeDescLang: string;
  rActiveYN?: "Y" | "N";
  rTransferYN?: "Y" | "N";
  rNotes?: string;
}

export interface ChargeWithAllDetailsDto extends BChargeDto {}

export interface ChargeCodeGenerationDto {
  ChargeType: string;
  ChargeTo: string;
  ServiceGroupId?: number;
}
