import { GenericEntityService } from "../GenericEntityService/GenericEntityService";
import { CommonApiService } from "../CommonApiService";
import { APIConfig } from "@/apiConfig";
import { UserListDto } from "@/interfaces/SecurityManagement/UserListData";
import { OperationResult } from "@/interfaces/Common/OperationResult";
class UserListServices extends GenericEntityService<UserListDto> {
  constructor() {
    super(
      new CommonApiService({
        baseURL: APIConfig.securityManagementURL,
      }),
      "AppUser"
    );
  }
  async getUsersWithoutCredentials(category: string): Promise<OperationResult<UserListDto>> {
    return this.apiService.get<OperationResult<UserListDto>>(`${this.baseEndpoint}/GetUsersWithoutCredentials?category=${category}`, this.getToken());
  }
  async getAllAppUsers(): Promise<OperationResult<UserListDto>> {
    return this.apiService.get<OperationResult<UserListDto>>(`${this.baseEndpoint}/GetAllAppUsers`, this.getToken());
  }
  async getUserListPermissionsByType(appID: Number, mainID: Number, subID: Number, type: string): Promise<OperationResult<UserListDto>> {
    return this.apiService.get<OperationResult<UserListDto>>(
      `${this.baseEndpoint}/GetUserListPermissionsByType?appID=${appID}&aUGrpID=${mainID}&subID=${subID}&type=${type}`,
      this.getToken()
    );
  }
  async saveUserListPermissionsByType(userListPermissionsDto: any[], permissiontype: string): Promise<OperationResult<any[]>> {
    return this.apiService.post<OperationResult<any[]>>(
      `${this.baseEndpoint}/SaveUserListPermissionsByType?permissionType=${permissiontype}`,
      userListPermissionsDto,
      this.getToken()
    );
  }
}

export const userListServices = new UserListServices();
