import axios, { AxiosResponse } from "axios";
import { APIConfig } from "../../apiConfig";
import { OperationResult } from "../../interfaces/Common/OperationResult";
import {
  ProfileMastDto,
  ProfileDetailDto,
  ProfileListSearchResult,
  ReportPermission,
} from "../../interfaces/SecurityManagement/ProfileListData";
import { ModuleOperation } from "../../pages/securityManagement/CommonPage/OperationPermissionDetails";
import { handleError } from "../CommonServices/HandlerError";
import { CommonApiService } from "../CommonApiService";
import { store } from "../../store/store";

const apiService = new CommonApiService({
  baseURL: APIConfig.securityManagementURL,
});

const getToken = () => store.getState().userDetails.token!;

export const saveOrUpdateProfile = async (
  token: string,
  profileMastDto: ProfileMastDto
): Promise<OperationResult<ProfileMastDto>> => {
  try {
    const response: AxiosResponse<OperationResult<ProfileMastDto>> =
      await axios.post(
        `${APIConfig.securityManagementURL}Profile/SaveOrUpdateProfile`,
        profileMastDto,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const saveOrUpdateProfileDetail = async (
  token: string,
  profileDetailDto: ProfileDetailDto
): Promise<OperationResult<ProfileDetailDto>> => {
  try {
    const response: AxiosResponse<OperationResult<ProfileDetailDto>> =
      await axios.post(
        `${APIConfig.securityManagementURL}Profile/SaveOrUpdateProfileDetail`,
        profileDetailDto,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getAllProfileDetails = async (
  token: string
): Promise<OperationResult<ProfileListSearchResult[]>> => {
  try {
    const response: AxiosResponse<OperationResult<ProfileListSearchResult[]>> =
      await axios.get(
        `${APIConfig.securityManagementURL}Profile/GetAllProfileDetails`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getProfileModuleOperations = async (
  token: string,
  subID: number,
  compID: number,
  profileID: number
): Promise<OperationResult<ModuleOperation[]>> => {
  try {
    const response: AxiosResponse<OperationResult<ModuleOperation[]>> =
      await axios.get(
        `${APIConfig.securityManagementURL}SecurityManagement/GetProfileModuleOperations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { subID, compID, profileID },
        }
      );
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getProfileReportOperations = async (
  token: string,
  subID: number,
  compID: number,
  profileID: number
): Promise<OperationResult<ReportPermission[]>> => {
  try {
    const response: AxiosResponse<OperationResult<ReportPermission[]>> =
      await axios.get(
        `${APIConfig.securityManagementURL}SecurityManagement/GetProfileReportOperations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { subID, compID, profileID },
        }
      );
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const updateProfileActiveStatus = async (
  profileID: number,
  rActiveYN: boolean
): Promise<OperationResult<boolean>> => {
  debugger;
  return apiService.put<OperationResult<boolean>>(
    `Profile/UpdateProfileActiveStatus/${profileID}`,
    rActiveYN,
    getToken()
  );
};
export const ProfileService = {
  saveOrUpdateProfile,
  saveOrUpdateProfileDetail,
  getAllProfileDetails,
  getProfileModuleOperations,
  getProfileReportOperations,
  updateProfileActiveStatus,
};
