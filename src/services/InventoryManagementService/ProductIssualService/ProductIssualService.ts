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
    return this.apiService.get<OperationResult<string>>(`${this.baseEndpoint}/GenerateIssualCode?fromDepartmentId=${fromDepartmentId}`, this.getToken());
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
      if (productId) {
        url += `&productId=${productId}`;
      }
      return await this.apiService.get<OperationResult<ProductStockBalance[]>>(url, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to retrieve available stock",
        data: undefined,
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
        data: undefined,
      };
    }
  }

  async validateStockAvailability(departmentId: number, productId: number, requiredQty: number, batchNo?: string): Promise<OperationResult<boolean>> {
    try {
      const stockResult = await this.getAvailableStock(departmentId, productId);

      if (!stockResult.success || !stockResult.data) {
        return {
          success: false,
          errorMessage: "Failed to retrieve stock information",
          data: undefined,
        };
      }

      const availableStock = stockResult.data.find((stock) => stock.productID === productId && (!batchNo || stock.batchNumber === batchNo));

      if (!availableStock) {
        return {
          success: false,
          errorMessage: "Product not available in stock",
          data: undefined,
        };
      }

      const availableQty = availableStock.productQuantityOnHand || 0;
      if (availableQty < requiredQty) {
        return {
          success: false,
          errorMessage: `Insufficient stock. Available: ${availableQty}, Required: ${requiredQty}`,
          data: undefined,
        };
      }

      return {
        success: true,
        data: true,
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to validate stock availability",
        data: undefined,
      };
    }
  }
}

export const productIssualService = new ProductIssualService();
