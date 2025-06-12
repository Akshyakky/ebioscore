import { createEntityHook } from "@/hooks/Common/useGenericEntity";
import { LCompAgeRangeDto } from "@/interfaces/Laboratory/InvestigationListDto";
import { lCompAgeRangeService } from "@/services/Laboratory/LaboratoryService";

const useGenericCompAgeRange = createEntityHook<LCompAgeRangeDto>(lCompAgeRangeService, "carID");

export const useCompAgeRange = () => {
  const hook = useGenericCompAgeRange();

  return {
    ageRangeList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchAgeRangeList: hook.fetchEntityList,
    getAgeRangeById: hook.getEntityById,
    saveAgeRange: hook.saveEntity,
    deleteAgeRange: hook.deleteEntity,
    updateAgeRangeStatus: hook.updateEntityStatus,
    getNextCode: hook.getNextCode,
  };
};
