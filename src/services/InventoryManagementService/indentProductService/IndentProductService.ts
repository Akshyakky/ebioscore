import { APIConfig } from "@/apiConfig";
import { DateFilterType, FilterDto } from "@/interfaces/Common/FilterDto";
import { IndentDetailDto, IndentMastDto, IndentSaveRequestDto } from "@/interfaces/InventoryManagement/IndentProductDto";
import { CommonApiService } from "@/services/CommonApiService";
import { GenericEntityService, OperationResult, PaginatedList } from "@/services/GenericEntityService/GenericEntityService";
import { createEntityService } from "@/utils/Common/serviceFactory";

// Extended services with custom methods for complex operations
class ExtendedIndentMastService extends GenericEntityService<IndentMastDto> {
  constructor() {
    super(new CommonApiService({ baseURL: APIConfig.inventoryManagementURL }), "IndentMast");
  }
}

class ExtendedIndentDetailService extends GenericEntityService<IndentDetailDto> {
  constructor() {
    super(new CommonApiService({ baseURL: APIConfig.inventoryManagementURL }), "IndentDetail");
  }
}

class ExtendedIndentService extends GenericEntityService<IndentSaveRequestDto> {
  constructor() {
    super(new CommonApiService({ baseURL: APIConfig.inventoryManagementURL }), "Indent");
  }

  /**
   * Saves a complete indent (master + details) in a single transaction
   */
  async saveIndent(indentDto: IndentSaveRequestDto): Promise<OperationResult<IndentSaveRequestDto>> {
    return this.apiService.post<OperationResult<IndentSaveRequestDto>>(`${this.baseEndpoint}/Save`, indentDto, this.getToken());
  }

  /**
   * Retrieves a complete indent (master + details) by ID
   */
  async getIndentById(id: number): Promise<OperationResult<IndentSaveRequestDto>> {
    return this.apiService.get<OperationResult<IndentSaveRequestDto>>(`${this.baseEndpoint}/GetById/${id}`, this.getToken());
  }

  /**
   * Retrieves all indents with filtering and pagination
   */
  async getAllIndents(filterDto: FilterDto): Promise<OperationResult<PaginatedList<IndentMastDto>>> {
    const params = new URLSearchParams({
      dateFilter: filterDto.dateFilter.toString(),
      pageIndex: filterDto.pageIndex.toString(),
      pageSize: filterDto.pageSize.toString(),
      ...(filterDto.startDate && { startDate: filterDto.startDate.toISOString() }),
      ...(filterDto.endDate && { endDate: filterDto.endDate.toISOString() }),
      ...(filterDto.statusFilter && { statusFilter: filterDto.statusFilter }),
    });

    return this.apiService.get<OperationResult<PaginatedList<IndentMastDto>>>(`${this.baseEndpoint}/GetAll?${params.toString()}`, this.getToken());
  }
}

// Export basic services using factory pattern (for simple CRUD operations)
export const indentMastBasicService = createEntityService<IndentMastDto>("IndentMast", "inventoryManagementURL");
export const indentDetailBasicService = createEntityService<IndentDetailDto>("IndentDetail", "inventoryManagementURL");

// Export extended services with custom methods (for complex operations)
export const indentMastService = new ExtendedIndentMastService();
export const indentDetailService = new ExtendedIndentDetailService();
export const indentService = new ExtendedIndentService();

// Export types for convenience
export type { DateFilterType, FilterDto, IndentDetailDto, IndentMastDto, IndentSaveRequestDto };
