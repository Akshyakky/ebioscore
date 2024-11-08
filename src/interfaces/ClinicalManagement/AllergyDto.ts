import { BaseDto } from "../../services/GenericEntityService/GenericEntityService";
import { RecordFields } from "../Common/RecordFields";
import { BaseHistoryDto } from "./BaseHistoryDto";

export interface AllergyDto extends BaseDto {
  opIPHistAllergyMastDto: OPIPHistAllergyMastDto;
  allergyDetails: OPIPHistAllergyDetailDto[];
}

export interface OPIPHistAllergyMastDto extends BaseHistoryDto {
  opipAlgId?: number;
  opipDate: Date;
}

export interface OPIPHistAllergyDetailDto extends RecordFields {
  opipAlgDetailId: number;
  opipAlgId: number;
  mfId: number;
  mfName: string;
  mlId: Number;
  medText: string;
  mGenId: number;
  mGenName: string;
}
