import { createEntityHook } from "@/hooks/Common/useGenericEntity";
import { OPIPHistFHDto } from "@/interfaces/ClinicalManagement/OPIPHistFHDto";
import { fhService } from "@/services/ClinicalManagementServices/clinicalManagementService";

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
