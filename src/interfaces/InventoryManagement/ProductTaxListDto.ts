export interface ProductTaxListDto {
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
