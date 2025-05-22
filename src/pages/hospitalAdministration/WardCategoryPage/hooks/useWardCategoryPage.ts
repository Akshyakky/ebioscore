import { createEntityHook } from "@/hooks/Common/useGenericEntity";
import { WardCategoryDto } from "@/interfaces/HospitalAdministration/WardCategoryDto";
import { wardCategoryService } from "@/services/HospitalAdministrationServices/hospitalAdministrationService";

const useGenericWardCategory = createEntityHook<WardCategoryDto>(wardCategoryService, "wCatID");

export const useWardCategory = () => {
  const hook = useGenericWardCategory();

  return {
    wardCategoryList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchWardCategoryList: hook.fetchEntityList,
    getWardCategoryById: hook.getEntityById,
    saveWardCategory: hook.saveEntity,
    deleteWardCategory: hook.deleteEntity,
    updateWardCategoryStatus: hook.updateEntityStatus,
    getNextCode: hook.getNextCode,
  };
};
