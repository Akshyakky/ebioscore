// src/services/InventoryManagementService/ProductConsumptionService.ts

import { APIConfig } from "@/apiConfig";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { PaginatedList } from "@/interfaces/Common/PaginatedList";
import {
  ProductConsumptionCompositeDto,
  ProductConsumptionMastDto,
  ProductConsumptionSearchRequest,
  ValidateConsumptionStockRequest,
} from "@/interfaces/InventoryManagement/ProductConsumption";
import { ProductStockBalance } from "@/interfaces/InventoryManagement/ProductIssualDto";
import { CommonApiService } from "@/services/CommonApiService";
import { GenericEntityService } from "@/services/GenericEntityService/GenericEntityService";
class ProductConsumptionService extends GenericEntityService<ProductConsumptionMastDto> {
  private readonly compositeEndpoint = "ProductConsumption";
  constructor() {
    super(
      new CommonApiService({
        baseURL: APIConfig.inventoryManagementURL,
      }),
      "ProductConsumptionMast"
    );
  }

  /**
   * Generate consumption code for a department
   */
  async generateConsumptionCode(departmentId: number): Promise<OperationResult<string>> {
    try {
      const params = new URLSearchParams({
        departmentId: departmentId.toString(),
      });
      return await this.apiService.get<OperationResult<string>>(`${this.compositeEndpoint}/GenerateConsumptionCode?${params.toString()}`, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to generate consumption code",
      };
    }
  }

  /**
   * Create consumption with details
   */
  async createConsumptionWithDetails(consumptionDto: ProductConsumptionCompositeDto): Promise<OperationResult<ProductConsumptionCompositeDto>> {
    try {
      debugger;
      return await this.apiService.post<OperationResult<ProductConsumptionCompositeDto>>(`${this.compositeEndpoint}/CreateWithDetails`, consumptionDto, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to save consumption",
      };
    }
  }

  /**
   * Get consumption with details by ID
   */
  async getConsumptionWithDetailsById(consumptionId: number): Promise<OperationResult<ProductConsumptionCompositeDto>> {
    try {
      return await this.apiService.get<OperationResult<ProductConsumptionCompositeDto>>(
        `${this.compositeEndpoint}/GetConsumptionWithDetailsById?consumptionId=${consumptionId}`,
        this.getToken()
      );
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to retrieve consumption details",
      };
    }
  }

  /**
   * Search consumptions with pagination and filtering
   */
  async consumptionSearch(searchRequest: ProductConsumptionSearchRequest): Promise<OperationResult<PaginatedList<ProductConsumptionMastDto>>> {
    try {
      // Log the request for debugging
      console.log("Consumption Search Request:", JSON.stringify(searchRequest, null, 2));

      return await this.apiService.post<OperationResult<PaginatedList<ProductConsumptionMastDto>>>(`${this.compositeEndpoint}/ConsumptionSearch`, searchRequest, this.getToken());
    } catch (error) {
      console.error("Consumption Search Error:", error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to search consumptions",
      };
    }
  }

  /**
   * Get available stock for consumption
   */
  async getAvailableStockForConsumption(departmentId: number, productId?: number): Promise<OperationResult<ProductStockBalance[]>> {
    try {
      const params = new URLSearchParams({
        departmentId: departmentId.toString(),
      });
      if (productId) {
        params.append("productId", productId.toString());
      }
      const url = `${this.compositeEndpoint}/GetAvailableStockForConsumption?${params.toString()}`;
      return await this.apiService.get<OperationResult<ProductStockBalance[]>>(url, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to retrieve available stock for consumption",
      };
    }
  }

  /**
   * Validate stock availability before consumption
   */
  async validateStockAvailability(request: ValidateConsumptionStockRequest): Promise<OperationResult<boolean>> {
    try {
      // Ensure proper casing for backend API
      const validationRequest = {
        DepartmentId: request.departmentId,
        ConsumptionDetails: request.consumptionDetails,
      };

      return await this.apiService.post<OperationResult<boolean>>(`${this.compositeEndpoint}/ValidateStockAvailability`, validationRequest, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to validate stock availability",
      };
    }
  }

  /**
   * Get consumption summary
   */
  async getConsumptionSummary(startDate?: Date, endDate?: Date, departmentId?: number): Promise<OperationResult<any>> {
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
      const queryString = params.toString();
      const url = `${this.compositeEndpoint}/GetConsumptionSummary${queryString ? `?${queryString}` : ""}`;

      return await this.apiService.get<OperationResult<any>>(url, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to retrieve consumption summary",
      };
    }
  }

  /**
   * Get consumptions by date range
   */
  async getConsumptionsByDateRange(startDate: Date, endDate: Date, departmentId?: number): Promise<OperationResult<ProductConsumptionMastDto[]>> {
    try {
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      if (departmentId) {
        params.append("departmentId", departmentId.toString());
      }
      const url = `${this.compositeEndpoint}/GetConsumptionsByDateRange?${params.toString()}`;

      return await this.apiService.get<OperationResult<ProductConsumptionMastDto[]>>(url, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to retrieve consumptions by date range",
      };
    }
  }

  /**
   * Bulk create consumptions
   */
  async bulkCreateConsumptions(consumptionDtos: ProductConsumptionCompositeDto[]): Promise<OperationResult<ProductConsumptionCompositeDto[]>> {
    try {
      return await this.apiService.post<OperationResult<ProductConsumptionCompositeDto[]>>(`${this.compositeEndpoint}/BulkCreateConsumptions`, consumptionDtos, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to bulk create consumptions",
      };
    }
  }

  /**
   * Delete consumption
   */
  async deleteConsumption(consumptionId: number): Promise<OperationResult<boolean>> {
    try {
      return await this.delete(consumptionId);
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to delete consumption",
      };
    }
  }

  /**
   * Get consumption statistics
   */
  async getConsumptionStatistics(departmentId?: number, startDate?: Date, endDate?: Date): Promise<OperationResult<any>> {
    try {
      const params = new URLSearchParams();
      if (departmentId) {
        params.append("departmentId", departmentId.toString());
      }
      if (startDate) {
        params.append("startDate", startDate.toISOString());
      }
      if (endDate) {
        params.append("endDate", endDate.toISOString());
      }
      const queryString = params.toString();
      const url = `${this.compositeEndpoint}/GetStatistics${queryString ? `?${queryString}` : ""}`;

      return await this.apiService.get<OperationResult<any>>(url, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to retrieve consumption statistics",
      };
    }
  }

  /**
   * Export consumptions in different formats
   */
  async exportConsumptions(format: "excel" | "pdf" | "csv", searchRequest?: ProductConsumptionSearchRequest): Promise<OperationResult<Blob>> {
    try {
      const endpoint = `${this.compositeEndpoint}/Export${format.charAt(0).toUpperCase() + format.slice(1)}`;

      const response = await fetch(`${APIConfig.inventoryManagementURL}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.getToken()}`,
        },
        body: searchRequest ? JSON.stringify(searchRequest) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();

      return {
        success: true,
        data: blob,
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : `Failed to export consumptions as ${format}`,
      };
    }
  }
}

export const productConsumptionService = new ProductConsumptionService();
