import { BaseDto } from "../../services/GenericEntityService/GenericEntityService";

export interface InsuranceListDto extends BaseDto {
  insurID: number;
  insurCode: string;
  insurName: string;
  insurStreet?: string;
  insurStreet1?: string;
  insurCity?: string;
  insurState?: string;
  insurCountry?: string;
  insurPostCode?: string;
  insurContact1?: string;
  insurContact2?: string;
  insurPh1?: string;
  insurPh2?: string;
  insurEmail?: string;
  inCategory?: string;
  rActiveYN: string;
  rNotes?: string;
  compID: number;
  compCode: string;
  compName: string;
  transferYN: string;
}
