import { APIConfig } from "@/apiConfig";
import { GenericEntityService, OperationResult, PaginatedList } from "@/services/GenericEntityService/GenericEntityService";
import { CommonApiService } from "@/services/CommonApiService";
import { GRNDto } from "@/interfaces/InventoryManagement/GRNDto";

export class GRNService extends GenericEntityService<GRNDto> {
  constructor() {
    const apiService = new CommonApiService({
      baseURL: APIConfig.securityManagementURL,
    });
    super(apiService, "Grn");
  }
}
