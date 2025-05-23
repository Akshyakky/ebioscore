import { createEntityHook } from "@/hooks/Common/useGenericEntity";
import { IcdDetailDto } from "@/interfaces/ClinicalManagement/IcdDetailDto";
import { diagnosisListService } from "@/services/ClinicalManagementServices/clinicalManagementService";

const useGenericDiagnosisList = createEntityHook<IcdDetailDto>(diagnosisListService, "icddId");

export const useDiagnosisList = () => {
  const hook = useGenericDiagnosisList();

  return {
    diagnosisList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchDiagnosisList: hook.fetchEntityList,
    getDiagnosisById: hook.getEntityById,
    saveDiagnosis: hook.saveEntity,
    deleteDiagnosis: hook.deleteEntity,
    updateDiagnosisStatus: hook.updateEntityStatus,
    getNextCode: hook.getNextCode,
  };
};
