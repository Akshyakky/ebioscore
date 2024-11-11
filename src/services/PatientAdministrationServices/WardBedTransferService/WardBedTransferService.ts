// src/services/PatientAdministrationServices/WardBedTransferService.ts
import { APIConfig } from "../../../apiConfig";
import { CommonApiService } from "../../CommonApiService";
import { BedTransferRequestDto } from "./../../../interfaces/PatientAdministration/BedTransferRequestDto";

class WardBedTransferService {
  private readonly apiService: CommonApiService;
  private readonly baseEndpoint: string = "WardBedTransfer";

  constructor() {
    this.apiService = new CommonApiService({
      baseURL: APIConfig.patientAdministrationURL,
    });
  }

  async processTransfer(request: BedTransferRequestDto): Promise<any> {
    const response = await this.apiService.post<any>(`${this.baseEndpoint}/ProcessTransfer`, request);
    return { success: true, data: response };
  }

  async validateTransfer(currentBedId: number, newBedId: number, admitId: number): Promise<boolean> {
    const response = await this.apiService.get<boolean>(`${this.baseEndpoint}/ValidateTransfer`, undefined, { currentBedId, newBedId, admitId });
    return response;
  }

  async getTransfersByAdmission(admitId: number): Promise<any[]> {
    const response = await this.apiService.get<any[]>(`${this.baseEndpoint}/GetTransfersByAdmission/${admitId}`);
    return response;
  }
}

export const wardBedTransferService = new WardBedTransferService();
