import { APIConfig } from "@/apiConfig";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { PaginatedList } from "@/interfaces/Common/PaginatedList";
import { IssualType, ProductIssualCompositeDto, ProductIssualDto, ProductIssualSearchRequest, ProductStockBalance } from "@/interfaces/InventoryManagement/ProductIssualDto";
import { CommonApiService } from "@/services/CommonApiService";
import { GenericEntityService } from "@/services/GenericEntityService/GenericEntityService";
class ProductIssualService extends GenericEntityService<ProductIssualDto> {
  private readonly compositeEndpoint = "ProductIssualComposite";

  constructor() {
    super(
      new CommonApiService({
        baseURL: APIConfig.inventoryManagementURL,
      }),
      "ProductIssual"
    );
  }

  async generateIssualCode(fromDepartmentId: number, issualType: IssualType = IssualType.Department): Promise<OperationResult<string>> {
    try {
      const params = new URLSearchParams({
        fromDepartmentId: fromDepartmentId.toString(),
        issualType: issualType.toString(),
      });
      return await this.apiService.get<OperationResult<string>>(`${this.compositeEndpoint}/GenerateIssualCode?${params.toString()}`, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to generate issual code",
      };
    }
  }

  async generateDepartmentIssualCode(fromDepartmentId: number): Promise<OperationResult<string>> {
    try {
      return await this.apiService.get<OperationResult<string>>(`${this.compositeEndpoint}/GenerateDepartmentIssualCode?fromDepartmentId=${fromDepartmentId}`, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to generate Department Issual code",
      };
    }
  }

  async generatePhysicianIssualCode(fromDepartmentId: number): Promise<OperationResult<string>> {
    try {
      return await this.apiService.get<OperationResult<string>>(`${this.compositeEndpoint}/GeneratePhysicianIssualCode?fromDepartmentId=${fromDepartmentId}`, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to generate Physician Issual code",
      };
    }
  }

  async createIssualWithDetails(issualDto: ProductIssualCompositeDto): Promise<OperationResult<ProductIssualCompositeDto>> {
    try {
      return await this.apiService.post<OperationResult<ProductIssualCompositeDto>>(`${this.compositeEndpoint}/CreateWithDetails`, issualDto, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to save issual",
      };
    }
  }

  async createDepartmentIssual(issualDto: ProductIssualCompositeDto): Promise<OperationResult<ProductIssualCompositeDto>> {
    try {
      issualDto.productIssual.issualType = IssualType.Department;
      return await this.apiService.post<OperationResult<ProductIssualCompositeDto>>(`${this.compositeEndpoint}/CreateDepartmentIssual`, issualDto, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to create Department Issual",
      };
    }
  }

  async createPhysicianIssual(issualDto: ProductIssualCompositeDto): Promise<OperationResult<ProductIssualCompositeDto>> {
    try {
      issualDto.productIssual.issualType = IssualType.Physician;
      return await this.apiService.post<OperationResult<ProductIssualCompositeDto>>(`${this.compositeEndpoint}/CreatePhysicianIssual`, issualDto, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to create Physician Issual",
      };
    }
  }

  async getIssualWithDetailsById(issualId: number): Promise<OperationResult<ProductIssualCompositeDto>> {
    try {
      return await this.apiService.get<OperationResult<ProductIssualCompositeDto>>(`${this.compositeEndpoint}/GetIssualWithDetailsById?issualId=${issualId}`, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to retrieve issual details",
      };
    }
  }

  async issualSearch(searchRequest: ProductIssualSearchRequest): Promise<OperationResult<PaginatedList<ProductIssualDto>>> {
    try {
      return await this.apiService.post<OperationResult<PaginatedList<ProductIssualDto>>>(`${this.compositeEndpoint}/IssualSearch`, searchRequest, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to search issuals",
      };
    }
  }

  async searchDepartmentIssuals(searchRequest: ProductIssualSearchRequest): Promise<OperationResult<PaginatedList<ProductIssualDto>>> {
    try {
      searchRequest.issualType = IssualType.Department;
      return await this.apiService.post<OperationResult<PaginatedList<ProductIssualDto>>>(`${this.compositeEndpoint}/SearchDepartmentIssuals`, searchRequest, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to search Department Issuals",
      };
    }
  }

  async searchPhysicianIssuals(searchRequest: ProductIssualSearchRequest): Promise<OperationResult<PaginatedList<ProductIssualDto>>> {
    try {
      searchRequest.issualType = IssualType.Physician;
      return await this.apiService.post<OperationResult<PaginatedList<ProductIssualDto>>>(`${this.compositeEndpoint}/SearchPhysicianIssuals`, searchRequest, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to search Physician Issuals",
      };
    }
  }

  async getAvailableStock(departmentId: number, productId?: number): Promise<OperationResult<ProductStockBalance[]>> {
    try {
      const params = new URLSearchParams({
        departmentId: departmentId.toString(),
      });
      if (productId) {
        params.append("productId", productId.toString());
      }
      const url = `${this.compositeEndpoint}/GetAvailableStock?${params.toString()}`;
      return await this.apiService.get<OperationResult<ProductStockBalance[]>>(url, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to retrieve available stock",
      };
    }
  }

  async approveIssual(issualId: number): Promise<OperationResult<boolean>> {
    try {
      return await this.apiService.put<OperationResult<boolean>>(`${this.compositeEndpoint}/Approve/${issualId}`, {}, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to approve issual",
      };
    }
  }

  async deleteIssual(issualId: number): Promise<OperationResult<boolean>> {
    try {
      return await this.delete(issualId);
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to delete issual",
      };
    }
  }

  async getIssualTypes(): Promise<OperationResult<any[]>> {
    try {
      return await this.apiService.get<OperationResult<any[]>>(`${this.compositeEndpoint}/GetIssualTypes`, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to retrieve issual types",
      };
    }
  }

  async getIssualSummaryByType(startDate?: Date, endDate?: Date): Promise<OperationResult<any>> {
    try {
      const params = new URLSearchParams();
      if (startDate) {
        params.append("startDate", startDate.toISOString());
      }
      if (endDate) {
        params.append("endDate", endDate.toISOString());
      }
      const queryString = params.toString();
      const url = `${this.compositeEndpoint}/GetIssualSummaryByType${queryString ? `?${queryString}` : ""}`;

      return await this.apiService.get<OperationResult<any>>(url, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to retrieve issual summary",
      };
    }
  }
}

export const productIssualService = new ProductIssualService();
