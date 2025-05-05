import { GenericEntityService } from "@/services/GenericEntityService/GenericEntityService";
import { CommonApiService } from "@/services/CommonApiService";
import { APIConfig } from "@/apiConfig";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { IndentSaveRequestDto } from "@/interfaces/InventoryManagement/IndentProductDto";

class IndentProductService extends GenericEntityService<IndentSaveRequestDto> {
  constructor() {
    super(
      new CommonApiService({
        baseURL: APIConfig.inventoryManagementURL,
      }),
      "IndentProduct"
    );
  }

  async saveIndentWithDetails(IndentData: IndentSaveRequestDto): Promise<OperationResult<any[]>> {
    return this.apiService.post<OperationResult<any[]>>(`${this.baseEndpoint}/SaveWithDetails`, IndentData, this.getToken());
  }
  async getIndentWithDetails(indentId: number): Promise<OperationResult<any>> {
    return this.apiService.get<OperationResult<any>>(`${this.baseEndpoint}/GetWithDetails?pOID=${indentId}`, this.getToken());
  }
}

export const indentProductServices = new IndentProductService();
