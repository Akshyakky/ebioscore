import { createEntityHook } from "@/hooks/Common/useGenericEntity";
import { MedicationFormDto } from "@/interfaces/ClinicalManagement/MedicationFormDto";
import { medicationFormService } from "@/services/ClinicalManagementServices/clinicalManagementService";

const useGenericMedicationForm = createEntityHook<MedicationFormDto>(medicationFormService, "mFID");

export const useMedicationForm = () => {
  const hook = useGenericMedicationForm();

  return {
    medicationFormList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchMedicationFormList: hook.fetchEntityList,
    getMedicationFormById: hook.getEntityById,
    saveMedicationForm: hook.saveEntity,
    deleteMedicationForm: hook.deleteEntity,
    updateMedicationFormStatus: hook.updateEntityStatus,
    getNextCode: hook.getNextCode,
  };
};
