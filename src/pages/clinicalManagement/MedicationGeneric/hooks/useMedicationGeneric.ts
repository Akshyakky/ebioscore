import { createEntityHook } from "@/hooks/Common/useGenericEntity";
import { MedicationGenericDto } from "@/interfaces/ClinicalManagement/MedicationGenericDto";
import { medicationGenericService } from "@/services/ClinicalManagementServices/clinicalManagementService";

const useGenericMedicationGeneric = createEntityHook<MedicationGenericDto>(medicationGenericService, "mGenID");

export const useMedicationGeneric = () => {
  const hook = useGenericMedicationGeneric();

  return {
    medicationGenericList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchMedicationGenericList: hook.fetchEntityList,
    getMedicationGenericById: hook.getEntityById,
    saveMedicationGeneric: hook.saveEntity,
    deleteMedicationGeneric: hook.deleteEntity,
    updateMedicationGenericStatus: hook.updateEntityStatus,
    getNextCode: hook.getNextCode,
  };
};
