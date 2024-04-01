//services/CommonService/UserService.ts
import axios from "axios";
import { APIConfig } from "../../apiConfig";
import { OperationResult } from "../../interfaces/Common/OperationResult";
import { UserLockData } from "../../interfaces/SecurityManagement/UserLockData.interface";

export const saveAppUserLock = async (
  token: string,
  userLockData: UserLockData
): Promise<OperationResult<UserLockData>> => {
  const url = `${APIConfig.securityManagementURL}SecurityManagement/AddAppUserLockAsync`;
  const headers = { Authorization: `Bearer ${token}` };
  try {
    const response = await axios.post(url, userLockData, { headers });
    return response.data;
  } catch (error) {
    console.error(`Error saving User Lock data:${error}`);
    throw error;
  }
};
