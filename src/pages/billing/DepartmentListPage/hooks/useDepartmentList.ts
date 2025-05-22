import { createEntityHook } from "@/hooks/Common/useGenericEntity";
import { DepartmentDto } from "@/interfaces/Billing/DepartmentDto";
import { departmentListService } from "@/services/CommonServices/CommonGenericServices";

const useGenericDepartmentList = createEntityHook<DepartmentDto>(departmentListService, "departmentId");

export const useDepartmentList = () => {
  const hook = useGenericDepartmentList();

  return {
    departmentList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchDepartmentList: hook.fetchEntityList,
    getDepartmentById: hook.getEntityById,
    saveDepartment: hook.saveEntity,
    deleteDepartment: hook.deleteEntity,
    updateDepartmentStatus: hook.updateEntityStatus,
    getNextCode: hook.getNextCode,
  };
};
