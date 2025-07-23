import { createEntityHook } from "@/hooks/Common/useGenericEntity";
import { BreakConDetailDto } from "@/interfaces/FrontOffice/BreakListDto";
import { breakConDetailsService } from "@/services/FrontOfficeServices/FrontOfiiceApiServices";

const useGenericBreakConDetails = createEntityHook<BreakConDetailDto>(breakConDetailsService, "bCDID");

export const useBreakConDetails = () => {
  const hook = useGenericBreakConDetails();

  return {
    breakConDetailsList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchBreakConDetails: hook.fetchEntityList,
    getBreakConDetailById: hook.getEntityById,
    saveBreakConDetail: hook.saveEntity,
    deleteBreakConDetail: hook.deleteEntity,
    updateBreakConDetailStatus: hook.updateEntityStatus,
  };
};
