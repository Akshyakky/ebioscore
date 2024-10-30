// src/interfaces/Billing/BChargeDetails.ts

import { RecordFields } from "../Common/RecordFields";

// Represents the main structure of ChargeDetailsDto
export interface ChargeDetailsDto {
  chargeInfo: BChargeDto;
  chargeDetails: BChargeDetailsDto[];
  chargeAliases: BChargeAliasDto[];
  faculties: BChargeFacultyDto[]; // Include faculties here
}

// Represents the structure of BChargeDto
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
}

// Represents the structure of BChargeDetailsDto
export interface BChargeDetailsDto extends RecordFields {
  chDetID: number;
  chargeID: number;
  pTypeID: number;
  wCatID: number;
  dcValue?: number;
  hcValue?: number;
  chValue: number;
  chargeStatus: string;
}

// Represents the structure of BChargeAliasDto
export interface BChargeAliasDto extends RecordFields {
  chaliasID: number;
  chargeID: number;
  pTypeID: number;
  chargeDesc: string;
  chargeDescLang: string;
}

// Represents the structure of BChargeFacultyDto
export interface BChargeFacultyDto extends RecordFields {
  bchfID: number;
  chargeID: number;
  aSubID: number;
}
