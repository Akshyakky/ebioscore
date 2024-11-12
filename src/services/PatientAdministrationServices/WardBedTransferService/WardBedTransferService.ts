// src/services/PatientAdministrationServices/WardBedTransferService.ts
import { APIConfig } from "../../../apiConfig";
import { CommonApiService } from "../../CommonApiService";
import { GenericEntityService } from "../../GenericEntityService/GenericEntityService";
import { BedTransferRequestDto } from "./../../../interfaces/PatientAdministration/BedTransferRequestDto";

class WardBedTransferService extends GenericEntityService<BedTransferRequestDto> {
  constructor() {
    const apiService = new CommonApiService({
      baseURL: APIConfig.patientAdministrationURL,
    });
    super(apiService, "WardBedTransfer");
  }

  async processTransfer(request: BedTransferRequestDto): Promise<any> {
    const response = await this.apiService.post<any>(`${this.baseEndpoint}/ProcessTransfer`, request, this.getToken());
    return { success: true, data: response };
  }

  async validateTransfer(currentBedId: number, newBedId: number, admitId: number): Promise<boolean> {
    const response = await this.apiService.get<boolean>(`${this.baseEndpoint}/ValidateTransfer`, this.getToken(), { currentBedId, newBedId, admitId });
    return response;
  }

  async getTransfersByAdmission(admitId: number): Promise<any[]> {
    const response = await this.apiService.get<any[]>(`${this.baseEndpoint}/GetTransfersByAdmission/${admitId}`, this.getToken());
    return response;
  }
}

export const wardBedTransferService = new WardBedTransferService();
