// src/services/PatientAdministrationServices/WardBedTransferService.ts
import { APIConfig } from "@/apiConfig";
import { BedTransferRequestDto } from "@/interfaces/PatientAdministration/BedTransferRequestDto";
import { CommonApiService } from "@/services/CommonApiService";
import { GenericEntityService, OperationResult } from "@/services/GenericEntityService/GenericEntityService";

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
    const response = await this.apiService.get<OperationResult<any[]>>(`${this.baseEndpoint}/GetTransfersByAdmission/${admitId}`, this.getToken());
    // Handle the OperationResult wrapper from backend
    if (response && response.success && response.data) {
      return Array.isArray(response.data) ? response.data : [];
    }

    // Fallback if response structure is different
    return Array.isArray(response) ? response : [];
  }

  /**
   * Retrieves recent transfers from the backend API
   * @param days Number of days to look back for transfers (default: 7)
   * @param maxRecords Maximum number of records to return (default: 50)
   * @returns Promise resolving to list of recent transfer records
   */
  async getRecentTransfers(days: number = 7, maxRecords: number = 50): Promise<BedTransferRequestDto[]> {
    const response = await this.apiService.get<any>(`${this.baseEndpoint}/GetRecentTransfers`, this.getToken(), { days, maxRecords });

    // Handle the OperationResult wrapper from backend
    if (response && response.success && response.data) {
      return response.data;
    }

    // Fallback if response structure is different
    return Array.isArray(response) ? response : [];
  }
}

export const wardBedTransferService = new WardBedTransferService();
