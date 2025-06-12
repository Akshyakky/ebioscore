// src/services/ClinicalManagementServices/diagnosisService.ts

import { APIConfig } from "@/apiConfig";
import { DiagnosisDto } from "@/interfaces/ClinicalManagement/DiagnosisDto";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { CommonApiService } from "../CommonApiService";
import { GenericEntityService } from "../GenericEntityService/GenericEntityService";

class DiagnosisService extends GenericEntityService<DiagnosisDto> {
  constructor() {
    super(
      new CommonApiService({
        baseURL: APIConfig.clinicalManagementURL,
      }),
      "Diagnosis"
    );
  }

  async saveWithDetails(diagnosisDto: DiagnosisDto): Promise<OperationResult<DiagnosisDto>> {
    return this.apiService.post<OperationResult<DiagnosisDto>>(`${this.baseEndpoint}/SaveWithDetails`, diagnosisDto, this.getToken());
  }
  async getDiagnosisByPatient(pChartId: number, opipNo: number, opipCaseNo: number): Promise<OperationResult<DiagnosisDto>> {
    const params = new URLSearchParams({
      pChartId: pChartId.toString(),
      opipNo: opipNo.toString(),
      opipCaseNo: opipCaseNo.toString(),
    });

    return this.apiService.get<OperationResult<DiagnosisDto>>(`${this.baseEndpoint}/GetDiagnosisByPatient?${params.toString()}`, this.getToken());
  }
}

export const diagnosisService = new DiagnosisService();
