import { APIConfig } from "@/apiConfig";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { PaginatedList } from "@/interfaces/Common/PaginatedList";
import {
  ProductStockBalance,
  ProductStockReturnCompositeDto,
  ProductStockReturnDto,
  ProductStockReturnSearchRequest,
  ReturnType,
  ValidateReturnStockRequest,
} from "@/interfaces/InventoryManagement/ProductStockReturnDto";
import { CommonApiService } from "@/services/CommonApiService";
import { GenericEntityService } from "@/services/GenericEntityService/GenericEntityService";

class ProductStockReturnService extends GenericEntityService<ProductStockReturnDto> {
  private readonly compositeEndpoint = "ProductStockReturnComposite";
  constructor() {
    super(
      new CommonApiService({
        baseURL: APIConfig.inventoryManagementURL,
      }),
      "ProductStockReturn"
    );
  }

  async generateReturnCode(departmentId: number, returnType: string = ReturnType.Supplier): Promise<OperationResult<string>> {
    try {
      const params = new URLSearchParams({
        departmentId: departmentId.toString(),
        returnType,
      });
      return await this.apiService.get<OperationResult<string>>(`${this.compositeEndpoint}/GenerateReturnCode?${params.toString()}`, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to generate return code",
      };
    }
  }

  async generateSupplierReturnCode(departmentId: number): Promise<OperationResult<string>> {
    try {
      return await this.apiService.get<OperationResult<string>>(`${this.compositeEndpoint}/GenerateSupplierReturnCode?departmentId=${departmentId}`, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to generate Supplier Return code",
      };
    }
  }

  async generateInternalReturnCode(departmentId: number): Promise<OperationResult<string>> {
    try {
      return await this.apiService.get<OperationResult<string>>(`${this.compositeEndpoint}/GenerateInternalReturnCode?departmentId=${departmentId}`, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to generate Internal Return code",
      };
    }
  }

  async generateExpiredReturnCode(departmentId: number): Promise<OperationResult<string>> {
    try {
      return await this.apiService.get<OperationResult<string>>(`${this.compositeEndpoint}/GenerateExpiredReturnCode?departmentId=${departmentId}`, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to generate Expired Return code",
      };
    }
  }

  async generateDamagedReturnCode(departmentId: number): Promise<OperationResult<string>> {
    try {
      return await this.apiService.get<OperationResult<string>>(`${this.compositeEndpoint}/GenerateDamagedReturnCode?departmentId=${departmentId}`, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to generate Damaged Return code",
      };
    }
  }

  async createReturnWithDetails(returnDto: ProductStockReturnCompositeDto): Promise<OperationResult<ProductStockReturnCompositeDto>> {
    try {
      return await this.apiService.post<OperationResult<ProductStockReturnCompositeDto>>(`${this.compositeEndpoint}/CreateWithDetails`, returnDto, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to save stock return",
      };
    }
  }

  async createSupplierReturn(returnDto: ProductStockReturnCompositeDto): Promise<OperationResult<ProductStockReturnCompositeDto>> {
    try {
      returnDto.productStockReturn.returnTypeCode = ReturnType.Supplier;
      returnDto.productStockReturn.returnType = "Supplier Return";
      return await this.apiService.post<OperationResult<ProductStockReturnCompositeDto>>(`${this.compositeEndpoint}/CreateSupplierReturn`, returnDto, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to create Supplier Return",
      };
    }
  }

  async createInternalReturn(returnDto: ProductStockReturnCompositeDto): Promise<OperationResult<ProductStockReturnCompositeDto>> {
    try {
      returnDto.productStockReturn.returnTypeCode = ReturnType.Internal;
      returnDto.productStockReturn.returnType = "Internal Transfer";
      return await this.apiService.post<OperationResult<ProductStockReturnCompositeDto>>(`${this.compositeEndpoint}/CreateInternalReturn`, returnDto, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to create Internal Return",
      };
    }
  }

  async createExpiredReturn(returnDto: ProductStockReturnCompositeDto): Promise<OperationResult<ProductStockReturnCompositeDto>> {
    try {
      returnDto.productStockReturn.returnTypeCode = ReturnType.Expired;
      returnDto.productStockReturn.returnType = "Expired Items";
      return await this.apiService.post<OperationResult<ProductStockReturnCompositeDto>>(`${this.compositeEndpoint}/CreateExpiredReturn`, returnDto, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to create Expired Return",
      };
    }
  }

  async createDamagedReturn(returnDto: ProductStockReturnCompositeDto): Promise<OperationResult<ProductStockReturnCompositeDto>> {
    try {
      returnDto.productStockReturn.returnTypeCode = ReturnType.Damaged;
      returnDto.productStockReturn.returnType = "Damaged Items";
      return await this.apiService.post<OperationResult<ProductStockReturnCompositeDto>>(`${this.compositeEndpoint}/CreateDamagedReturn`, returnDto, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to create Damaged Return",
      };
    }
  }

  async getReturnWithDetailsById(returnId: number): Promise<OperationResult<ProductStockReturnCompositeDto>> {
    try {
      return await this.apiService.get<OperationResult<ProductStockReturnCompositeDto>>(`${this.compositeEndpoint}/GetReturnWithDetailsById?returnId=${returnId}`, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to retrieve return details",
      };
    }
  }

  async returnSearch(searchRequest: ProductStockReturnSearchRequest): Promise<OperationResult<PaginatedList<ProductStockReturnDto>>> {
    try {
      return await this.apiService.post<OperationResult<PaginatedList<ProductStockReturnDto>>>(`${this.compositeEndpoint}/ReturnSearch`, searchRequest, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to search returns",
      };
    }
  }

  async searchSupplierReturns(searchRequest: ProductStockReturnSearchRequest): Promise<OperationResult<PaginatedList<ProductStockReturnDto>>> {
    try {
      searchRequest.returnTypeCode = ReturnType.Supplier;
      return await this.apiService.post<OperationResult<PaginatedList<ProductStockReturnDto>>>(`${this.compositeEndpoint}/SearchSupplierReturns`, searchRequest, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to search Supplier Returns",
      };
    }
  }

  async searchInternalReturns(searchRequest: ProductStockReturnSearchRequest): Promise<OperationResult<PaginatedList<ProductStockReturnDto>>> {
    try {
      searchRequest.returnTypeCode = ReturnType.Internal;
      return await this.apiService.post<OperationResult<PaginatedList<ProductStockReturnDto>>>(`${this.compositeEndpoint}/SearchInternalReturns`, searchRequest, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to search Internal Returns",
      };
    }
  }

  async searchExpiredReturns(searchRequest: ProductStockReturnSearchRequest): Promise<OperationResult<PaginatedList<ProductStockReturnDto>>> {
    try {
      searchRequest.returnTypeCode = ReturnType.Expired;
      return await this.apiService.post<OperationResult<PaginatedList<ProductStockReturnDto>>>(`${this.compositeEndpoint}/SearchExpiredReturns`, searchRequest, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to search Expired Returns",
      };
    }
  }

  async searchDamagedReturns(searchRequest: ProductStockReturnSearchRequest): Promise<OperationResult<PaginatedList<ProductStockReturnDto>>> {
    try {
      searchRequest.returnTypeCode = ReturnType.Damaged;
      return await this.apiService.post<OperationResult<PaginatedList<ProductStockReturnDto>>>(`${this.compositeEndpoint}/SearchDamagedReturns`, searchRequest, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to search Damaged Returns",
      };
    }
  }

  async getAvailableStockForReturn(departmentId: number, productId?: number): Promise<OperationResult<ProductStockBalance[]>> {
    try {
      const params = new URLSearchParams({
        departmentId: departmentId.toString(),
      });
      if (productId) {
        params.append("productId", productId.toString());
      }
      const url = `${this.compositeEndpoint}/GetAvailableStockForReturn?${params.toString()}`;
      return await this.apiService.get<OperationResult<ProductStockBalance[]>>(url, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to retrieve available stock for return",
      };
    }
  }

  async validateStockAvailability(request: ValidateReturnStockRequest): Promise<OperationResult<boolean>> {
    try {
      return await this.apiService.post<OperationResult<boolean>>(`${this.compositeEndpoint}/ValidateStockAvailability`, request, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to validate stock availability",
      };
    }
  }

  async approveReturn(returnId: number): Promise<OperationResult<boolean>> {
    try {
      return await this.apiService.put<OperationResult<boolean>>(`${this.compositeEndpoint}/Approve/${returnId}`, {}, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to approve return",
      };
    }
  }

  async deleteReturn(returnId: number): Promise<OperationResult<boolean>> {
    try {
      return await this.delete(returnId);
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to delete return",
      };
    }
  }

  async getReturnTypes(): Promise<OperationResult<any[]>> {
    try {
      return await this.apiService.get<OperationResult<any[]>>(`${this.compositeEndpoint}/GetReturnTypes`, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to retrieve return types",
      };
    }
  }

  async getReturnSummary(startDate?: Date, endDate?: Date, departmentId?: number, returnType?: string): Promise<OperationResult<any>> {
    try {
      const params = new URLSearchParams();
      if (startDate) {
        params.append("startDate", startDate.toISOString());
      }
      if (endDate) {
        params.append("endDate", endDate.toISOString());
      }
      if (departmentId) {
        params.append("departmentId", departmentId.toString());
      }
      if (returnType) {
        params.append("returnType", returnType);
      }
      const queryString = params.toString();
      const url = `${this.compositeEndpoint}/GetReturnSummary${queryString ? `?${queryString}` : ""}`;

      return await this.apiService.get<OperationResult<any>>(url, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to retrieve return summary",
      };
    }
  }

  async getReturnSummaryByType(startDate?: Date, endDate?: Date): Promise<OperationResult<any>> {
    try {
      const params = new URLSearchParams();
      if (startDate) {
        params.append("startDate", startDate.toISOString());
      }
      if (endDate) {
        params.append("endDate", endDate.toISOString());
      }
      const queryString = params.toString();
      const url = `${this.compositeEndpoint}/GetReturnSummaryByType${queryString ? `?${queryString}` : ""}`;

      return await this.apiService.get<OperationResult<any>>(url, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to retrieve return summary by type",
      };
    }
  }

  async getDepartmentReturnStatistics(departmentId: number, startDate?: Date, endDate?: Date): Promise<OperationResult<any>> {
    try {
      const params = new URLSearchParams({
        departmentId: departmentId.toString(),
      });
      if (startDate) {
        params.append("startDate", startDate.toISOString());
      }
      if (endDate) {
        params.append("endDate", endDate.toISOString());
      }
      const url = `${this.compositeEndpoint}/GetDepartmentReturnStatistics?${params.toString()}`;

      return await this.apiService.get<OperationResult<any>>(url, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to retrieve department return statistics",
      };
    }
  }

  async getReturnsByDateRange(startDate: Date, endDate: Date, departmentId?: number, returnType?: string): Promise<OperationResult<ProductStockReturnDto[]>> {
    try {
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      if (departmentId) {
        params.append("departmentId", departmentId.toString());
      }
      if (returnType) {
        params.append("returnType", returnType);
      }
      const url = `${this.compositeEndpoint}/GetReturnsByDateRange?${params.toString()}`;
      return await this.apiService.get<OperationResult<ProductStockReturnDto[]>>(url, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to retrieve returns by date range",
      };
    }
  }

  async bulkCreateReturns(returnDtos: ProductStockReturnCompositeDto[]): Promise<OperationResult<ProductStockReturnCompositeDto[]>> {
    try {
      return await this.apiService.post<OperationResult<ProductStockReturnCompositeDto[]>>(`${this.compositeEndpoint}/BulkCreateReturns`, returnDtos, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to create returns in bulk",
      };
    }
  }
}

export const productStockReturnService = new ProductStockReturnService();
