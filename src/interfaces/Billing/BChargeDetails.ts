// Represents the main structure of ChargeDetailsDto
export interface ChargeDetailsDto {
  chargeInfo: BChargeDto;
  chargeDetails: BChargeDetailsDto[];
  chargeAliases: BChargeAliasDto[];
}

// Represents the structure of BChargeDto
export interface BChargeDto {
  rActiveYN: string;
  compID: number;
  compCode: string;
  compName: string;
  transferYN: string;
  rNotes: string;
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
export interface BChargeDetailsDto {
  rActiveYN: string;
  compID: number;
  compCode: string;
  compName: string;
  transferYN: string;
  rNotes: string;
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
export interface BChargeAliasDto {
  rActiveYN: string;
  compID: number;
  compCode: string;
  compName: string;
  transferYN: string;
  rNotes: string;
  chaliasID: number;
  chargeID: number;
  pTypeID: number;
  chargeDesc: number;
  chargeDescLang: number;
}
