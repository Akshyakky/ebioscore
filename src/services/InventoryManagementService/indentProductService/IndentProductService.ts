import { GenericEntityService } from "@/services/GenericEntityService/GenericEntityService";
import { CommonApiService } from "@/services/CommonApiService";
import { APIConfig } from "@/apiConfig";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { IndentMastDto, IndentSaveRequestDto } from "@/interfaces/InventoryManagement/IndentProductDto";
import { FilterDto } from "@/interfaces/Common/FilterDto";
import { PaginatedList } from "@/interfaces/Common/PaginatedList";

class IndentProductService extends GenericEntityService<IndentSaveRequestDto> {
  constructor() {
    super(
      new CommonApiService({
        baseURL: APIConfig.inventoryManagementURL,
      }),
      "Indent"
    );
  }

  async saveIndent(IndentData: IndentSaveRequestDto): Promise<OperationResult<any[]>> {
    if (IndentData.IndentDetails) {
      IndentData.IndentDetails = IndentData.IndentDetails.map((detail) => {
        if (IndentData.id > 0) {
          detail.indentDetID = detail.indentDetID || 0;
        }
        return detail;
      });
    }

    return this.apiService.post<OperationResult<any[]>>(`${this.baseEndpoint}/Save`, IndentData, this.getToken());
  }

  async getIndentById(indentId: number): Promise<OperationResult<any>> {
    return this.apiService.get<OperationResult<any>>(`${this.baseEndpoint}/GetById/${indentId}`, this.getToken());
  }

  async getAllIndents(filterDto: FilterDto): Promise<OperationResult<PaginatedList<IndentMastDto>>> {
    const params = new URLSearchParams();
    params.append("dateFilter", filterDto.dateFilter.toString());
    if (filterDto.startDate) {
      params.append("startDate", filterDto.startDate.toISOString());
    }
    if (filterDto.endDate) {
      params.append("endDate", filterDto.endDate.toISOString());
    }
    if (filterDto.statusFilter) {
      params.append("statusFilter", filterDto.statusFilter);
    }
    params.append("pageIndex", filterDto.pageIndex.toString());
    params.append("pageSize", filterDto.pageSize.toString());
    return this.apiService.get<OperationResult<PaginatedList<IndentMastDto>>>(`${this.baseEndpoint}/GetAll?${params.toString()}`, this.getToken());
  }
}

export const indentProductServices = new IndentProductService();
