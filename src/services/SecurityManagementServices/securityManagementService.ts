import { ProfileMastDto } from "@/interfaces/SecurityManagement/ProfileListData";
import { createEntityService } from "@/utils/Common/serviceFactory";

export const profileMastService = createEntityService<ProfileMastDto>("ProfileMast", "securityManagementURL");

// If you have any other security management related services, you can add them here
// For example:
// export const userService = createEntityService<UserDto>("User", "securityManagementURL");
// export const roleService = createEntityService<RoleDto>("Role", "securityManagementURL");

// If you need any extended services for security management, you can add them here
// For example:
// import { GenericEntityService } from "./genericEntityService";
// import { CommonApiService } from "../CommonApiService";
// import { APIConfig } from "../apiConfig";
//
// class ExtendedProfileService extends GenericEntityService<ProfileMastDto> {
//   async getActiveProfiles(): Promise<ProfileMastDto[]> {
//     return this.apiService.get<ProfileMastDto[]>(
//       `${this.baseEndpoint}/GetActiveProfiles`,
//       this.getToken()
//     );
//   }
// }
//
// export const extendedProfileService = new ExtendedProfileService(
//   new CommonApiService({
//     baseURL: APIConfig.securityManagementURL,
//   }),
//   "ProfileMast"
// );
