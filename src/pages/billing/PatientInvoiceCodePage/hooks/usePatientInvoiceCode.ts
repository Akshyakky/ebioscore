import { createEntityHook } from "@/hooks/Common/useGenericEntity";
import { BPatTypeDto } from "@/interfaces/Billing/BPatTypeDto";
import { patientInvioceService } from "@/services/BillingServices/BillingGenericService";

const useGenericPatientInvoice = createEntityHook<BPatTypeDto>(patientInvioceService, "pTypeID");

export const usePatientInvoiceCode = () => {
  const hook = useGenericPatientInvoice();

  return {
    patientInvoiceList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchPatientInvoiceList: hook.fetchEntityList,
    getPatientInvoiceById: hook.getEntityById,
    savePatientInvoice: hook.saveEntity,
    deletePatientInvoice: hook.deleteEntity,
    updatePatientInvoiceStatus: hook.updateEntityStatus,
    getNextCode: hook.getNextCode,
  };
};
