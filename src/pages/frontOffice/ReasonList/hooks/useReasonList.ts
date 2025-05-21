import { createEntityHook } from "@/hooks/Common/useGenericEntity";
import { ReasonListData } from "@/interfaces/FrontOffice/ReasonListData";
import { reasonListService } from "@/services/FrontOfficeServices/FrontOfiiceApiServices";

const useGenericReasonList = createEntityHook<ReasonListData>(reasonListService, "arlID");

export const useReasonList = () => {
  const hook = useGenericReasonList();

  return {
    reasonList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchReasonList: hook.fetchEntityList,
    getReasonById: hook.getEntityById,
    saveReason: hook.saveEntity,
    deleteReason: hook.deleteEntity,
    updateReasonStatus: hook.updateEntityStatus,
    getNextCode: hook.getNextCode,
  };
};
