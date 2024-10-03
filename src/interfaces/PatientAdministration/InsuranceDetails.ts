export interface InsuranceGridProps {
  data: OPIPInsurancesDto[];
  onEdit: (insurance: OPIPInsurancesDto) => void;
  onDelete: (id: number) => void;
}

export interface InsuranceFormProps {
  onSave: (insurance: OPIPInsurancesDto) => void;
  onCancel: () => void;
  initialData?: OPIPInsurancesDto;
}
export interface OPIPInsurancesDto {
  ID: number;
  oPIPInsID: number;
  pChartID: number;
  insurID: number;
  insurCode?: string;
  insurName: string;
  policyNumber?: string;
  policyHolder?: string;
  groupNumber?: string;
  policyStartDt: Date;
  policyEndDt: Date;
  guarantor?: string;
  relationVal: string;
  relation?: string;
  address1?: string;
  address2?: string;
  phone1?: string;
  phone2?: string;
  rActiveYN: string;
  rNotes?: string;
  compID?: number;
  compCode?: string;
  compName?: string;
  insurStatusCode?: string;
  insurStatusName?: string;
  pChartCode?: string;
  pChartCompID?: number;
  referenceNo?: string;
  transferYN?: string;
  coveredVal?: string;
  coveredFor?: string;
}
