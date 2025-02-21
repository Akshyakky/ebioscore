import { GenericEntityService } from "../GenericEntityService/GenericEntityService";
import { CommonApiService } from "../CommonApiService";
import { APIConfig } from "@/apiConfig";
import { ProfileDetailDto, ProfileModuleOperationDto } from "@/interfaces/SecurityManagement/ProfileListData";
import { OperationResult } from "@/interfaces/Common/OperationResult";
class ProfileListService extends GenericEntityService<ProfileModuleOperationDto> {
  constructor() {
    super(
      new CommonApiService({
        baseURL: APIConfig.securityManagementURL,
      }),
      "ProfileDetail"
    );
  }
  async getProfileDetailsByType(aUGrpID: number, subID: number, compID: number, profileID: number, profileType: string): Promise<ProfileDetailDto[]> {
    return this.apiService.get<ProfileDetailDto[]>(
      `${this.baseEndpoint}/GetProfileDetailsByType?aUGrpID=${aUGrpID}&subID=${subID}&compID=${compID}&profileID=${profileID}&profileType=${profileType}`,
      this.getToken()
    );
  }
  async saveProfileDetailsByType(profileDetailDto: ProfileDetailDto[], profileType: string): Promise<OperationResult<ProfileDetailDto[]>> {
    return this.apiService.post<OperationResult<ProfileDetailDto[]>>(`${this.baseEndpoint}/SaveProfileDetailsByType?profileType=${profileType}`, profileDetailDto, this.getToken());
  }
  async saveProfileModuleOperation(profileModuleOperationDto: ProfileModuleOperationDto): Promise<OperationResult<ProfileModuleOperationDto>> {
    return this.apiService.post<OperationResult<ProfileModuleOperationDto>>(`${this.baseEndpoint}/SaveOrUpdateProfileDetail`, profileModuleOperationDto, this.getToken());
  }
}

export const profileListService = new ProfileListService();
