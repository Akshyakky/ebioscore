import { createEntityHook } from "@/hooks/Common/useGenericEntity";
import { MedicationFrequencyDto } from "@/interfaces/ClinicalManagement/MedicationFrequencyDto";
import { medicationFrequencyService } from "@/services/ClinicalManagementServices/clinicalManagementService";

const useGenericMedicationFrequency = createEntityHook<MedicationFrequencyDto>(medicationFrequencyService, "mFrqId");

export const useMedicationFrequency = () => {
  const hook = useGenericMedicationFrequency();

  return {
    medicationFrequencyList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchMedicationFrequencyList: hook.fetchEntityList,
    getMedicationFrequencyById: hook.getEntityById,
    saveMedicationFrequency: hook.saveEntity,
    deleteMedicationFrequency: hook.deleteEntity,
    updateMedicationFrequencyStatus: hook.updateEntityStatus,
    getNextCode: hook.getNextCode,
  };
};
