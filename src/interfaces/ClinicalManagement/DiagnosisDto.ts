import { RecordFields } from "../Common/RecordFields";

// src/interfaces/ClinicalManagement/DiagnosisDto.ts
export interface DiagnosisDto extends RecordFields {
  opipDiagId: number;
  opipNo: number;
  opvId: number;
  pChartId: number;
  opipCaseNo: number;
  patOpipYN: string;
  diaDate: Date;
  diagType?: string;
  primaryDiagnoses: DiagnosisDetailDto[];
  associatedDiagnoses: AssocDiagnosisDetailDto[];
}

export interface DiagnosisDetailDto extends RecordFields {
  opipDiagDtlId: number;
  opipDiagId: number;
  icddId: number;
  icddCode: string;
  icddName: string;
  diagRemarks?: string;
  lcddmgId?: number;
  lcddmgName?: string;
  lcddsgId?: number;
  lcddsgName?: string;
}

export interface AssocDiagnosisDetailDto extends RecordFields {
  opipAssocDiagDtlId: number;
  opipDiagDtlId: number;
  opipDiagId: number;
  icddId: number;
  icddCode: string;
  icddName: string;
  diagRemarks?: string;
  lcddmgId?: number;
  lcddmgName?: string;
  lcddsgId?: number;
  lcddsgName?: string;
}
