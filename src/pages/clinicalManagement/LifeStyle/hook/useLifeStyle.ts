import { createEntityHook } from "@/hooks/Common/useGenericEntity";
import { OPIPLifestyleDto } from "@/interfaces/ClinicalManagement/OPIPLifestyleDto";
import { lifestyleService, OPIPLifestyleService } from "@/services/ClinicalManagementServices/clinicalManagementService";

const useGenericLifestyle = createEntityHook<OPIPLifestyleDto>(OPIPLifestyleService, "opipLSID");

export const useLifestyle = () => {
  const hook = useGenericLifestyle();

  return {
    lifestyleList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchLifestyleList: hook.fetchEntityList,
    getLifestyleById: hook.getEntityById,
    saveLifestyle: async (lifestyleDto: OPIPLifestyleDto) => {
      return lifestyleService.save(lifestyleDto);
    },
    deleteLifestyle: hook.deleteEntity,
    updateLifestyleStatus: hook.updateEntityStatus,
    getNextCode: hook.getNextCode,
  };
};
