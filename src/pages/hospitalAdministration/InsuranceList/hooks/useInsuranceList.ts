import { createEntityHook } from "@/hooks/Common/useGenericEntity";
import { InsuranceListDto } from "@/interfaces/HospitalAdministration/InsuranceListDto";
import { insuranceListService } from "@/services/HospitalAdministrationServices/hospitalAdministrationService";

const useGenericInsuranceList = createEntityHook<InsuranceListDto>(insuranceListService, "insurID");

export const useInsuranceList = () => {
  const hook = useGenericInsuranceList();

  return {
    insuranceList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchInsuranceList: hook.fetchEntityList,
    getInsuranceById: hook.getEntityById,
    saveInsuranceList: hook.saveEntity,
    deleteInsurance: hook.deleteEntity,
    updateInsuranceStatus: hook.updateEntityStatus,
    getNextCode: hook.getNextCode,
  };
};
