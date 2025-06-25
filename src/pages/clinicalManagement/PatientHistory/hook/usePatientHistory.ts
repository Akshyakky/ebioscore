import { createEntityHook } from "@/hooks/Common/useGenericEntity";
import { OPIPHistFHDto } from "@/interfaces/ClinicalManagement/OPIPHistFHDto";
import { OPIPHistSHDto } from "@/interfaces/ClinicalManagement/OPIPHistSHDto";
import { fhService, shService } from "@/services/ClinicalManagementServices/clinicalManagementService";

const useGenericFamilyHistory = createEntityHook<OPIPHistFHDto>(fhService, "opipFHID");

export const useFamilyHistory = () => {
  const hook = useGenericFamilyHistory();

  return {
    familyHistoryList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchFamilyHistoryList: hook.fetchEntityList,
    getFamilyHistoryById: hook.getEntityById,
    saveFamilyHistory: hook.saveEntity,
    deleteFamilyHistory: hook.deleteEntity,
    updateFamilyHistoryStatus: hook.updateEntityStatus,
  };
};

const useGenericSocialHistory = createEntityHook<OPIPHistSHDto>(shService, "opipSHID");
export const useSocialHistory = () => {
  const hook = useGenericSocialHistory();

  return {
    socialHistoryList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchSocialHistoryList: hook.fetchEntityList,
    getSocialHistoryById: hook.getEntityById,
    saveSocialHistory: hook.saveEntity,
    deleteSocialHistory: hook.deleteEntity,
    updateSocialHistoryStatus: hook.updateEntityStatus,
  };
};
