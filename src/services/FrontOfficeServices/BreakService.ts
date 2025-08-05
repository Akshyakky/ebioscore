// src/services/FrontOfficeServices/BreakService.ts
import { APIConfig } from "@/apiConfig";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { BreakDto, BreakListData, BreakListDto } from "@/interfaces/FrontOffice/BreakListDto";
import { CommonApiService } from "@/services/CommonApiService";
import { GenericEntityService } from "@/services/GenericEntityService/GenericEntityService";

class BreakService extends GenericEntityService<BreakListDto> {
  constructor() {
    super(
      new CommonApiService({
        baseURL: APIConfig.frontOffice,
      }),
      "Break"
    );
  }

  /**
   * Retrieves all breaks with detailed information including assignments and suspend status
   * @returns Promise containing operation result with list of detailed breaks
   */
  async getAllBreaksDetailed(): Promise<OperationResult<BreakDto[]>> {
    try {
      return await this.apiService.get<OperationResult<BreakDto[]>>(`${this.baseEndpoint}/GetAll`, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to retrieve breaks",
        data: undefined,
      };
    }
  }

  /**
   * Retrieves active breaks for a specific date range and optional provider/resource
   * @param startDate Start date for the search range
   * @param endDate End date for the search range
   * @param hplId Optional provider/resource ID to filter by
   * @returns Promise containing operation result with list of active breaks
   */
  async getActiveBreaks(startDate: Date, endDate: Date, hplId?: number): Promise<OperationResult<BreakListData[]>> {
    try {
      if (startDate > endDate) {
        return {
          success: false,
          errorMessage: "Start date cannot be later than end date",
          data: undefined,
        };
      }

      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      if (hplId && hplId > 0) {
        params.append("hplId", hplId.toString());
      }

      return await this.apiService.get<OperationResult<BreakListData[]>>(`${this.baseEndpoint}/GetActiveBreaks?${params.toString()}`, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to retrieve active breaks",
        data: undefined,
      };
    }
  }

  /**
   * Gets breaks for a specific provider/resource and date range
   * @param hplId Provider/resource ID
   * @param startDate Start date
   * @param endDate End date
   * @returns Promise containing operation result with filtered breaks
   */
  async getBreaksByProvider(hplId: number, startDate: Date, endDate: Date): Promise<OperationResult<BreakDto[]>> {
    try {
      const allBreaksResult = await this.getAllBreaksDetailed();

      if (!allBreaksResult.success || !allBreaksResult.data) {
        return {
          success: false,
          errorMessage: allBreaksResult.errorMessage || "Failed to retrieve breaks",
          data: undefined,
        };
      }

      // Filter breaks by provider and date range
      const filteredBreaks = allBreaksResult.data.filter((breakItem) => {
        const matchesProvider = breakItem.hPLID === hplId;
        const breakStartDate = new Date(breakItem.bLStartDate);
        const breakEndDate = new Date(breakItem.bLEndDate);

        const matchesDateRange =
          (breakStartDate >= startDate && breakStartDate <= endDate) ||
          (breakEndDate >= startDate && breakEndDate <= endDate) ||
          (breakStartDate <= startDate && breakEndDate >= endDate);

        return matchesProvider && matchesDateRange && breakItem.rActiveYN === "Y";
      });

      return {
        success: true,
        data: filteredBreaks,
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to get breaks by provider",
        data: undefined,
      };
    }
  }
}

export const breakService = new BreakService();
