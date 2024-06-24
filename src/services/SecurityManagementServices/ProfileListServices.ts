import axios, { AxiosError } from "axios";
import { APIConfig } from "../../apiConfig";
import { OperationResult } from "../../interfaces/Common/OperationResult";
import {
  ProfileMastDto,
  ProfileDetailDto,
  ProfileListSearchResult,
  ReportPermissionDto,
} from "../../interfaces/SecurityManagement/ProfileListData";

function isAxiosError(error: unknown): error is AxiosError {
  return axios.isAxiosError(error);
}

export class ProfileService {
  async saveOrUpdateProfile(
    token: string,
    profileMastDto: ProfileMastDto
  ): Promise<OperationResult<ProfileMastDto>> {
    try {
      const response = await axios.post<OperationResult<ProfileMastDto>>(
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
      return this.handleError<ProfileMastDto>(error);
    }
  }

  async saveOrUpdateProfileDetail(
    token: string,
    profileDetailDto: ProfileDetailDto
  ): Promise<OperationResult<ProfileDetailDto>> {
    try {
      const response = await axios.post<OperationResult<ProfileDetailDto>>(
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
      return this.handleError<ProfileDetailDto>(error);
    }
  }

  async getAllProfileDetails(
    token: string
  ): Promise<ProfileListSearchResult[]> {
    try {
      const url = `${APIConfig.securityManagementURL}Profile/GetAllProfileDetails`;
      console.log("Fetching all profile details from URL:", url);
      const response = await axios.get<ProfileListSearchResult[]>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Received response:", response.data);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        console.error(
          "Error response from getAllProfileDetails:",
          error.response.data
        );
      } else {
        console.error("Error during fetching profile details:", error);
      }
      throw error;
    }
  }

  async getReportPermissions(
    token: string,
    subID: number,
    compID: number,
    profileID: number
  ): Promise<OperationResult<ReportPermissionDto[]>> {
    try {
      const response = await axios.get<OperationResult<ReportPermissionDto[]>>(
        `${APIConfig.securityManagementURL}SecurityManagement/GetProfileModuleOperations`,
        {
          params: { subID, compID, profileID },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return this.handleError<ReportPermissionDto[]>(error);
    }
  }

  private handleError<T>(error: any): OperationResult<T> {
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
  }
}

export default new ProfileService();
