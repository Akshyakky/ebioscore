import { APIConfig } from "@/apiConfig";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { PaginatedList } from "@/interfaces/Common/PaginatedList";
import { HospWorkHoursDto, WorkHoursFilterDto } from "@/interfaces/FrontOffice/HospWorkHoursDto";
import { CommonApiService } from "@/services/CommonApiService";
import { GenericEntityService } from "@/services/GenericEntityService/GenericEntityService";

class HospWorkHoursService extends GenericEntityService<HospWorkHoursDto> {
  constructor() {
    super(
      new CommonApiService({
        baseURL: APIConfig.frontOffice,
      }),
      "HospWorkHours"
    );
  }

  /**
   * Retrieves work hours by language type
   * @param langType The language type to filter by
   * @returns Promise containing operation result with list of work hours
   */
  async getWorkHoursByLanguage(langType: string): Promise<OperationResult<HospWorkHoursDto[]>> {
    try {
      if (!langType || langType.trim() === "") {
        return {
          success: false,
          errorMessage: "Language type is required",
          data: undefined,
        };
      }

      return await this.apiService.get<OperationResult<HospWorkHoursDto[]>>(`${this.baseEndpoint}/GetByLanguage/${encodeURIComponent(langType)}`, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to retrieve work hours by language",
        data: undefined,
      };
    }
  }

  /**
   * Saves work hours with built-in overlap validation
   * @param dto The work hours data to save
   * @returns Promise containing operation result with saved work hours data
   */
  async saveWorkHours(dto: HospWorkHoursDto): Promise<OperationResult<HospWorkHoursDto>> {
    try {
      if (!dto) {
        return {
          success: false,
          errorMessage: "Work hours data is required",
          data: undefined,
        };
      }

      return await this.apiService.post<OperationResult<HospWorkHoursDto>>(`${this.baseEndpoint}/Save`, dto, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to save work hours",
        data: undefined,
      };
    }
  }

  /**
   * Retrieves work hours with advanced filtering and pagination
   * @param filter Filter criteria for work hours
   * @param pageIndex Page number (0-based)
   * @param pageSize Number of records per page
   * @param sortBy Property to sort by
   * @param ascending Sort direction
   * @returns Promise containing paginated operation result
   */
  async getWorkHoursWithFilter(
    filter: WorkHoursFilterDto,
    pageIndex: number = 0,
    pageSize: number = 10,
    sortBy: string = "hwrkID",
    ascending: boolean = true
  ): Promise<OperationResult<PaginatedList<HospWorkHoursDto>>> {
    try {
      const params = new URLSearchParams({
        pageIndex: pageIndex.toString(),
        pageSize: pageSize.toString(),
        sortBy,
        ascending: ascending.toString(),
      });

      // Build filter expression
      const filterExpressions: string[] = [];

      if (filter.langType) {
        filterExpressions.push(`LangType == "${filter.langType}"`);
      }

      if (filter.daysDesc) {
        filterExpressions.push(`DaysDesc == "${filter.daysDesc}"`);
      }

      if (filter.wkHoliday) {
        filterExpressions.push(`WkHoliday == '${filter.wkHoliday}'`);
      }

      if (filter.status) {
        filterExpressions.push(`rActiveYN == '${filter.status}'`);
      }

      if (filterExpressions.length > 0) {
        params.append("filter", filterExpressions.join(" && "));
      }

      return await this.apiService.get<OperationResult<PaginatedList<HospWorkHoursDto>>>(`${this.baseEndpoint}/GetPaged?${params.toString()}`, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to retrieve filtered work hours",
        data: undefined,
      };
    }
  }

  /**
   * Validates work hours data before saving
   * @param dto The work hours data to validate
   * @returns Promise containing validation result
   */
  async validateWorkHours(dto: HospWorkHoursDto): Promise<OperationResult<boolean>> {
    try {
      if (!dto) {
        return {
          success: false,
          errorMessage: "Work hours data is required for validation",
          data: undefined,
        };
      }

      return await this.apiService.post<OperationResult<boolean>>(`${this.baseEndpoint}/Validate`, dto, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to validate work hours",
        data: undefined,
      };
    }
  }

  /**
   * Bulk saves multiple work hours records
   * @param workHours Array of work hours data to save
   * @returns Promise containing operation result
   */
  async bulkSaveWorkHours(workHours: HospWorkHoursDto[]): Promise<OperationResult<boolean>> {
    try {
      if (!workHours || workHours.length === 0) {
        return {
          success: false,
          errorMessage: "Work hours data is required for bulk save",
          data: undefined,
        };
      }

      return await this.apiService.post<OperationResult<boolean>>(`${this.baseEndpoint}/BulkSave`, workHours, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to bulk save work hours",
        data: undefined,
      };
    }
  }

  /**
   * Bulk updates multiple work hours records
   * @param workHours Array of work hours data to update
   * @returns Promise containing operation result
   */
  async bulkUpdateWorkHours(workHours: HospWorkHoursDto[]): Promise<OperationResult<boolean>> {
    try {
      if (!workHours || workHours.length === 0) {
        return {
          success: false,
          errorMessage: "Work hours data is required for bulk update",
          data: undefined,
        };
      }

      return await this.apiService.put<OperationResult<boolean>>(`${this.baseEndpoint}/BulkUpdate`, workHours, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to bulk update work hours",
        data: undefined,
      };
    }
  }

  /**
   * Bulk deletes multiple work hours records
   * @param ids Array of work hours IDs to delete
   * @param softDelete Whether to perform soft delete (default: true)
   * @returns Promise containing operation result
   */
  async bulkDeleteWorkHours(ids: number[], softDelete: boolean = true): Promise<OperationResult<boolean>> {
    try {
      if (!ids || ids.length === 0) {
        return {
          success: false,
          errorMessage: "Work hours IDs are required for bulk delete",
          data: undefined,
        };
      }

      const params = new URLSearchParams({
        softDelete: softDelete.toString(),
      });

      return await this.apiService.delete<OperationResult<boolean>>(`${this.baseEndpoint}/BulkDelete?${params.toString()}`, this.getToken(), ids);
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to bulk delete work hours",
        data: undefined,
      };
    }
  }

  /**
   * Toggles the active status of a work hours record
   * @param id The work hours ID
   * @param active The new active status
   * @returns Promise containing operation result
   */
  async updateActiveStatus(id: number, active: boolean): Promise<OperationResult<boolean>> {
    try {
      if (!id || id <= 0) {
        return {
          success: false,
          errorMessage: "Valid work hours ID is required",
          data: undefined,
        };
      }

      return await this.apiService.put<OperationResult<boolean>>(`${this.baseEndpoint}/UpdateActiveStatus/${id}`, active, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to update active status",
        data: undefined,
      };
    }
  }

  /**
   * Checks if work hours exist for a specific language and day combination
   * @param langType Language type
   * @param dayDesc Day description
   * @returns Promise containing boolean result
   */
  async checkWorkHoursExist(langType: string, dayDesc: string): Promise<OperationResult<boolean>> {
    try {
      if (!langType || !dayDesc) {
        return {
          success: false,
          errorMessage: "Both language type and day description are required",
          data: undefined,
        };
      }

      const predicate = `LangType == "${langType}" && DaysDesc == "${dayDesc}"`;

      return await this.apiService.get<OperationResult<boolean>>(`${this.baseEndpoint}/Any?predicate=${encodeURIComponent(predicate)}`, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to check work hours existence",
        data: undefined,
      };
    }
  }

  /**
   * Gets the count of work hours records matching specific criteria
   * @param filter Optional filter criteria
   * @returns Promise containing count result
   */
  async getWorkHoursCount(filter?: WorkHoursFilterDto): Promise<OperationResult<number>> {
    try {
      const params = new URLSearchParams();

      if (filter) {
        const filterExpressions: string[] = [];

        if (filter.langType) {
          filterExpressions.push(`LangType == "${filter.langType}"`);
        }

        if (filter.daysDesc) {
          filterExpressions.push(`DaysDesc == "${filter.daysDesc}"`);
        }

        if (filter.wkHoliday) {
          filterExpressions.push(`WkHoliday == '${filter.wkHoliday}'`);
        }

        if (filter.status) {
          filterExpressions.push(`rActiveYN == '${filter.status}'`);
        }

        if (filterExpressions.length > 0) {
          params.append("predicate", filterExpressions.join(" && "));
        }
      }

      return await this.apiService.get<OperationResult<number>>(`${this.baseEndpoint}/Count?${params.toString()}`, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to get work hours count",
        data: undefined,
      };
    }
  }
}

export const hospWorkHoursService = new HospWorkHoursService();
