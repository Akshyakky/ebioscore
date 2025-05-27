// src/pages/laboratory/InvestigationListPage/hooks/useInvestigationList.ts
import { createEntityHook } from "@/hooks/Common/useGenericEntity";
import { investigationDto } from "@/interfaces/Laboratory/LInvMastDto";
import { investigationlistService } from "@/services/Laboratory/LaboratoryService";

const useGenericInvestigationList = createEntityHook<investigationDto>(investigationlistService, "invID");

export const useInvestigationList = () => {
  const hook = useGenericInvestigationList();

  return {
    investigationList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchInvestigationList: hook.fetchEntityList,
    getInvestigationById: hook.getEntityById,
    saveInvestigation: hook.saveEntity,
    deleteInvestigation: hook.deleteEntity,
    updateInvestigationStatus: hook.updateEntityStatus,
    getNextCode: hook.getNextCode,
  };
};
