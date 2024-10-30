import { BaseDto } from "../../services/GenericEntityService/GenericEntityService";
import { BaseHistoryDto } from "./BaseHistoryDto";

export interface OPIPHistAllergyMastDto extends BaseHistoryDto {
  opipAlgId?: number;
  opipDate: Date;
  allergyDetails: OPIPHistAllergyDetailDto[];
}

export interface OPIPHistAllergyDetailDto extends BaseDto {
  opipAlgDetailId: number;
  opipAlgId: number;
  mfId: number;
  mfName: string;
  mlId: Number;
  medText: string;
  mGenId: number;
  mGenName: string;
}
