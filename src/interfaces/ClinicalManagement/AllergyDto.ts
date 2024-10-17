export interface OPIPHistAllergyMastDto {
  opipAlgId?: number;
  pchartId: number;
  opipNo: number;
  opipCaseNo: number;
  allergyDetails: OPIPHistAllergyDetailDto[];
}

export interface OPIPHistAllergyDetailDto {
  opipAlgId: number;
  medicationName: string;
  formName: string;
  genericName: string;
}
