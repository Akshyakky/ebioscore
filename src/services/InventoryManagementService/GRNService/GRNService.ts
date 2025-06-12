import { APIConfig } from "@/apiConfig";
import { GRNDto } from "@/interfaces/InventoryManagement/GRNDto";
import { CommonApiService } from "@/services/CommonApiService";
import { GenericEntityService, OperationResult } from "@/services/GenericEntityService/GenericEntityService";

export class GRNService extends GenericEntityService<GRNDto> {
  constructor() {
    const apiService = new CommonApiService({
      baseURL: APIConfig.inventoryManagementURL,
    });
    super(apiService, "Grn");
  }
  async generateGRNCode(depId: number): Promise<OperationResult<any>> {
    return this.apiService.get<OperationResult<any>>(`${this.baseEndpoint}/GenerateGrnCode/${depId}`, this.getToken());
  }
}
