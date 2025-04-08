import { GenericEntityService } from "@/services/GenericEntityService/GenericEntityService";
import { CommonApiService } from "@/services/CommonApiService";
import { APIConfig } from "@/apiConfig";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { PurchaseOrderMastDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
class PurchaseOrderMastServices extends GenericEntityService<PurchaseOrderMastDto> {
  constructor() {
    super(
      new CommonApiService({
        baseURL: APIConfig.inventoryManagementURL,
      }),
      "PurchaseOrderMast"
    );
  }
  async getPOCode(departmentName: string): Promise<OperationResult<string>> {
    return this.apiService.get<OperationResult<string>>(`${this.baseEndpoint}/GeneratePurchaseOrderCode?departmentName=${departmentName}`, this.getToken());
  }
}

export const purchaseOrderMastServices = new PurchaseOrderMastServices();
