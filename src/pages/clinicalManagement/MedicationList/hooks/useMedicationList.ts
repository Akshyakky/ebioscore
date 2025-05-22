import { createEntityHook } from "@/hooks/Common/useGenericEntity";
import { MedicationListDto } from "@/interfaces/ClinicalManagement/MedicationListDto";
import { medicationListService } from "@/services/ClinicalManagementServices/clinicalManagementService";

const useGenericMedicationList = createEntityHook<MedicationListDto>(medicationListService, "mlID");

export const useMedicationList = () => {
  const hook = useGenericMedicationList();

  return {
    medicationList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchMedicationList: hook.fetchEntityList,
    getMedicationById: hook.getEntityById,
    saveMedication: hook.saveEntity,
    deleteMedication: hook.deleteEntity,
    updateMedicationStatus: hook.updateEntityStatus,
    getNextCode: hook.getNextCode,
  };
};
