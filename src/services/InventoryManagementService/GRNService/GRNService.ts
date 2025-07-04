import { APIConfig } from "@/apiConfig";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { PaginatedList } from "@/interfaces/Common/PaginatedList";
import { GrnDto, GrnMastDto, GrnSearchRequest } from "@/interfaces/InventoryManagement/GRNDto";
import { CommonApiService } from "@/services/CommonApiService";
import { GenericEntityService } from "@/services/GenericEntityService/GenericEntityService";

class GrnService extends GenericEntityService<GrnMastDto> {
  constructor() {
    super(
      new CommonApiService({
        baseURL: APIConfig.inventoryManagementURL,
      }),
      "Grn"
    );
  }

  async generateGrnCode(departmentId: number): Promise<OperationResult<string>> {
    return this.apiService.get<OperationResult<string>>(`${this.baseEndpoint}/GenerateGrnCode?departmentId=${departmentId}`, this.getToken());
  }

  async createGrnWithDetails(grnDto: GrnDto): Promise<OperationResult<GrnDto>> {
    return this.apiService.post<OperationResult<GrnDto>>(`${this.baseEndpoint}/CreateWithDetails`, grnDto, this.getToken());
  }

  async getGrnWithDetailsById(grnId: number): Promise<OperationResult<GrnDto>> {
    return this.apiService.get<OperationResult<GrnDto>>(`${this.baseEndpoint}/GetGrnWithDetailsById?grnId=${grnId}`, this.getToken());
  }

  async grnSearch(searchRequest: GrnSearchRequest): Promise<OperationResult<PaginatedList<GrnMastDto>>> {
    return this.apiService.post<OperationResult<PaginatedList<GrnMastDto>>>(`${this.baseEndpoint}/GrnSearch`, searchRequest, this.getToken());
  }

  async updateProductStock(grnId: number): Promise<OperationResult<boolean>> {
    return this.apiService.put<OperationResult<boolean>>(`${this.baseEndpoint}/UpdateProductStock/${grnId}`, {}, this.getToken());
  }

  async approveGrn(grnId: number): Promise<OperationResult<boolean>> {
    return this.apiService.put<OperationResult<boolean>>(`${this.baseEndpoint}/Approve/${grnId}`, {}, this.getToken());
  }
}

export const grnService = new GrnService();
