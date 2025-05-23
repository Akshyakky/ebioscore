import { createEntityHook } from "@/hooks/Common/useGenericEntity";
import { ProfileMastDto } from "@/interfaces/SecurityManagement/ProfileListData";
import { createEntityService } from "@/utils/Common/serviceFactory";

const profileMastService = createEntityService<ProfileMastDto>("ProfileMast", "securityManagementURL");
const useGenericProfileList = createEntityHook<ProfileMastDto>(profileMastService, "profileID");

export const useProfileList = () => {
  const hook = useGenericProfileList();

  return {
    profileList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchProfileList: hook.fetchEntityList,
    getProfileById: hook.getEntityById,
    saveProfile: hook.saveEntity,
    deleteProfile: hook.deleteEntity,
    updateProfileStatus: hook.updateEntityStatus,
    getNextCode: hook.getNextCode,
  };
};
