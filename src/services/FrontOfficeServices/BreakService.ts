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
   * Saves a break list with associated break connection details
   * @param breakListDto The break list data to save
   * @returns Promise containing operation result with saved break data
   */
  async saveBreakList(breakListDto: BreakListDto): Promise<OperationResult<BreakListDto>> {
    try {
      if (!breakListDto) {
        return {
          success: false,
          errorMessage: "Break list data is required",
          data: undefined,
        };
      }

      return await this.apiService.post<OperationResult<BreakListDto>>(`${this.baseEndpoint}/Save`, breakListDto, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to save break list",
        data: undefined,
      };
    }
  }

  /**
   * Checks for break conflicts with appointment scheduling
   * @param hplId Provider/resource ID
   * @param appointmentDate Appointment date
   * @param startTime Start time
   * @param endTime End time
   * @returns Promise containing boolean result indicating if there are conflicts
   */
  async checkBreakConflicts(hplId: number, appointmentDate: Date, startTime: Date, endTime: Date): Promise<OperationResult<boolean>> {
    try {
      if (!hplId || hplId <= 0) {
        return {
          success: false,
          errorMessage: "Valid provider/resource ID is required",
          data: undefined,
        };
      }

      const dateOnlyStart = new Date(appointmentDate);
      dateOnlyStart.setHours(0, 0, 0, 0);

      const dateOnlyEnd = new Date(appointmentDate);
      dateOnlyEnd.setHours(23, 59, 59, 999);

      // Get active breaks for the specific date and provider/resource
      const breaksResult = await this.getActiveBreaks(dateOnlyStart, dateOnlyEnd, hplId);

      if (!breaksResult.success || !breaksResult.data) {
        return {
          success: true,
          data: false, // No breaks found, no conflict
        };
      }

      // Check if appointment time conflicts with any break
      const hasConflict = breaksResult.data.some((breakItem) => {
        const breakStart = new Date(breakItem.bLStartDate);
        breakStart.setHours(new Date(breakItem.bLStartTime).getHours(), new Date(breakItem.bLStartTime).getMinutes());

        const breakEnd = new Date(breakItem.bLEndDate);
        breakEnd.setHours(new Date(breakItem.bLEndTime).getHours(), new Date(breakItem.bLEndTime).getMinutes());

        // Check for time overlap
        return startTime < breakEnd && endTime > breakStart;
      });

      return {
        success: true,
        data: hasConflict,
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to check break conflicts",
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
