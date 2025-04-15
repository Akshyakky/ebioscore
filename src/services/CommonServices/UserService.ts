import { APIConfig } from "@/apiConfig";
import { CommonApiService } from "../CommonApiService";
import { store } from "@/store";
import { UserLockData } from "@/interfaces/SecurityManagement/UserLockData.interface";
import { OperationResult } from "@/interfaces/Common/OperationResult";

const apiService = new CommonApiService({
  baseURL: APIConfig.securityManagementURL,
});

// Function to get the token from the store
const getToken = () => store.getState().auth.token!;

export const saveAppUserLock = async (userLockData: UserLockData): Promise<OperationResult<UserLockData>> => {
  try {
    return await apiService.post<OperationResult<UserLockData>>("SecurityManagement/AddAppUserLockAsync", userLockData, getToken());
  } catch (error) {
    console.error(`Error saving User Lock data:`, error);
    throw error;
  }
};

export const UserService = {
  saveAppUserLock,
};
