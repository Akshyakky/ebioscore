// src/services/ClinicalManagementServices/pastMedicationService.ts

import { APIConfig } from "@/apiConfig";
import { PastMedicationDto } from "@/interfaces/ClinicalManagement/PastMedicationDto";
import { CommonApiService } from "../CommonApiService";
import { GenericEntityService } from "../GenericEntityService/GenericEntityService";

class PastMedicationService extends GenericEntityService<PastMedicationDto> {
  constructor() {
    super(
      new CommonApiService({
        baseURL: APIConfig.clinicalManagementURL,
      }),
      "PastMedication"
    );
  }

  async getByKeyFields(pChartID: number, opipNo: number, opipCaseNo: number): Promise<PastMedicationDto> {
    return this.apiService.get<PastMedicationDto>(`${this.baseEndpoint}/GetByKeyFields?pChartID=${pChartID}&opipNo=${opipNo}&opipCaseNo=${opipCaseNo}`, this.getToken());
  }
}

export const pastMedicationService = new PastMedicationService();
