import { GenericEntityService } from "../GenericEntityService/GenericEntityService";
import { CommonApiService } from "../CommonApiService";
import { APIConfig } from "@/apiConfig";
import { SaveUserPermissionsRequest, UserListDto } from "@/interfaces/SecurityManagement/UserListData";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { ContactMastShortDto } from "@/interfaces/HospitalAdministration/ContactListData";
class UserListServices extends GenericEntityService<UserListDto> {
  constructor() {
    super(
      new CommonApiService({
        baseURL: APIConfig.securityManagementURL,
      }),
      "UserList"
    );
  }
  async getUsersWithoutCredentials(): Promise<OperationResult<ContactMastShortDto>> {
    return this.apiService.get<OperationResult<ContactMastShortDto>>(`${this.baseEndpoint}/GetUsersWithoutCredentials`, this.getToken());
  }
  async getAllAppUsers(): Promise<OperationResult<UserListDto[]>> {
    return this.apiService.get<OperationResult<UserListDto[]>>(`${this.baseEndpoint}/GetAllAppUsers`, this.getToken());
  }
  async getUserListPermissionsByType(appID: Number, mainID: Number, subID: Number, type: string): Promise<OperationResult<UserListDto>> {
    return this.apiService.get<OperationResult<UserListDto>>(
      `${this.baseEndpoint}/GetUserListPermissionsByType?appID=${appID}&aUGrpID=${mainID}&subID=${subID}&type=${type}`,
      this.getToken()
    );
  }
  async saveUserListPermissionsByType(request: SaveUserPermissionsRequest): Promise<OperationResult<any>> {
    return this.apiService.post<OperationResult<SaveUserPermissionsRequest>>(`${this.baseEndpoint}/SaveUserListPermissionsByType`, request, this.getToken());
  }
}

export const userListServices = new UserListServices();
