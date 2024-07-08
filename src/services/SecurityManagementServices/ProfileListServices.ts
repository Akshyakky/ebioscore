import axios, { AxiosError } from "axios";
import { APIConfig } from "../../apiConfig";
import { OperationResult } from "../../interfaces/Common/OperationResult";
import {
  ProfileMastDto,
  ProfileDetailDto,
  ProfileListSearchResult,
  ReportPermissionDto,
  ReportPermission,
} from "../../interfaces/SecurityManagement/ProfileListData";

const handleError = <T>(error: any): OperationResult<T> => {
  let errorMessage = "An unknown error occurred.";
  if (axios.isAxiosError(error)) {
    if (error.response) {
      errorMessage =
        error.response.data.errorMessage ||
        error.response.data.message ||
        errorMessage;
    } else if (error.request) {
      errorMessage = "No response received from the server.";
    } else {
      errorMessage = error.message;
    }
  } else {
    errorMessage = error.message || errorMessage;
  }
  return {
    success: false,
    errorMessage: errorMessage,
  } as OperationResult<T>;
};

export const ProfileService = {
  async saveOrUpdateProfile(
    token: string,
    profileMastDto: ProfileMastDto
  ): Promise<OperationResult<ProfileMastDto>> {
    try {
      const url = `${APIConfig.securityManagementURL}Profile/SaveOrUpdateProfile`;
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      const response = await axios.post<OperationResult<ProfileMastDto>>(
        url,
        profileMastDto,
        { headers }
      );
      return response.data;
    } catch (error) {
      return handleError<ProfileMastDto>(error);
    }
  },

  async saveOrUpdateProfileDetail(
    token: string,
    profileDetailDto: ProfileDetailDto
  ): Promise<OperationResult<ProfileDetailDto>> {
    try {
      const url = `${APIConfig.securityManagementURL}Profile/SaveOrUpdateProfileDetail`;
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      const response = await axios.post<OperationResult<ProfileDetailDto>>(
        url,
        profileDetailDto,
        { headers }
      );
      return response.data;
    } catch (error) {
      return handleError<ProfileDetailDto>(error);
    }
  },

  async getAllProfileDetails(
    token: string
  ): Promise<ProfileListSearchResult[]> {
    try {
      const url = `${APIConfig.securityManagementURL}Profile/GetAllProfileDetails`;
      console.log("Fetching all profile details from URL:", url);
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      const response = await axios.get<ProfileListSearchResult[]>(url, {
        headers,
      });
      console.log("Received response:", response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error(
          "Error response from getAllProfileDetails:",
          error.response.data
        );
      } else {
        console.error("Error during fetching profile details:", error);
      }
      throw error;
    }
  },

  async getProfileModuleOperations(
    token: string,
    subID: number,
    compID: number,
    profileID: number
  ): Promise<OperationResult<ReportPermissionDto[]>> {
    try {
      const url = `${APIConfig.securityManagementURL}SecurityManagement/GetProfileModuleOperations`;
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      const params = { subID, compID, profileID };
      const response = await axios.get<OperationResult<ReportPermissionDto[]>>(
        url,
        { params, headers }
      );
      return response.data;
    } catch (error) {
      return handleError<ReportPermissionDto[]>(error);
    }
  },

  async getProfileReportOperations(
    token: string,
    subID: number,
    compID: number,
    profileID: number
  ): Promise<OperationResult<ReportPermission[]>> {
    try {
      const url = `${APIConfig.securityManagementURL}SecurityManagement/GetProfileReportOperations`;
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      const params = { subID, compID, profileID };
      const response = await axios.get<OperationResult<ReportPermission[]>>(
        url,
        { params, headers }
      );
      return response.data;
    } catch (error) {
      return handleError<ReportPermission[]>(error);
    }
  },
};
