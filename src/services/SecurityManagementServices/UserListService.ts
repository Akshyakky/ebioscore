import { CommonApiService } from "../CommonApiService";
import { OperationResult } from "../../interfaces/Common/OperationResult";
import { APIConfig } from "../../apiConfig";
import { store } from "../../store/store";
import {
  UserListData,
  UserPermissionDto,
} from "../../interfaces/SecurityManagement/UserListData";

const apiService = new CommonApiService({
  baseURL: APIConfig.securityManagementURL,
});
const getToken = () => store.getState().userDetails.token!;

export const getActiveWorkingUsers = async (): Promise<
  OperationResult<UserListData[]>
> => {
  return apiService.get<OperationResult<UserListData[]>>(
    "User/GetActiveWorkingUsers",
    getToken()
  );
};

export const getAllUsers = async (): Promise<
  OperationResult<UserListData[]>
> => {
  return apiService.get<OperationResult<UserListData[]>>(
    "User/GetAllUsers",
    getToken()
  );
};

export const saveUser = async (
  userData: UserListData
): Promise<OperationResult<UserListData>> => {
  return apiService.post<OperationResult<UserListData>>(
    "User/SaveUser",
    userData,
    getToken()
  );
};

export const saveOrUpdateUserPermission = async (
  userPermission: UserPermissionDto
): Promise<OperationResult<UserPermissionDto>> => {
  return apiService.post<OperationResult<UserPermissionDto>>(
    "User/SaveOrUpdateAppUserAccess",
    userPermission,
    getToken()
  );
};

export const saveOrUpdateUserReportPermission = async (
  userReportPermission: UserPermissionDto
): Promise<OperationResult<UserPermissionDto>> => {
  return apiService.post<OperationResult<UserPermissionDto>>(
    "User/SaveOrUpdateAppReportAccess",
    userReportPermission,
    getToken()
  );
};

export const getUserDetails = async (
  appID: number
): Promise<OperationResult<UserListData>> => {
  return apiService.get<OperationResult<UserListData>>(
    `User/GetUserDetails/${appID}`,
    getToken()
  );
};

export const updateUserActiveStatus = async (
  appID: number,
  isActive: boolean
): Promise<OperationResult<any>> => {
  return apiService.post<OperationResult<any>>(
    `User/UpdateUserActiveStatus/${appID}`,
    isActive,
    getToken()
  );
};

export const UserListService = {
  getActiveWorkingUsers,
  getAllUsers,
  saveUser,
  saveOrUpdateUserPermission,
  saveOrUpdateUserReportPermission,
  getUserDetails,
  updateUserActiveStatus,
};
