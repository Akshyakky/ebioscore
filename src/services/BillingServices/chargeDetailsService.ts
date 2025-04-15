// src/services/BillingServices/chargeDetailsService.ts
import { ChargeDetailsDto } from "@/interfaces/Billing/BChargeDetails";
import { GenericEntityService } from "../GenericEntityService/GenericEntityService";
import { CommonApiService } from "../CommonApiService";
import { APIConfig } from "@/apiConfig";
import { OperationResult } from "@/interfaces/Common/OperationResult";

class ChargeDetailsService extends GenericEntityService<ChargeDetailsDto> {
  constructor() {
    super(
      new CommonApiService({
        baseURL: APIConfig.billingURL,
      }),
      "ChargeDetails"
    );
  }

  async saveChargeDetails(chargeDetailsDto: ChargeDetailsDto): Promise<OperationResult<ChargeDetailsDto>> {
    return this.apiService.post<OperationResult<ChargeDetailsDto>>(`${this.baseEndpoint}/SaveChargeDetails`, chargeDetailsDto, this.getToken());
  }

  async generateChargeCode(): Promise<OperationResult<string>> {
    return this.apiService.get<OperationResult<string>>(`${this.baseEndpoint}/GenerateChargeCode`, this.getToken());
  }

  async getAllChargeDetails(): Promise<OperationResult<ChargeDetailsDto[]>> {
    return this.apiService.get<OperationResult<ChargeDetailsDto[]>>(`${this.baseEndpoint}/GetAllChargeDetails`, this.getToken());
  }

  // New method: Fetch all details by ChargeID
  async getAllByID(chargeID: number): Promise<OperationResult<ChargeDetailsDto>> {
    return this.apiService.get<OperationResult<ChargeDetailsDto>>(`${this.baseEndpoint}/GetAllByID/${chargeID}`, this.getToken());
  }
}

export const chargeDetailsService = new ChargeDetailsService();
