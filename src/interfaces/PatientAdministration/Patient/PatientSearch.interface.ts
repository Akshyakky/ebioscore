export interface PatientOption {
  pChartID: number;
  pChartCode: string;
  pfName: string;
  plName: string;
  pAddPhone1?: string;
  pDob?: Date | null;
  fullName: string;
}

export interface PatientSearchResult {
  pChartID: number;
  pChartCode: string;
  fullName: string;
}
