// src/pages/clinicalManagement/MedicationDosage/hooks/useMedicationDosage.ts
import { createEntityHook } from "@/hooks/Common/useGenericEntity";
import { MedicationDosageDto } from "@/interfaces/ClinicalManagement/MedicationDosageDto";
import { medicationDosageService } from "@/services/ClinicalManagementServices/clinicalManagementService";

const useGenericMedicationDosage = createEntityHook<MedicationDosageDto>(medicationDosageService, "mDId");

export const useMedicationDosage = () => {
  const hook = useGenericMedicationDosage();

  return {
    medicationDosageList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchMedicationDosageList: hook.fetchEntityList,
    getMedicationDosageById: hook.getEntityById,
    saveMedicationDosage: hook.saveEntity,
    deleteMedicationDosage: hook.deleteEntity,
    updateMedicationDosageStatus: hook.updateEntityStatus,
    getNextCode: hook.getNextCode,
  };
};
