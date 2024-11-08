// src/services/ClinicalManagementServices/allergyService.ts
import { CommonApiService } from "../CommonApiService";
import { GenericEntityService } from "../GenericEntityService/GenericEntityService";
import { AllergyDto } from "../../interfaces/ClinicalManagement/AllergyDto";
import { APIConfig } from "../../apiConfig";

class AllergyService extends GenericEntityService<AllergyDto> {
  constructor() {
    super(
      new CommonApiService({
        baseURL: APIConfig.clinicalManagementURL,
      }),
      "Allergy"
    );
  }
  async getByKeyFields(pChartID: number, opipNo: number, opipCaseNo: number): Promise<AllergyDto> {
    return this.apiService.get<AllergyDto>(`${this.baseEndpoint}/GetByKeyFields?pChartID=${pChartID}&opipNo=${opipNo}&opipCaseNo=${opipCaseNo}`, this.getToken());
  }
  async getAllergyWithDetails(id: number): Promise<AllergyDto> {
    return this.apiService.get<AllergyDto>(`${this.baseEndpoint}/${id}/details`, this.getToken());
  }

  async createOrUpdateAllergy(allergyDto: AllergyDto): Promise<AllergyDto> {
    return this.apiService.post<AllergyDto>(`${this.baseEndpoint}/create-or-update`, allergyDto, this.getToken());
  }
}

export const allergyService = new AllergyService();
