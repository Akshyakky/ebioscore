import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface investigationDto extends BaseDto {
  lInvMastDto: LInvMastDto;
  lComponentsDto: LComponentDto[];
  lCompMultipleDtos: LCompMultipleDto[];
  lCompAgeRangeDtos: LCompAgeRangeDto[];
  lCompTemplateDtos: LCompTemplateDto[];
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
  deptID: number;
  deptName?: string;
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
  invNameCD: string;
  mGrpID?: number;
  mGrpNameCD?: string;
  stitID?: number;
  stitNameCD?: string;
  compInterpretCD?: string;
  compUnitCD?: string;
  compOrder?: number;
  lCentID: number;
  lCentNameCD: string;
  lCentTypeCD: string;
  compDetailYN: string;
  deptID: number;
  deptNameCD?: string;
  deltaValPercent?: number;
  compOCodeCD?: string;
  compoID: number;
  compoNameCD?: string;
  compoTitleCD?: string;
  invCodeCD?: string;
  cNHSCodeCD?: string;
  cNHSEnglishNameCD?: string;
  cNHSGreekNameCD?: string;
  cShortNameCD?: string;
  rActiveYN: string;
  transferYN: string;
  rNotes?: string;
  indexID?: number;
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
  defaultYN?: string;
  rActiveYN: string;
  transferYN: string;
  rNotes?: string;
  invID?: number;
  indexID?: number;
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
  indexID?: number;
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
  indexID?: number;
}

export interface InvestigationFormErrors {
  invCode?: string;
  invName?: string;
  invShortName?: string;
  bchID?: string;
}

export interface ComponentFormErrors {
  compOCodeCD?: string;
  compoNameCD?: string;
  cShortNameCD?: string;
  lCentID?: string;
}
