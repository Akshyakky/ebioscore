import { DepartmentDto } from "@/interfaces/Billing/DepartmentDto";
import { AlertDto } from "@/interfaces/Common/AlertManager";
import { createEntityService } from "@/utils/Common/serviceFactory";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { CommonApiService } from "../CommonApiService";
import { APIConfig } from "@/apiConfig";
import { store } from "@/store";

// Create the base services using the factory
const baseAlertService = createEntityService<AlertDto>("Alert", "commonURL");
export const departmentService = createEntityService<DepartmentDto>("Department", "commonURL");

// Initialize API service for the custom method
const commonApiService = new CommonApiService({ baseURL: APIConfig.commonURL });
const getToken = () => store.getState().auth.token!;

// Create the alertService with all required methods
export const alertService = {
  // Standard methods from the base service
  getAll: baseAlertService.getAll,
  getById: baseAlertService.getById,
  save: baseAlertService.save,
  updateActiveStatus: baseAlertService.updateActiveStatus,
  getNextCode: baseAlertService.getNextCode,
  find: baseAlertService.find,
  getPaged: baseAlertService.getPaged,
  firstOrDefault: baseAlertService.firstOrDefault,
  count: baseAlertService.count,
  any: baseAlertService.any,
  getAllWithIncludes: baseAlertService.getAllWithIncludes,
  bulkSave: baseAlertService.bulkSave,
  bulkUpdate: baseAlertService.bulkUpdate,

  // Custom method for retrieving alerts by patient chart ID
  GetAlertBypChartID: async (pChartID: number): Promise<OperationResult<AlertDto[]>> => {
    try {
      return await commonApiService.get<OperationResult<AlertDto[]>>(`Alert/GetAlertBypChartID/${pChartID}`, getToken());
    } catch (error) {
      console.error(`Error fetching alerts for patient ${pChartID}:`, error);
      return {
        success: false,
        errorMessage: `Failed to retrieve alerts: ${error instanceof Error ? error.message : String(error)}`,
        data: [],
      };
    }
  },
};
