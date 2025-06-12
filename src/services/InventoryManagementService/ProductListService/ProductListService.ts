import { APIConfig } from "@/apiConfig";
import { ProductListDto } from "@/interfaces/InventoryManagement/ProductListDto";
import { CommonApiService } from "@/services/CommonApiService";
import { GenericEntityService, OperationResult } from "@/services/GenericEntityService/GenericEntityService";

export class ProductListService extends GenericEntityService<ProductListDto> {
  constructor() {
    const apiService = new CommonApiService({
      baseURL: APIConfig.inventoryManagementURL,
    });
    super(apiService, "ProductMaster");
  }

  async getNextProductCode(): Promise<OperationResult<string>> {
    return this.apiService.get<OperationResult<string>>(`${this.baseEndpoint}/GetNextProductCode`, this.getToken());
  }

  async getByProductCode(productCode: string): Promise<OperationResult<ProductListDto>> {
    return this.apiService.get<OperationResult<ProductListDto>>(`${this.baseEndpoint}/GetByProductCode/${encodeURIComponent(productCode)}`, this.getToken());
  }

  async getByProductName(productName: string): Promise<OperationResult<ProductListDto[]>> {
    return this.apiService.get<OperationResult<ProductListDto[]>>(`${this.baseEndpoint}/GetByProductName/${encodeURIComponent(productName)}`, this.getToken());
  }
}
