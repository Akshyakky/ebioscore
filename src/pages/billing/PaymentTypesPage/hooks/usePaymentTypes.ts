import { createEntityHook } from "@/hooks/Common/useGenericEntity";
import { BPayTypeDto } from "@/interfaces/Billing/BPayTypeDto";
import { paymentTypeService } from "@/services/BillingServices/BillingGenericService";

const useGenericPaymentTypes = createEntityHook<BPayTypeDto>(paymentTypeService, "payID");

export const usePaymentTypes = () => {
  const hook = useGenericPaymentTypes();

  return {
    paymentTypesList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchPaymentTypesList: hook.fetchEntityList,
    getPaymentTypeById: hook.getEntityById,
    savePaymentType: hook.saveEntity,
    deletePaymentType: hook.deleteEntity,
    updatePaymentTypeStatus: hook.updateEntityStatus,
    getNextCode: hook.getNextCode,
  };
};
