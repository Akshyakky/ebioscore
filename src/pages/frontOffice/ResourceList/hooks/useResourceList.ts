import { createEntityHook } from "@/hooks/Common/useGenericEntity";
import { ResourceListData } from "@/interfaces/FrontOffice/ResourceListData";
import { resourceListService } from "@/services/FrontOfficeServices/FrontOfiiceApiServices";

const useGenericReasonList = createEntityHook<ResourceListData>(resourceListService, "arlID");

export const useResourceList = () => {
  const hook = useGenericReasonList();

  return {
    resourceList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchResourceList: hook.fetchEntityList,
    getResourceById: hook.getEntityById,
    saveResource: hook.saveEntity,
    deleteResource: hook.deleteEntity,
    updateResourceStatus: hook.updateEntityStatus,
    getNextCode: hook.getNextCode,
  };
};
