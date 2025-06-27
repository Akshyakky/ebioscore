import { createEntityHook } from "@/hooks/Common/useGenericEntity";
import { MedicationInstructionDto } from "@/interfaces/ClinicalManagement/MedicationInstructionDto";
import { medicationInstructionService } from "@/services/ClinicalManagementServices/clinicalManagementService";

const useGenericMedicationInstruction = createEntityHook<MedicationInstructionDto>(medicationInstructionService, "minsId");

export const useMedicationInstruction = () => {
  const hook = useGenericMedicationInstruction();

  return {
    medicationInstructionList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchMedicationInstructionList: hook.fetchEntityList,
    getMedicationInstructionById: hook.getEntityById,
    saveMedicationInstruction: hook.saveEntity,
    deleteMedicationInstruction: hook.deleteEntity,
    updateMedicationInstructionStatus: hook.updateEntityStatus,
    getNextCode: hook.getNextCode,
  };
};
