import { createEntityHook } from "@/hooks/Common/useGenericEntity";
import { IpDischargeDetailDto } from "@/interfaces/PatientAdministration/IpDischargeDetailDto";
import { dischargeSummaryService } from "@/services/PatientAdministrationServices/patientAdministrationService";

const useGenericDischargeSummary = createEntityHook<IpDischargeDetailDto>(dischargeSummaryService, "dischgDetID");

export const useDischargeSummary = () => {
  const hook = useGenericDischargeSummary();

  return {
    dischargeSummaryList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchDischargeSummaryList: hook.fetchEntityList,
    getDischargeSummaryById: hook.getEntityById,
    saveDischargeSummary: hook.saveEntity,
    deleteDischargeSummary: hook.deleteEntity,
    updateDischargeSummaryStatus: hook.updateEntityStatus,
    getNextCode: hook.getNextCode,
  };
};
