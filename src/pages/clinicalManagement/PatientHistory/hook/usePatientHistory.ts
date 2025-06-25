import { createEntityHook } from "@/hooks/Common/useGenericEntity";
import { OPIPHistFHDto } from "@/interfaces/ClinicalManagement/OPIPHistFHDto";
import { OPIPHistPMHDto } from "@/interfaces/ClinicalManagement/OPIPHistPMHDto";
import { OPIPHistPSHDto } from "@/interfaces/ClinicalManagement/OPIPHistPSHDto";
import { OPIPHistROSDto } from "@/interfaces/ClinicalManagement/OPIPHistROSDto";
import { OPIPHistSHDto } from "@/interfaces/ClinicalManagement/OPIPHistSHDto";
import { fhService, pmhService, pshService, rosService, shService } from "@/services/ClinicalManagementServices/clinicalManagementService";

const useGenericFamilyHistory = createEntityHook<OPIPHistFHDto>(fhService, "opipFHID");

export const useFamilyHistory = () => {
  const hook = useGenericFamilyHistory();

  return {
    familyHistoryList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchFamilyHistoryList: hook.fetchEntityList,
    getFamilyHistoryById: hook.getEntityById,
    saveFamilyHistory: hook.saveEntity,
    deleteFamilyHistory: hook.deleteEntity,
    updateFamilyHistoryStatus: hook.updateEntityStatus,
  };
};

const useGenericSocialHistory = createEntityHook<OPIPHistSHDto>(shService, "opipSHID");
export const useSocialHistory = () => {
  const hook = useGenericSocialHistory();

  return {
    socialHistoryList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchSocialHistoryList: hook.fetchEntityList,
    getSocialHistoryById: hook.getEntityById,
    saveSocialHistory: hook.saveEntity,
    deleteSocialHistory: hook.deleteEntity,
    updateSocialHistoryStatus: hook.updateEntityStatus,
  };
};

const useGenericROSHistory = createEntityHook<OPIPHistROSDto>(rosService, "opipRosID");
export const useROSHistory = () => {
  const hook = useGenericROSHistory();

  return {
    rosHistoryList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchRosHistoryList: hook.fetchEntityList,
    getRosHistoryById: hook.getEntityById,
    saveRosHistory: hook.saveEntity,
    deleteRosHistory: hook.deleteEntity,
    updateRosHistoryStatus: hook.updateEntityStatus,
  };
};

const useGenericPMHHistory = createEntityHook<OPIPHistPMHDto>(pmhService, "opippmhId");
export const usePMHHistory = () => {
  const hook = useGenericPMHHistory();

  return {
    pmhHistoryList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchPMHHistoryList: hook.fetchEntityList,
    getPMHHistoryById: hook.getEntityById,
    savePMHHistory: hook.saveEntity,
    deletePMHHistory: hook.deleteEntity,
    updatePMHHistoryStatus: hook.updateEntityStatus,
  };
};

const useGenericPSHHistory = createEntityHook<OPIPHistPSHDto>(pshService, "opipPshID");
export const usePSHHistory = () => {
  const hook = useGenericPSHHistory();

  return {
    pshHistoryList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchPSHHistoryList: hook.fetchEntityList,
    getPSHHistoryById: hook.getEntityById,
    savePSHHistory: hook.saveEntity,
    deletePSHHistory: hook.deleteEntity,
    updatePSHHistoryStatus: hook.updateEntityStatus,
  };
};
