import { APIConfig } from "@/apiConfig";
import { GrnMastDto, GrnSearchRequest } from "@/interfaces/InventoryManagement/GRNDto";
import { CommonApiService } from "@/services/CommonApiService";
import { GenericEntityService, OperationResult, PaginatedList } from "@/services/GenericEntityService/GenericEntityService";

class GrnMastServices extends GenericEntityService<GrnMastDto> {
  constructor() {
    // Initialize the service with the specific API endpoint for GRN
    super(
      new CommonApiService({
        baseURL: APIConfig.inventoryManagementURL,
      }),
      "Grn"
    );
  }

  async createGrnWithDetails(grnMastDto: GrnMastDto): Promise<OperationResult<GrnMastDto>> {
    return this.apiService.post<OperationResult<GrnMastDto>>(`${this.baseEndpoint}/CreateWithDetails`, grnMastDto, this.getToken());
  }

  async approveGrn(grnId: number): Promise<OperationResult<GrnMastDto>> {
    return this.apiService.put<OperationResult<GrnMastDto>>(`${this.baseEndpoint}/Approve/${grnId}`, null, this.getToken());
  }

  async grnSearch(searchRequest: GrnSearchRequest): Promise<OperationResult<PaginatedList<GrnMastDto>>> {
    return this.apiService.post<OperationResult<PaginatedList<GrnMastDto>>>(`${this.baseEndpoint}/GrnSearch`, searchRequest, this.getToken());
  }

  async getGrnWithDetailsById(grnId: number): Promise<OperationResult<GrnMastDto>> {
    return this.apiService.get<OperationResult<GrnMastDto>>(`${this.baseEndpoint}/GetGrnWithDetailsById/${grnId}`, this.getToken());
  }

  async generateGrnCode(departmentId: number): Promise<OperationResult<string>> {
    return this.apiService.get<OperationResult<string>>(`${this.baseEndpoint}/GenerateGrnCode/${departmentId}`, this.getToken());
  }
}

export const grnMastServices = new GrnMastServices();
