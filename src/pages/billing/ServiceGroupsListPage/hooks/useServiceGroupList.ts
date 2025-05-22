import { createEntityHook } from "@/hooks/Common/useGenericEntity";
import { BServiceGrpDto } from "@/interfaces/Billing/BServiceGrpDto";
import { serviceGroupService } from "@/services/BillingServices/BillingGenericService";

const useGenericServiceGroupsList = createEntityHook<BServiceGrpDto>(serviceGroupService, "sGrpID");

export const useServiceGroupsList = () => {
  const hook = useGenericServiceGroupsList();

  return {
    serviceGroupsList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchServiceGroupsList: hook.fetchEntityList,
    getServiceGroupById: hook.getEntityById,
    saveServiceGroup: hook.saveEntity,
    deleteServiceGroup: hook.deleteEntity,
    updateServiceGroupStatus: hook.updateEntityStatus,
    getNextCode: hook.getNextCode,
  };
};
