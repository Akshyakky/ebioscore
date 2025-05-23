import { createEntityHook } from "@/hooks/Common/useGenericEntity";
import { DeptUnitListDto } from "@/interfaces/HospitalAdministration/DeptUnitListDto";
import { deptUnitListService } from "@/services/HospitalAdministrationServices/hospitalAdministrationService";

const useGenericDeptUnitList = createEntityHook<DeptUnitListDto>(deptUnitListService, "dulID");

export const useDeptUnitList = () => {
  const hook = useGenericDeptUnitList();

  return {
    deptUnitList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchDeptUnitList: hook.fetchEntityList,
    getDeptUnitById: hook.getEntityById,
    saveDeptUnit: hook.saveEntity,
    deleteDeptUnit: hook.deleteEntity,
    updateDeptUnitStatus: hook.updateEntityStatus,
    getNextCode: hook.getNextCode,
  };
};
