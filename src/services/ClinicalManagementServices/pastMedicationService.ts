// src/services/ClinicalManagementServices/pastMedicationService.ts

import { PastMedicationDto } from "@/interfaces/ClinicalManagement/PastMedicationDto";
import { GenericEntityService } from "../GenericEntityService/GenericEntityService";
import { CommonApiService } from "../CommonApiService";
import { APIConfig } from "@/apiConfig";

class PastMedicationService extends GenericEntityService<PastMedicationDto> {
  constructor() {
    super(
      new CommonApiService({
        baseURL: APIConfig.clinicalManagementURL,
      }),
      "PastMedication"
    );
  }

  async getPastMedicationWithDetails(id: number): Promise<PastMedicationDto> {
    return this.apiService.get<PastMedicationDto>(`${this.baseEndpoint}/${id}/details`, this.getToken());
  }

  async createOrUpdatePastMedication(pastMedicationDto: PastMedicationDto): Promise<PastMedicationDto> {
    return this.apiService.post<PastMedicationDto>(`${this.baseEndpoint}/create-or-update`, pastMedicationDto, this.getToken());
  }

  async getByKeyFields(pChartID: number, opipNo: number, opipCaseNo: number): Promise<PastMedicationDto> {
    return this.apiService.get<PastMedicationDto>(`${this.baseEndpoint}/GetByKeyFields?pChartID=${pChartID}&opipNo=${opipNo}&opipCaseNo=${opipCaseNo}`, this.getToken());
  }
}

export const pastMedicationService = new PastMedicationService();
