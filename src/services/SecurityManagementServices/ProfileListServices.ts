// services/ProfileService.ts

import { OperationResult } from "../../interfaces/Common/OperationResult";
import { ProfileMastDto } from "../../interfaces/SecurityManagement/ProfileListData";
import { ProfileDetailDto } from "../../interfaces/SecurityManagement/ProfileListData";
import axios from "axios";
import { APIConfig } from "../../apiConfig";

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
      return this.handleError(error);
    }
  }

  async saveOrUpdateProfileDetail(
    token: string,
    profileDetailDto: ProfileDetailDto
  ): Promise<OperationResult<ProfileDetailDto>> {
    try {
      const response = await axios.post<OperationResult<ProfileDetailDto>>(
        `${APIConfig.securityManagementURL}/SaveOrUpdateProfileDetail`,
        profileDetailDto,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  private handleError(error: any): OperationResult<any> {
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
    };
  }
}
