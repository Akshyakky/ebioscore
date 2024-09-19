import { BaseDto } from "../../services/GenericEntityService/GenericEntityService";

export interface ProductTaxListDto extends BaseDto {
  pTaxID: number;
  pTaxCode: string;
  pTaxName?: string;
  pTaxAmt?: number;
  pTaxDescription?: string;
  rActiveYN: string;
  compID: number;
  compCode: string;
  compName: string;
  transferYN: string;
  rNotes?: string;
}
