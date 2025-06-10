import { createEntityHook } from "@/hooks/Common/useGenericEntity";
import { LInvMastDto } from "@/interfaces/Laboratory/InvestigationListDto";
import { lInvMastService } from "@/services/Laboratory/LaboratoryService";

const useGenericLInvMast = createEntityHook<LInvMastDto>(lInvMastService, "invID");

export const useLInvMast = () => {
  const hook = useGenericLInvMast();

  return {
    invMastList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchInvMastList: hook.fetchEntityList,
    getInvMastById: hook.getEntityById,
    saveInvMast: hook.saveEntity,
    deleteInvMast: hook.deleteEntity,
    updateInvMastStatus: hook.updateEntityStatus,
    getNextCode: hook.getNextCode,
  };
};
