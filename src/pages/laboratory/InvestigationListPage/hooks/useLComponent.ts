import { createEntityHook } from "@/hooks/Common/useGenericEntity";
import { LComponentDto } from "@/interfaces/Laboratory/InvestigationListDto";
import { lComponentService } from "@/services/Laboratory/LaboratoryService";

const useGenericLComponent = createEntityHook<LComponentDto>(lComponentService, "compoID");

export const useLComponent = () => {
  const hook = useGenericLComponent();

  return {
    componentList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchComponentList: hook.fetchEntityList,
    getComponentById: hook.getEntityById,
    saveComponent: hook.saveEntity,
    deleteComponent: hook.deleteEntity,
    updateComponentStatus: hook.updateEntityStatus,
  };
};
