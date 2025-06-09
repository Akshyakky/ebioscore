import { AppSubModuleDto, AppUserModuleDto, ProfileDetailDto, ProfileMastDto } from "@/interfaces/SecurityManagement/ProfileListData";
import { UserListDto } from "@/interfaces/SecurityManagement/UserListData";
import { createEntityService } from "@/utils/Common/serviceFactory";

export const appUserModuleService = createEntityService<AppUserModuleDto>("AppUserModule", "securityManagementURL");
export const appSubModuleService = createEntityService<AppSubModuleDto>("AppSubModule", "securityManagementURL");
export const profileMastService = createEntityService<ProfileMastDto>("ProfileMast", "securityManagementURL");
export const profileDetailService = createEntityService<ProfileDetailDto>("ProfileDetail", "securityManagementURL");
export const appUserService = createEntityService<UserListDto>("AppUser", "securityManagementURL");
