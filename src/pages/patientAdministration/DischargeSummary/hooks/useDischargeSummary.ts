// src/pages/patientAdministration/DischargeSummary/hooks/useDischargeSummary.ts
import { useLoading } from "@/hooks/Common/useLoading";
import { AdmissionDto } from "@/interfaces/PatientAdministration/AdmissionDto";
import { AdmissionHistoryDto } from "@/interfaces/PatientAdministration/AdmissionHistoryDto";
import { IpDischargeDetailDto } from "@/interfaces/PatientAdministration/IpDischargeDetailDto";
import { IpDischargeDto } from "@/interfaces/PatientAdministration/IpDischargeDto";
import { PatientSearchResult } from "@/interfaces/PatientAdministration/Patient/PatientSearch.interface";
import { useAlert } from "@/providers/AlertProvider";
import { extendedAdmissionService } from "@/services/PatientAdministrationServices/admissionService";
import { dischargeService } from "@/services/PatientAdministrationServices/DischargeService/DischargeService";
import { dischargeSummaryService } from "@/services/PatientAdministrationServices/patientAdministrationService";
import { useCallback, useRef, useState } from "react";

interface PatientDischargeInfo {
  patient: PatientSearchResult | null;
  admission: AdmissionDto | null;
  discharge: IpDischargeDto | null;
  dischargeSummary: IpDischargeDetailDto | null;
}

interface UseDischargeSummaryState {
  dischargeSummaries: IpDischargeDetailDto[];
  dischargedPatients: IpDischargeDto[];
  currentPatientInfo: PatientDischargeInfo | null;
  loading: boolean;
  error: string | null;
}

interface UseDischargeSummaryReturn extends UseDischargeSummaryState {
  refreshDischargeSummaries: () => Promise<void>;
  refreshDischargedPatients: () => Promise<void>;
  loadPatientDischargeInfo: (pChartID: number) => Promise<PatientDischargeInfo>;
  saveDischargeSummary: (summary: IpDischargeDetailDto) => Promise<IpDischargeDetailDto>;
  getDischargeSummaryByDischargeId: (dischgID: number) => Promise<IpDischargeDetailDto | null>;
  generateNextCode: () => Promise<string>;
  clearState: () => void;
}

/**
 * Custom hook for managing discharge summary operations.
 * Provides comprehensive functionality for discharge summary management including
 * patient info retrieval, summary creation/editing, and history management.
 */
const useDischargeSummary = (): UseDischargeSummaryReturn => {
  const [state, setState] = useState<UseDischargeSummaryState>({
    dischargeSummaries: [],
    dischargedPatients: [],
    currentPatientInfo: null,
    loading: false,
    error: null,
  });

  const { showAlert } = useAlert();
  const lastFetchTime = useRef<number>(0);
  const cacheTimeout = 30000; // 30 seconds cache

  /**
   * Updates the state with new data while preserving other state properties
   */
  const updateState = useCallback((updates: Partial<UseDischargeSummaryState>) => {
    setState((prevState) => ({
      ...prevState,
      ...updates,
    }));
  }, []);

  /**
   * Handles errors consistently across all operations
   */
  const handleError = useCallback(
    (error: unknown, operation: string) => {
      const errorMessage = error instanceof Error ? error.message : `Failed to ${operation}`;
      console.error(`Discharge summary operation error (${operation}):`, error);

      updateState({
        error: errorMessage,
        loading: false,
      });

      showAlert("Error", errorMessage, "error");
      return errorMessage;
    },
    [updateState, showAlert]
  );

  /**
   * Refreshes the list of discharge summaries
   */
  const refreshDischargeSummaries = useCallback(async (): Promise<void> => {
    const now = Date.now();

    // Check if we should use cached data
    if (now - lastFetchTime.current < cacheTimeout && state.dischargeSummaries.length > 0) {
      return;
    }

    try {
      updateState({ loading: true, error: null });

      const result = await dischargeSummaryService.getAll();

      if (result.success && result.data) {
        // Sort by report date (most recent first)
        const sortedSummaries = result.data.sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime());

        updateState({
          dischargeSummaries: sortedSummaries,
          loading: false,
          error: null,
        });
        lastFetchTime.current = now;
      } else {
        throw new Error(result.errorMessage || "Failed to fetch discharge summaries");
      }
    } catch (error) {
      handleError(error, "fetch discharge summaries");
    }
  }, [state.dischargeSummaries.length, updateState, handleError]);

  /**
   * Refreshes the list of discharged patients (who need summaries)
   */
  const refreshDischargedPatients = useCallback(async (): Promise<void> => {
    try {
      updateState({ loading: true, error: null });

      // Get recent discharges (last 7 days) that might need summaries
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const result = await dischargeService.getDischargesWithPagination(1, 100, `dischgDate>="${startDate.toISOString()}" AND dischgSumYN="Y"`);

      if (result.success && result.data) {
        updateState({
          dischargedPatients: result.data.items || [],
          loading: false,
          error: null,
        });
      } else {
        throw new Error(result.errorMessage || "Failed to fetch discharged patients");
      }
    } catch (error) {
      handleError(error, "fetch discharged patients");
    }
  }, [updateState, handleError]);

  /**
   * Loads complete discharge information for a patient
   */
  const loadPatientDischargeInfo = useCallback(
    async (pChartID: number): Promise<PatientDischargeInfo> => {
      try {
        updateState({ loading: true, error: null });

        // Get patient admission status
        const admissionResult = await extendedAdmissionService.getPatientAdmissionStatus(pChartID);

        if (!admissionResult.success || !admissionResult.data) {
          throw new Error("Failed to load patient information");
        }

        const { patientData, admissionHistory } = admissionResult.data;

        // Find the most recent discharged admission
        let recentDischarge: IpDischargeDto | null = null;
        let recentAdmission: AdmissionDto | null = null;

        if (admissionHistory && admissionHistory.length > 0) {
          // Sort by admission date descending
          const sortedAdmissions: AdmissionHistoryDto[] = admissionHistory.sort((a, b) => new Date(b.admitDate).getTime() - new Date(a.admitDate).getTime());

          // Find the first discharged admission
          for (const admission of sortedAdmissions) {
            if (admission.status === "DISCHARGED") {
              // recentAdmission = admission;
              // Get discharge record for this admission
              recentDischarge = await dischargeService.getDischargeByAdmissionId(admission.admitID);
              break;
            }
          }
        }

        // Get discharge summary if discharge exists
        let dischargeSummary: IpDischargeDetailDto | null = null;
        if (recentDischarge) {
          dischargeSummary = await getDischargeSummaryByDischargeId(recentDischarge.dischgID);
        }

        const patientInfo: PatientDischargeInfo = {
          // patient: patientData,
          patient: null,
          admission: recentAdmission,
          discharge: recentDischarge,
          dischargeSummary,
        };

        updateState({
          currentPatientInfo: patientInfo,
          loading: false,
          error: null,
        });

        return patientInfo;
      } catch (error) {
        handleError(error, "load patient discharge information");

        const emptyInfo: PatientDischargeInfo = {
          patient: null,
          admission: null,
          discharge: null,
          dischargeSummary: null,
        };

        updateState({ currentPatientInfo: emptyInfo });
        return emptyInfo;
      }
    },
    [updateState, handleError]
  );

  /**
   * Gets discharge summary by discharge ID
   */
  const getDischargeSummaryByDischargeId = useCallback(async (dischgID: number): Promise<IpDischargeDetailDto | null> => {
    try {
      const result = await dischargeSummaryService.getAll();

      if (result.success && result.data) {
        // Find summary matching the discharge ID
        const summary = result.data.find((s) => s.dischgID === dischgID);
        return summary || null;
      }

      return null;
    } catch (error) {
      console.error("Error fetching discharge summary:", error);
      return null;
    }
  }, []);

  /**
   * Saves (creates or updates) a discharge summary
   */
  const saveDischargeSummary = useCallback(
    async (summary: IpDischargeDetailDto): Promise<IpDischargeDetailDto> => {
      try {
        updateState({ loading: true, error: null });

        // Validate required fields
        if (!summary.dischgID) {
          throw new Error("Discharge ID is required");
        }

        if (!summary.consultantID) {
          throw new Error("Consultant is required");
        }

        if (!summary.specialityID) {
          throw new Error("Speciality is required");
        }

        const result = await dischargeSummaryService.save(summary);

        if (result.success && result.data) {
          updateState({ loading: false, error: null });

          const action = summary.dischgDetID ? "updated" : "created";
          showAlert("Success", `Discharge summary ${action} successfully`, "success");

          // Refresh the summaries list
          await refreshDischargeSummaries();

          return result.data;
        } else {
          throw new Error(result.errorMessage || "Failed to save discharge summary");
        }
      } catch (error) {
        handleError(error, "save discharge summary");
        throw error; // Re-throw to allow caller to handle
      }
    },
    [updateState, handleError, showAlert, refreshDischargeSummaries]
  );

  /**
   * Generates a new code for discharge summary
   */
  const generateNextCode = useCallback(async (): Promise<string> => {
    try {
      const result = await dischargeSummaryService.getNextCode("DS", 5);

      if (result.success && result.data) {
        return result.data;
      }

      // Fallback code generation
      const timestamp = Date.now().toString().slice(-6);
      return `DS${timestamp}`;
    } catch (error) {
      handleError(error, "generate discharge summary code");

      // Return fallback code
      const fallbackCode = `DS${Date.now().toString().slice(-6)}`;
      return fallbackCode;
    }
  }, [handleError]);

  /**
   * Clears all state data and resets the hook to initial state
   */
  const clearState = useCallback(() => {
    setState({
      dischargeSummaries: [],
      dischargedPatients: [],
      currentPatientInfo: null,
      loading: false,
      error: null,
    });
    lastFetchTime.current = 0;
  }, []);

  return {
    ...state,
    refreshDischargeSummaries,
    refreshDischargedPatients,
    loadPatientDischargeInfo,
    saveDischargeSummary,
    getDischargeSummaryByDischargeId,
    generateNextCode,
    clearState,
  };
};

/**
 * Hook for quick discharge summary status check
 */
export const useDischargeSummaryStatus = () => {
  const { isLoading, setLoading } = useLoading();
  const [error, setError] = useState<string | null>(null);
  const { showAlert } = useAlert();

  const checkSummaryExists = useCallback(
    async (dischgID: number): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        const result = await dischargeSummaryService.getAll();

        if (result.success && result.data) {
          const exists = result.data.some((summary) => summary.dischgID === dischgID);
          setLoading(false);
          return exists;
        }

        setLoading(false);
        return false;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to check summary status";
        setError(errorMessage);
        setLoading(false);
        showAlert("Error", errorMessage, "error");
        return false;
      }
    },
    [showAlert]
  );

  return {
    checkSummaryExists,
    isLoading,
    error,
  };
};

// Export as default for easier importing
export default useDischargeSummary;
