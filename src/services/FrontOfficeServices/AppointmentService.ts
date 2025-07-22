import { APIConfig } from "@/apiConfig";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { PaginatedList } from "@/interfaces/Common/PaginatedList";
import { AppointBookingDto, AppointmentFilterDto, CancelAppointmentDto, ContactMastDto } from "@/interfaces/FrontOffice/AppointBookingDto";
import { CommonApiService } from "@/services/CommonApiService";
import { GenericEntityService } from "@/services/GenericEntityService/GenericEntityService";

class AppointmentService extends GenericEntityService<AppointBookingDto> {
  constructor() {
    super(
      new CommonApiService({
        baseURL: APIConfig.frontOffice,
      }),
      "Appointment"
    );
  }

  /**
   * Retrieves appointments by provider ID and date range
   * @param hplId The healthcare provider ID
   * @param startDate Start date for the search range
   * @param endDate End date for the search range
   * @returns Promise containing operation result with list of appointments
   */
  async getAppointmentsByProvider(hplId: number, startDate: Date, endDate: Date): Promise<OperationResult<AppointBookingDto[]>> {
    try {
      if (!hplId || hplId <= 0) {
        return {
          success: false,
          errorMessage: "Valid provider ID is required",
          data: undefined,
        };
      }

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

      return await this.apiService.get<OperationResult<AppointBookingDto[]>>(`${this.baseEndpoint}/GetByProvider/${hplId}?${params.toString()}`, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to retrieve appointments by provider",
        data: undefined,
      };
    }
  }

  /**
   * Retrieves appointments by date range
   * @param startDate Start date for the search range
   * @param endDate End date for the search range
   * @returns Promise containing operation result with list of appointments
   */
  async getAppointmentsByDateRange(startDate: Date, endDate: Date): Promise<OperationResult<AppointBookingDto[]>> {
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

      return await this.apiService.get<OperationResult<AppointBookingDto[]>>(`${this.baseEndpoint}/GetByDateRange?${params.toString()}`, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to retrieve appointments by date range",
        data: undefined,
      };
    }
  }

  /**
   * Retrieves appointments by patient chart ID
   * @param pChartId The patient chart ID
   * @returns Promise containing operation result with list of appointments
   */
  async getAppointmentsByPatient(pChartId: number): Promise<OperationResult<AppointBookingDto[]>> {
    try {
      if (!pChartId || pChartId <= 0) {
        return {
          success: false,
          errorMessage: "Valid patient chart ID is required",
          data: undefined,
        };
      }

      return await this.apiService.get<OperationResult<AppointBookingDto[]>>(`${this.baseEndpoint}/GetByPatient/${pChartId}`, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to retrieve appointments by patient",
        data: undefined,
      };
    }
  }

  /**
   * Saves appointment data with built-in validation and overlap checking
   * @param dto The appointment data to save
   * @returns Promise containing operation result with saved appointment data
   */
  async saveAppointment(dto: AppointBookingDto): Promise<OperationResult<AppointBookingDto>> {
    try {
      if (!dto) {
        return {
          success: false,
          errorMessage: "Appointment data is required",
          data: undefined,
        };
      }

      return await this.apiService.post<OperationResult<AppointBookingDto>>(`${this.baseEndpoint}/Save`, dto, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to save appointment",
        data: undefined,
      };
    }
  }

  /**
   * Cancels an appointment
   * @param appointmentId The appointment ID to cancel
   * @param cancelReason Reason for cancellation
   * @returns Promise containing operation result indicating success or failure
   */
  async cancelAppointment(appointmentId: number, cancelReason: string): Promise<OperationResult<boolean>> {
    try {
      if (!appointmentId || appointmentId <= 0) {
        return {
          success: false,
          errorMessage: "Valid appointment ID is required",
          data: undefined,
        };
      }

      return await this.apiService.post<OperationResult<boolean>>(`${this.baseEndpoint}/Cancel/${appointmentId}`, cancelReason, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to cancel appointment",
        data: undefined,
      };
    }
  }

  /**
   * Retrieves all appointment consultants
   * @returns Promise containing operation result with list of consultants
   */
  async getAllAppointmentConsultants(): Promise<OperationResult<ContactMastDto[]>> {
    try {
      return await this.apiService.get<OperationResult<ContactMastDto[]>>(`${this.baseEndpoint}/GetAllAppointmentConsultants`, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to retrieve appointment consultants",
        data: undefined,
      };
    }
  }

  /**
   * Retrieves today's appointments with optional provider filter
   * @param hplId Optional healthcare provider ID to filter by
   * @returns Promise containing operation result with list of today's appointments
   */
  async getTodaysAppointments(hplId?: number): Promise<OperationResult<AppointBookingDto[]>> {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

      if (hplId) {
        return await this.getAppointmentsByProvider(hplId, startOfDay, endOfDay);
      } else {
        return await this.getAppointmentsByDateRange(startOfDay, endOfDay);
      }
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to retrieve today's appointments",
        data: undefined,
      };
    }
  }

  /**
   * Retrieves appointments with advanced filtering and pagination
   * @param filter Filter criteria for appointments
   * @param pageIndex Page number (0-based)
   * @param pageSize Number of records per page
   * @param sortBy Property to sort by
   * @param ascending Sort direction
   * @returns Promise containing paginated operation result
   */
  async getAppointmentsWithFilter(
    filter: AppointmentFilterDto,
    pageIndex: number = 0,
    pageSize: number = 10,
    sortBy: string = "abDate",
    ascending: boolean = true
  ): Promise<OperationResult<PaginatedList<AppointBookingDto>>> {
    try {
      const params = new URLSearchParams({
        pageIndex: pageIndex.toString(),
        pageSize: pageSize.toString(),
        sortBy,
        ascending: ascending.toString(),
      });

      // Build filter expression
      const filterExpressions: string[] = [];

      if (filter.hplID) {
        filterExpressions.push(`HplID == ${filter.hplID}`);
      }

      if (filter.pChartID) {
        filterExpressions.push(`PChartID == ${filter.pChartID}`);
      }

      if (filter.abStatus) {
        filterExpressions.push(`AbStatus == "${filter.abStatus}"`);
      }

      if (filter.providerName) {
        filterExpressions.push(`ProviderName.Contains("${filter.providerName}")`);
      }

      if (filter.patientName) {
        filterExpressions.push(`(AbFName.Contains("${filter.patientName}") || AbLName.Contains("${filter.patientName}"))`);
      }

      if (filter.startDate) {
        filterExpressions.push(`AbDate >= DateTime(${filter.startDate.getFullYear()}, ${filter.startDate.getMonth() + 1}, ${filter.startDate.getDate()})`);
      }

      if (filter.endDate) {
        filterExpressions.push(`AbDate <= DateTime(${filter.endDate.getFullYear()}, ${filter.endDate.getMonth() + 1}, ${filter.endDate.getDate()})`);
      }

      if (filterExpressions.length > 0) {
        params.append("filter", filterExpressions.join(" && "));
      }

      return await this.apiService.get<OperationResult<PaginatedList<AppointBookingDto>>>(`${this.baseEndpoint}/GetPaged?${params.toString()}`, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to retrieve filtered appointments",
        data: undefined,
      };
    }
  }

  /**
   * Checks for appointment conflicts for a specific provider and time slot
   * @param hplId Provider ID
   * @param appointmentDate Appointment date
   * @param startTime Start time
   * @param endTime End time
   * @param excludeAppointmentId Optional appointment ID to exclude from conflict check
   * @returns Promise containing boolean result indicating if there are conflicts
   */
  async checkAppointmentConflicts(hplId: number, appointmentDate: Date, startTime: Date, endTime: Date, excludeAppointmentId?: number): Promise<OperationResult<boolean>> {
    try {
      if (!hplId || hplId <= 0) {
        return {
          success: false,
          errorMessage: "Valid provider ID is required",
          data: undefined,
        };
      }

      const dateStr = appointmentDate.toISOString().split("T")[0];
      const startTimeStr = startTime.toTimeString().split(" ")[0];
      const endTimeStr = endTime.toTimeString().split(" ")[0];

      let predicate = `HplID == ${hplId} && AbDate.Date == DateTime.Parse("${dateStr}") && AbStatus != "Cancelled" && ((AbTime < DateTime.Parse("${endTimeStr}") && AbEndTime > DateTime.Parse("${startTimeStr}")))`;

      if (excludeAppointmentId) {
        predicate = `${predicate} && AbID != ${excludeAppointmentId}`;
      }

      return await this.apiService.get<OperationResult<boolean>>(`${this.baseEndpoint}/Any?predicate=${encodeURIComponent(predicate)}`, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to check appointment conflicts",
        data: undefined,
      };
    }
  }

  /**
   * Gets the count of appointments matching specific criteria
   * @param filter Optional filter criteria
   * @returns Promise containing count result
   */
  async getAppointmentCount(filter?: AppointmentFilterDto): Promise<OperationResult<number>> {
    try {
      const params = new URLSearchParams();

      if (filter) {
        const filterExpressions: string[] = [];

        if (filter.hplID) {
          filterExpressions.push(`HplID == ${filter.hplID}`);
        }

        if (filter.pChartID) {
          filterExpressions.push(`PChartID == ${filter.pChartID}`);
        }

        if (filter.abStatus) {
          filterExpressions.push(`AbStatus == "${filter.abStatus}"`);
        }

        if (filter.startDate) {
          filterExpressions.push(`AbDate >= DateTime(${filter.startDate.getFullYear()}, ${filter.startDate.getMonth() + 1}, ${filter.startDate.getDate()})`);
        }

        if (filter.endDate) {
          filterExpressions.push(`AbDate <= DateTime(${filter.endDate.getFullYear()}, ${filter.endDate.getMonth() + 1}, ${filter.endDate.getDate()})`);
        }

        if (filterExpressions.length > 0) {
          params.append("predicate", filterExpressions.join(" && "));
        }
      }

      return await this.apiService.get<OperationResult<number>>(`${this.baseEndpoint}/Count?${params.toString()}`, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to get appointment count",
        data: undefined,
      };
    }
  }

  /**
   * Bulk cancels multiple appointments
   * @param cancelData Array of appointment cancellation data
   * @returns Promise containing operation result
   */
  async bulkCancelAppointments(cancelData: CancelAppointmentDto[]): Promise<OperationResult<boolean>> {
    try {
      if (!cancelData || cancelData.length === 0) {
        return {
          success: false,
          errorMessage: "Cancellation data is required for bulk cancel",
          data: undefined,
        };
      }

      return await this.apiService.post<OperationResult<boolean>>(`${this.baseEndpoint}/BulkCancel`, cancelData, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to bulk cancel appointments",
        data: undefined,
      };
    }
  }
}

export const appointmentService = new AppointmentService();
