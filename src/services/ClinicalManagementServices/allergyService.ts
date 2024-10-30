// src/services/ClinicalManagementServices/allergyService.ts
import { CommonApiService } from "../CommonApiService";
import { GenericEntityService } from "../GenericEntityService/GenericEntityService";
import { OPIPHistAllergyMastDto } from "../../interfaces/ClinicalManagement/AllergyDto";
import { APIConfig } from "../../apiConfig";

class AllergyService extends GenericEntityService<OPIPHistAllergyMastDto> {
  constructor() {
    super(
      new CommonApiService({
        baseURL: APIConfig.clinicalManagementURL,
      }),
      "Allergy"
    );
  }
  async getByKeyFields(pChartID: number, opipNo: number, opipCaseNo: number): Promise<OPIPHistAllergyMastDto> {
    return this.apiService.get<OPIPHistAllergyMastDto>(`${this.baseEndpoint}/GetByKeyFields?pChartID=${pChartID}&opipNo=${opipNo}&opipCaseNo=${opipCaseNo}`, this.getToken());
  }
  async getAllergyWithDetails(id: number): Promise<OPIPHistAllergyMastDto> {
    return this.apiService.get<OPIPHistAllergyMastDto>(`${this.baseEndpoint}/${id}/details`, this.getToken());
  }

  async createOrUpdateAllergy(allergyDto: OPIPHistAllergyMastDto): Promise<OPIPHistAllergyMastDto> {
    return this.apiService.post<OPIPHistAllergyMastDto>(`${this.baseEndpoint}/create-or-update`, allergyDto, this.getToken());
  }
}

export const allergyService = new AllergyService();
