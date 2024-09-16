import { APIConfig } from "../../apiConfig";
import { OperationResult } from "../../interfaces/Common/OperationResult";
import { store } from "../../store/store";
import { CommonApiService } from "../CommonApiService";

// Initialize ApiService with the base URL for the common API
const apiService = new CommonApiService({ baseURL: APIConfig.commonURL });

// Function to get the token from the store
const getToken = () => store.getState().userDetails.token!;

const fetchAllHospWorkingHours = async (): Promise<OperationResult<any[]>> => {
  return apiService.get<OperationResult<any[]>>(
    "HospitalAdministration/GetAllHospWorkingHour",
    getToken()
  );
};

const getHospWorkingHourById = async (
  hwrkId: number,
  langType: string
): Promise<OperationResult<any>> => {
  return apiService.get<OperationResult<any>>(
    `HospitalAdministration/GetHospWorkingHourById/${hwrkId}/${langType}`,
    getToken()
  );
};

export const CommonService = {
  fetchAllHospWorkingHours,
  getHospWorkingHourById,
};
