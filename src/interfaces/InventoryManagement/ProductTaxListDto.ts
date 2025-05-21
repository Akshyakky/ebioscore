import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

export interface ProductTaxListDto extends BaseDto {
  pTaxID: number;
  pTaxCode: string;
  pTaxName?: string;
  pTaxAmt?: number;
  pTaxDescription?: string;
  rActiveYN: string;
  transferYN: string;
  rNotes?: string;
}
