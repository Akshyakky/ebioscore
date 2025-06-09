import { createEntityHook } from "@/hooks/Common/useGenericEntity";
import { MedicationRouteDto } from "@/interfaces/ClinicalManagement/MedicationRouteDto";
import { medicationRouteService } from "@/services/ClinicalManagementServices/clinicalManagementService";

const useGenericMedicationRoute = createEntityHook<MedicationRouteDto>(medicationRouteService, "mRouteID");

export const useMedicationRoute = () => {
  const hook = useGenericMedicationRoute();

  return {
    medicationRouteList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchMedicationRouteList: hook.fetchEntityList,
    getMedicationRouteById: hook.getEntityById,
    saveMedicationRoute: hook.saveEntity,
    deleteMedicationRoute: hook.deleteEntity,
    updateMedicationRouteStatus: hook.updateEntityStatus,
    getNextCode: hook.getNextCode,
  };
};
