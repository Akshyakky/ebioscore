import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface InvestigationListDto extends BaseDto {
  lInvMastDto: LInvMastDto;
  lComponentsDto: LComponentDto[];
}

export interface LInvMastDto extends BaseDto {
  invID: number;
  invName?: string;
  invCode?: string;
  invTypeCode?: string;
  invReportYN: string;
  invSampleYN: string;
  invTitle?: string;
  invSTitle?: string;
  invPrintOrder: number;
  bchID: number;
  invType?: string;
  invNHCode?: string;
  invNHEnglishName?: string;
  invNHGreekName?: string;
  invSampleType?: number;
  invShortName?: string;
  methods?: string;
  coopLabs?: string;
  transferYN?: string;
  rActiveYN: string;
}

export interface LComponentDto extends BaseDto {
  compoID: number;
  compoCode?: string;
  compoName: string;
  compoTitle?: string;
  invID: number;
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
  cNHSCode?: string;
  cNHSEnglishName?: string;
  cNHSGreekName?: string;
  cShortName?: string;
  rActiveYN: string;
  transferYN: string;
  rNotes?: string;
  lCompMultipleDto?: LCompMultipleDto[];
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
  compoID?: number;
  invID?: number;
  defaultYN?: string;
  rActiveYN: string;
  transferYN: string;
  rNotes?: string;
}
export interface LCompAgeRangeDto extends BaseDto {
  carID: number;
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
