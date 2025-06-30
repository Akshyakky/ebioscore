import { createEntityHook } from "@/hooks/Common/useGenericEntity";
import { AllergyDto } from "@/interfaces/ClinicalManagement/AllergyDto";
import { OPIPHistFHDto } from "@/interfaces/ClinicalManagement/OPIPHistFHDto";
import { OPIPHistObstetricsDto } from "@/interfaces/ClinicalManagement/OPIPHistObstetricsDto";
import { OPIPHistPMHDto } from "@/interfaces/ClinicalManagement/OPIPHistPMHDto";
import { OPIPHistPSHDto } from "@/interfaces/ClinicalManagement/OPIPHistPSHDto";
import { OPIPHistROSDto } from "@/interfaces/ClinicalManagement/OPIPHistROSDto";
import { OPIPHistSHDto } from "@/interfaces/ClinicalManagement/OPIPHistSHDto";
import { PastMedicationDto } from "@/interfaces/ClinicalManagement/PastMedicationDto";
import { allergyService } from "@/services/ClinicalManagementServices/allergyService";
import { fhService, ObstetricsService, pmhService, pshService, rosService, shService } from "@/services/ClinicalManagementServices/clinicalManagementService";
import { pastMedicationService } from "@/services/ClinicalManagementServices/pastMedicationService";

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

// Allergy Hook
export const useAllergy = () => {
  const hook = createEntityHook<AllergyDto>(allergyService, "opIPHistAllergyMastDto.opipAlgId")();

  return {
    allergyList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchAllergyList: hook.fetchEntityList,
    getAllergyById: hook.getEntityById,
    saveAllergy: hook.saveEntity,
    deleteAllergy: hook.deleteEntity,
    updateAllergyStatus: hook.updateEntityStatus,
    getByKeyFields: async (pChartID: number, opipNo: number, opipCaseNo: number) => {
      return allergyService.getByKeyFields(pChartID, opipNo, opipCaseNo);
    },
  };
};

// Past Medication Hook
export const usePastMedication = () => {
  const hook = createEntityHook<PastMedicationDto>(pastMedicationService, "opipPastMedID")();

  return {
    pastMedicationList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchPastMedicationList: hook.fetchEntityList,
    getPastMedicationById: hook.getEntityById,
    savePastMedication: hook.saveEntity,
    deletePastMedication: hook.deleteEntity,
    updatePastMedicationStatus: hook.updateEntityStatus,
    getByKeyFields: async (pChartID: number, opipNo: number, opipCaseNo: number) => {
      return pastMedicationService.getByKeyFields(pChartID, opipNo, opipCaseNo);
    },
  };
};
// Obstetrics Hook
export const useObstetrics = () => {
  const hook = createEntityHook<OPIPHistObstetricsDto>(ObstetricsService, "opipOBID")();

  return {
    obstetricsList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchObstetricsList: hook.fetchEntityList,
    getObstetricsById: hook.getEntityById,
    saveObstetrics: hook.saveEntity,
    deleteObstetrics: hook.deleteEntity,
    updateObstetricsStatus: hook.updateEntityStatus,
  };
};
