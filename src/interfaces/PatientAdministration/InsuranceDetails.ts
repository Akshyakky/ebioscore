export interface InsuranceFormState {
  ID: number;
  OPIPInsID: number;
  PChartID: number;
  InsurID: number;
  InsurCode: string;
  InsurName: string;
  PolicyNumber: string;
  PolicyHolder: string;
  GroupNumber: string;
  PolicyStartDt: string;
  PolicyEndDt: string;
  Guarantor: string;
  RelationVal: string;
  Relation: string;
  Address1: string;
  Address2: string;
  Phone1: string;
  Phone2: string;
  RActiveYN: string;
  RCreatedID: number;
  RCreatedOn: string;
  RCreatedBy: string;
  RModifiedID: number;
  RModifiedOn: string;
  RModifiedBy: string;
  RNotes: string;
  CompID: number;
  CompCode: string;
  CompName: string;
  InsurStatusCode: string;
  InsurStatusName: string;
  PChartCode: string;
  PChartCompID: string;
  ReferenceNo: string;
  TransferYN: string;
  CoveredVal: string;
  CoveredFor: string;
}

export interface InsuranceGridProps {
  data: InsuranceFormState[];
  onEdit: (insurance: InsuranceFormState) => void;
  onDelete: (id: number) => void;
}

export interface InsuranceFormProps {
  onSave: (insurance: InsuranceFormState) => void;
  onCancel: () => void;
  initialData?: InsuranceFormState;
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
  policyStartDt: string;
  policyEndDt: string;
  guarantor?: string;
  relationVal: string;
  relation?: string;
  address1?: string;
  address2?: string;
  phone1?: string;
  phone2?: string;
  rActiveYN: string; // Using string to represent char
  rCreatedID: number;
  rCreatedOn: Date;
  rCreatedBy: string;
  rModifiedID: number;
  rModifiedOn: Date;
  rModifiedBy: string;
  rNotes?: string;
  compID?: number;
  compCode?: string;
  compName?: string;
  insurStatusCode?: string;
  insurStatusName?: string;
  pChartCode?: string;
  pChartCompID?: number;
  referenceNo?: string;
  transferYN?: string; // Using string to represent char
  coveredVal?: string;
  coveredFor?: string;
}
