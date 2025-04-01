import { AppSubModuleDto, AppUserModuleDto } from "@/interfaces/SecurityManagement/ProfileListData";
import { createEntityService } from "@/utils/Common/serviceFactory";

export const appUserModuleService = createEntityService<AppUserModuleDto>("AppUserModule", "securityManagementURL");
export const appSubModuleService = createEntityService<AppSubModuleDto>("AppSubModule", "securityManagementURL");
