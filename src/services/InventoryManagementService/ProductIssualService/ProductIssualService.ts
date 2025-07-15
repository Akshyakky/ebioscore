import { APIConfig } from "@/apiConfig";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { PaginatedList } from "@/interfaces/Common/PaginatedList";
import { ProductIssualCompositeDto, ProductIssualDto, ProductIssualSearchRequest, ProductStockBalance } from "@/interfaces/InventoryManagement/ProductIssualDto";
import { CommonApiService } from "@/services/CommonApiService";
import { GenericEntityService } from "@/services/GenericEntityService/GenericEntityService";

class ProductIssualService extends GenericEntityService<ProductIssualDto> {
  constructor() {
    super(
      new CommonApiService({
        baseURL: APIConfig.inventoryManagementURL,
      }),
      "ProductIssualComposite"
    );
  }

  async generateIssualCode(fromDepartmentId: number): Promise<OperationResult<string>> {
    try {
      return await this.apiService.get<OperationResult<string>>(`${this.baseEndpoint}/GenerateIssualCode?fromDepartmentId=${fromDepartmentId}`, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to generate issual code",
        data: undefined,
      };
    }
  }

  async createIssualWithDetails(issualDto: ProductIssualCompositeDto): Promise<OperationResult<ProductIssualCompositeDto>> {
    try {
      return await this.apiService.post<OperationResult<ProductIssualCompositeDto>>(`${this.baseEndpoint}/CreateWithDetails`, issualDto, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to save issual with details",
        data: undefined,
      };
    }
  }

  async getIssualWithDetailsById(issualId: number): Promise<OperationResult<ProductIssualCompositeDto>> {
    try {
      return await this.apiService.get<OperationResult<ProductIssualCompositeDto>>(`${this.baseEndpoint}/GetIssualWithDetailsById?issualId=${issualId}`, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to retrieve issual details",
        data: undefined,
      };
    }
  }

  async issualSearch(searchRequest: ProductIssualSearchRequest): Promise<OperationResult<PaginatedList<ProductIssualDto>>> {
    try {
      return await this.apiService.post<OperationResult<PaginatedList<ProductIssualDto>>>(`${this.baseEndpoint}/IssualSearch`, searchRequest, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to search issuals",
        data: undefined,
      };
    }
  }

  async approveIssual(issualId: number): Promise<OperationResult<boolean>> {
    try {
      return await this.apiService.put<OperationResult<boolean>>(`${this.baseEndpoint}/Approve/${issualId}`, {}, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to approve issual",
        data: undefined,
      };
    }
  }

  async getAvailableStock(departmentId: number, productId?: number): Promise<OperationResult<ProductStockBalance[]>> {
    try {
      let url = `${this.baseEndpoint}/GetAvailableStock?deptId=${departmentId}`;
      if (productId && productId > 0) {
        url += `&productId=${productId}`;
      }
      return await this.apiService.get<OperationResult<ProductStockBalance[]>>(url, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to retrieve available stock",
        data: [],
      };
    }
  }

  async validateStockAvailability(departmentId: number, productId: number, requiredQty: number, batchNo?: string): Promise<OperationResult<boolean>> {
    try {
      let url = `${this.baseEndpoint}/ValidateStockAvailability?departmentId=${departmentId}&productId=${productId}&requiredQty=${requiredQty}`;
      if (batchNo) {
        url += `&batchNo=${encodeURIComponent(batchNo)}`;
      }
      return await this.apiService.get<OperationResult<boolean>>(url, this.getToken());
    } catch (error) {
      // Fallback to client-side validation if backend endpoint is not available
      try {
        const stockResult = await this.getAvailableStock(departmentId, productId);

        if (!stockResult.success || !stockResult.data) {
          return {
            success: false,
            errorMessage: "Failed to retrieve stock information",
            data: false,
          };
        }

        const availableStock = stockResult.data.find((stock) => stock.productID === productId && (!batchNo || stock.batchNumber === batchNo));

        if (!availableStock) {
          return {
            success: false,
            errorMessage: "Product not available in stock",
            data: false,
          };
        }

        const availableQty = availableStock.productQuantityOnHand || 0;
        if (availableQty < requiredQty) {
          return {
            success: false,
            errorMessage: `Insufficient stock. Available: ${availableQty}, Required: ${requiredQty}`,
            data: false,
          };
        }

        return {
          success: true,
          data: true,
        };
      } catch (fallbackError) {
        return {
          success: false,
          errorMessage: fallbackError instanceof Error ? fallbackError.message : "Failed to validate stock availability",
          data: false,
        };
      }
    }
  }

  async deleteIssual(issualId: number): Promise<OperationResult<boolean>> {
    try {
      const result = await this.delete(issualId);
      return {
        success: result.success,
        errorMessage: result.errorMessage,
        data: result.success,
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to delete issual",
        data: false,
      };
    }
  }
}

export const productIssualService = new ProductIssualService();
