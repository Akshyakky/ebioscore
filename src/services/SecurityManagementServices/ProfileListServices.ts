import { GenericEntityService } from "../GenericEntityService/GenericEntityService";
import { CommonApiService } from "../CommonApiService";
import { APIConfig } from "@/apiConfig";
import { ProfileDetailDto, ProfileModuleOperationDto, ProfileDetailedViewDto } from "@/interfaces/SecurityManagement/ProfileListData";
import { OperationResult } from "@/interfaces/Common/OperationResult";
class ProfileService extends GenericEntityService<ProfileModuleOperationDto> {
  constructor() {
    super(
      new CommonApiService({
        baseURL: APIConfig.securityManagementURL,
      }),
      "Profile"
    );
  }
  async getProfileDetailsByType(aUGrpID: number, subID: number, profileID: number, profileType: string): Promise<ProfileDetailDto[]> {
    return this.apiService.get<ProfileDetailDto[]>(
      `${this.baseEndpoint}/GetProfileDetailsByType?aUGrpID=${aUGrpID}&subID=${subID}&profileID=${profileID}&profileType=${profileType}`,
      this.getToken()
    );
  }
  async getAllActiveProfileDetailsByType(profileId: number, profileType: string): Promise<OperationResult<ProfileDetailedViewDto[]>> {
    return this.apiService.get<OperationResult<ProfileDetailedViewDto[]>>(
      `${this.baseEndpoint}/GetAllActiveProfileDetailsByType?profileId=${profileId}&profileType=${profileType}`,
      this.getToken()
    );
  }
}

export const profileService = new ProfileService();
