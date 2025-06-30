import { createEntityHook } from "@/hooks/Common/useGenericEntity";
import { OPIPLifestyleDto } from "@/interfaces/ClinicalManagement/OPIPLifestyleDto";
import { ObstetricsService } from "@/services/ClinicalManagementServices/clinicalManagementService";

export const useObstetrics = () => {
  const hook = createEntityHook<OPIPLifestyleDto>(ObstetricsService, "opipOBID")();

  return {
    lifestyleList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchLifestyleList: hook.fetchEntityList,
    getLifestyleById: hook.getEntityById,
    saveLifestyle: hook.saveEntity,
    deleteLifestyle: hook.deleteEntity,
    updateLifestyleStatus: hook.updateEntityStatus,
  };
};
