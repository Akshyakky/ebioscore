import { createEntityHook } from "@/hooks/Common/useGenericEntity";
import { OTProcedureListDto } from "@/interfaces/ClinicalManagement/ProcedureListDto";
import { procedureListService } from "@/services/ClinicalManagementServices/clinicalManagementService";

const useGenericProcedureList = createEntityHook<OTProcedureListDto>(procedureListService, "procedureID");

export const useProcedureList = () => {
  const hook = useGenericProcedureList();

  return {
    procedureList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchProcedureList: hook.fetchEntityList,
    getProcedureById: hook.getEntityById,
    saveProcedure: hook.saveEntity,
    deleteProcedure: hook.deleteEntity,
    updateProcedureStatus: hook.updateEntityStatus,
    getNextCode: hook.getNextCode,
  };
};
