import { APIConfig } from "@/apiConfig";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { PaginatedList } from "@/interfaces/Common/PaginatedList";
import { IssualType, ProductIssualCompositeDto, ProductIssualDto, ProductIssualSearchRequest, ProductStockBalance } from "@/interfaces/InventoryManagement/ProductIssualDto";
import { CommonApiService } from "@/services/CommonApiService";
import { GenericEntityService } from "@/services/GenericEntityService/GenericEntityService";

/**
 * Service to handle all operations related to Product Issuals.
 * It interacts with both the `ProductIssualCompositeController` for complex operations
 * and the base `ProductIssualController` for standard CRUD actions like delete.
 */
class ProductIssualService extends GenericEntityService<ProductIssualDto> {
  private readonly compositeEndpoint = "ProductIssualComposite";

  constructor() {
    // The base class targets the `ProductIssualController` for generic operations.
    super(
      new CommonApiService({
        baseURL: APIConfig.inventoryManagementURL,
      }),
      "ProductIssual"
    );
  }

  // region --- Code Generation ---

  /**
   * Generates a unique issual code based on the department and issual type.
   * Corresponds to: GET /api/ProductIssualComposite/GenerateIssualCode
   */
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

  /**
   * Generates a unique code specifically for a Department Issual.
   * Corresponds to: GET /api/ProductIssualComposite/GenerateDepartmentIssualCode
   */
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

  /**
   * Generates a unique code specifically for a Physician Issual.
   * Corresponds to: GET /api/ProductIssualComposite/GeneratePhysicianIssualCode
   */
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

  // endregion

  // region --- Create Operations ---

  /**
   * Creates or updates a Product Issual with its details.
   * Corresponds to: POST /api/ProductIssualComposite/CreateWithDetails
   */
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

  /**
   * Creates a Department Issual with its details.
   * Corresponds to: POST /api/ProductIssualComposite/CreateDepartmentIssual
   */
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

  /**
   * Creates a Physician Issual with its details.
   * Corresponds to: POST /api/ProductIssualComposite/CreatePhysicianIssual
   */
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

  // endregion

  // region --- Read and Search Operations ---

  /**
   * Retrieves a complete Product Issual, including its master and detail records.
   * Corresponds to: GET /api/ProductIssualComposite/GetIssualWithDetailsById
   */
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

  /**
   * Performs a paginated search for Product Issuals based on various criteria.
   * Corresponds to: POST /api/ProductIssualComposite/IssualSearch
   */
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

  /**
   * Performs a search specifically for Department Issuals.
   * Corresponds to: POST /api/ProductIssualComposite/SearchDepartmentIssuals
   */
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

  /**
   * Performs a search specifically for Physician Issuals.
   * Corresponds to: POST /api/ProductIssualComposite/SearchPhysicianIssuals
   */
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

  /**
   * Retrieves the available product stock for a given department.
   * Corresponds to: GET /api/ProductIssualComposite/GetAvailableStock
   */
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

  // endregion

  // region --- Update and Action Operations ---

  /**
   * Approves a Product Issual, triggering stock updates.
   * Corresponds to: PUT /api/ProductIssualComposite/Approve/{issualId}
   */
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

  // endregion

  // region --- Delete Operations ---

  /**
   * Deletes a Product Issual. This calls the generic controller endpoint.
   * Corresponds to: DELETE /api/ProductIssual/{id}
   */
  async deleteIssual(issualId: number): Promise<OperationResult<boolean>> {
    try {
      // Uses the delete method inherited from GenericEntityService,
      // which correctly targets the /api/ProductIssual/{id} endpoint.
      return await this.delete(issualId);
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to delete issual",
      };
    }
  }

  // endregion

  // region --- Metadata and Summary ---

  /**
   * Retrieves the available issual types (Department, Physician).
   * Corresponds to: GET /api/ProductIssualComposite/GetIssualTypes
   */
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

  /**
   * Retrieves a summary of issuals grouped by type within a date range.
   * Corresponds to: GET /api/ProductIssualComposite/GetIssualSummaryByType
   */
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
  // endregion
}

export const productIssualService = new ProductIssualService();
