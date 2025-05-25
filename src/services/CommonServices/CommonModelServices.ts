import { AlertDto } from "@/interfaces/Common/AlertManager";
import { createEntityService } from "@/utils/Common/serviceFactory";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { CommonApiService } from "../CommonApiService";
import { APIConfig } from "@/apiConfig";
import { store } from "@/store";

// Initialize API service for the custom method
const commonApiService = new CommonApiService({ baseURL: APIConfig.commonURL });
const getToken = () => store.getState().auth.token!;

// Create the base services using the factory
export const baseAlertService = createEntityService<AlertDto>("Alert", "commonURL");

// Create the alertService with all required methods
export const alertService = {
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
