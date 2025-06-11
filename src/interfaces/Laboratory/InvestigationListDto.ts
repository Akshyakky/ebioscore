import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface InvestigationListDto extends BaseDto {
  lInvMastDto: LInvMastDto;
  lComponentsDto: LComponentDto[];
}

export interface LInvMastDto extends BaseDto {
  invID: number;
  invName?: string;
  invTypeCode?: string;
  invReportYN: string;
  invSampleYN: string;
  invTitle?: string;
  invSTitle?: string;
  invPrintOrder: number;
  bchID: number;
  invCode?: string;
  invType?: string;
  invNHCode?: string;
  invNHEnglishName?: string;
  invNHGreekName?: string;
  invSampleType?: string;
  invShortName?: string;
  methods?: string;
  coopLabs?: string;
  transferYN?: string;
  rActiveYN: string;
}

export interface LComponentDto extends BaseDto {
  invID: number;
  invName: string;
  mGrpID?: number;
  mGrpName?: string;
  stitID?: number;
  stitName?: string;
  compInterpret?: string;
  compUnit?: string;
  compOrder?: number;
  lCentID: number;
  lCentName: string;
  lCentType: string;
  compDetailYN: string;
  deltaValPercent?: number;
  compoCode?: string;
  compoID: number;
  compoName?: string;
  compoTitle?: string;
  invCode?: string;
  cNHSCode?: string;
  cNHSEnglishName?: string;
  cNHSGreekName?: string;
  cShortName?: string;
  rActiveYN: string;
  transferYN: string;
  rNotes?: string;
}

export interface LComponentEntryTypeDto extends BaseDto {
  lCentID: number;
  lCentName: string;
  lCentDesc: string;
  lCentType: string;
  langType: string;
  rActiveYN: string;
  transferYN: string;
  rNotes?: string;
}

export interface LCompMultipleDto extends BaseDto {
  cmID: number;
  cmValues?: string;
  compOID?: number;
  invID?: number;
  defaultYN?: string;
  rActiveYN: string;
  transferYN: string;
  rNotes?: string;
}
export interface LCompAgeRangeDto extends BaseDto {
  carID: number;
  cappID?: number;
  compoID?: number;
  carName?: string;
  carSex?: string;
  carStart: number;
  carEnd: number;
  carAgeType?: string;
  carSexValue?: string;
  carAgeValue?: string;
  cappName: string;
  cappOrder?: number;
  rActiveYN: string;
  transferYN: string;
  rNotes?: string;
}
export interface LCompNormalDto extends BaseDto {
  cnID: number;
  compoID?: number;
  carID?: number;
  cnUpper: number;
  cnLower: number;
  cnApply?: string;
  cnSex?: string;
  cnAgeLmt?: string;
  cnUnits: string;
  rActiveYN: string;
  transferYN: string;
  rNotes?: string;
}
export interface LCompTemplateDto extends BaseDto {
  cTID: number;
  tGroupID: number;
  tGroupName?: string;
  cTText?: string;
  isBlankYN?: string;
  compOID?: number;
  rActiveYN: string;
  transferYN: string;
  rNotes?: string;
  invID?: number;
}
