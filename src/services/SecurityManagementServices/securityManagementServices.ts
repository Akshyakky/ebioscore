import { AppSubModuleDto, AppUserModuleDto, ProfileMastDto } from "@/interfaces/SecurityManagement/ProfileListData";
import { createEntityService } from "@/utils/Common/serviceFactory";
import { useMemo } from "react";

export const appUserModuleService = useMemo(() => createEntityService<AppUserModuleDto>("AppUserModule", "securityManagementURL"), []);
export const appSubModuleService = useMemo(() => createEntityService<AppSubModuleDto>("AppSubModule", "securityManagementURL"), []);
export const profileMastService = useMemo(() => createEntityService<ProfileMastDto>("ProfileMast", "securityManagementURL"), []);
