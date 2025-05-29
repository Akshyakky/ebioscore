// src/pages/patientAdministration/AdmissionPage/hooks/useAdmission.ts
import { useState, useCallback, useRef } from "react";
import { AdmissionDto } from "@/interfaces/PatientAdministration/AdmissionDto";
import { AdmissionHistoryDto } from "@/interfaces/PatientAdministration/AdmissionHistoryDto";
import { extendedAdmissionService } from "@/services/PatientAdministrationServices/admissionService";
import { useAlert } from "@/providers/AlertProvider";

interface PatientAdmissionStatusResponse {
  isAdmitted: boolean;
  admissionData?: AdmissionDto;
  patientData?: any;
  admissionHistory: AdmissionHistoryDto[];
}

interface UseAdmissionState {
  admissions: AdmissionDto[];
  loading: boolean;
  currentAdmissionStatus: PatientAdmissionStatusResponse | null;
  error: string | null;
}

interface UseAdmissionReturn extends UseAdmissionState {
  refreshAdmissions: () => Promise<void>;
  refreshPatientStatus: (pChartID: number) => Promise<void>;
  admitPatient: (admissionData: AdmissionDto) => Promise<void>;
  checkPatientAdmissionStatus: (pChartID: number) => Promise<PatientAdmissionStatusResponse>;
  getAdmissionHistory: (admitID: number) => Promise<AdmissionHistoryDto[]>;
  generateAdmissionCode: () => Promise<string>;
  clearState: () => void;
}

/**
 * Custom hook for managing patient admission operations.
 * Provides comprehensive functionality for admission management including
 * patient status checking, admission processing, and history retrieval.
 */
export const useAdmission = (): UseAdmissionReturn => {
  const [state, setState] = useState<UseAdmissionState>({
    admissions: [],
    loading: false,
    currentAdmissionStatus: null,
    error: null,
  });

  const { showAlert } = useAlert();
  const lastFetchTime = useRef<number>(0);
  const cacheTimeout = 30000; // 30 seconds cache

  /**
   * Updates the state with new data while preserving other state properties
   */
  const updateState = useCallback((updates: Partial<UseAdmissionState>) => {
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
      console.error(`Admission operation error (${operation}):`, error);

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
   * Refreshes the list of current admissions with caching support
   */
  const refreshAdmissions = useCallback(async (): Promise<void> => {
    const now = Date.now();

    // Check if we should use cached data
    if (now - lastFetchTime.current < cacheTimeout && state.admissions.length > 0) {
      return;
    }

    try {
      updateState({ loading: true, error: null });

      const result = await extendedAdmissionService.getCurrentAdmissions();

      if (result.success && result.data) {
        updateState({
          admissions: result.data,
          loading: false,
          error: null,
        });
        lastFetchTime.current = now;
      } else {
        throw new Error(result.errorMessage || "Failed to fetch current admissions");
      }
    } catch (error) {
      handleError(error, "fetch current admissions");
    }
  }, [state.admissions.length, updateState, handleError]);

  /**
   * Checks the admission status for a specific patient
   */
  const checkPatientAdmissionStatus = useCallback(
    async (pChartID: number): Promise<PatientAdmissionStatusResponse> => {
      try {
        updateState({ loading: true, error: null });

        const result = await extendedAdmissionService.getPatientAdmissionStatus(pChartID);

        if (result.success && result.data) {
          const statusResponse: PatientAdmissionStatusResponse = {
            isAdmitted: result.data.isAdmitted,
            admissionData: result.data.admissionData,
            patientData: result.data.patientData,
            admissionHistory: result.data.admissionHistory || [],
          };

          updateState({
            currentAdmissionStatus: statusResponse,
            loading: false,
            error: null,
          });

          return statusResponse;
        } else {
          throw new Error(result.errorMessage || "Failed to check patient admission status");
        }
      } catch (error) {
        handleError(error, "check patient admission status");

        // Return a safe default status
        const defaultStatus: PatientAdmissionStatusResponse = {
          isAdmitted: false,
          admissionHistory: [],
        };

        updateState({ currentAdmissionStatus: defaultStatus });
        return defaultStatus;
      }
    },
    [updateState, handleError]
  );

  /**
   * Refreshes patient status for the currently selected patient
   */
  const refreshPatientStatus = useCallback(
    async (pChartID: number): Promise<void> => {
      await checkPatientAdmissionStatus(pChartID);
    },
    [checkPatientAdmissionStatus]
  );

  /**
   * Processes a new patient admission
   */
  const admitPatient = useCallback(
    async (admissionData: AdmissionDto): Promise<void> => {
      try {
        updateState({ loading: true, error: null });

        // Validate admission data before submission
        if (!admissionData.ipAdmissionDto.pChartID) {
          throw new Error("Patient chart ID is required for admission");
        }

        if (!admissionData.ipAdmissionDto.attendingPhysicianId) {
          throw new Error("Attending physician is required for admission");
        }

        if (!admissionData.ipAdmissionDetailsDto.bedID) {
          throw new Error("Bed assignment is required for admission");
        }

        const result = await extendedAdmissionService.admitPatient(admissionData);

        if (result.success) {
          updateState({ loading: false, error: null });
          showAlert("Success", "Patient admitted successfully", "success");

          // Refresh admissions list to reflect the new admission
          await refreshAdmissions();
        } else {
          throw new Error(result.errorMessage || "Failed to admit patient");
        }
      } catch (error) {
        handleError(error, "admit patient");
        throw error; // Re-throw to allow caller to handle
      }
    },
    [updateState, handleError, showAlert, refreshAdmissions]
  );

  /**
   * Retrieves admission history for a specific admission
   */
  const getAdmissionHistory = useCallback(
    async (admitID: number): Promise<AdmissionHistoryDto[]> => {
      try {
        updateState({ loading: true, error: null });

        const result = await extendedAdmissionService.getAdmissionHistory(admitID);

        if (result.success && result.data) {
          updateState({ loading: false, error: null });
          return result.data;
        } else {
          throw new Error(result.errorMessage || "Failed to fetch admission history");
        }
      } catch (error) {
        handleError(error, "fetch admission history");
        return []; // Return empty array as fallback
      }
    },
    [updateState, handleError]
  );

  /**
   * Generates a new admission code
   */
  const generateAdmissionCode = useCallback(async (): Promise<string> => {
    try {
      const result = await extendedAdmissionService.generateAdmitCode();

      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(result.errorMessage || "Failed to generate admission code");
      }
    } catch (error) {
      handleError(error, "generate admission code");

      // Generate a fallback code based on timestamp
      const fallbackCode = `ADM${Date.now().toString().slice(-6)}`;
      showAlert("Warning", `Using fallback admission code: ${fallbackCode}`, "warning");
      return fallbackCode;
    }
  }, [handleError, showAlert]);

  /**
   * Clears all state data and resets the hook to initial state
   */
  const clearState = useCallback(() => {
    setState({
      admissions: [],
      loading: false,
      currentAdmissionStatus: null,
      error: null,
    });
    lastFetchTime.current = 0;
  }, []);

  return {
    ...state,
    refreshAdmissions,
    refreshPatientStatus,
    admitPatient,
    checkPatientAdmissionStatus,
    getAdmissionHistory,
    generateAdmissionCode,
    clearState,
  };
};

/**
 * Hook specifically for admission status operations without full admission management
 * Useful for components that only need to check patient status
 */
export const useAdmissionStatus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showAlert } = useAlert();

  const checkStatus = useCallback(
    async (pChartID: number): Promise<PatientAdmissionStatusResponse | null> => {
      try {
        setLoading(true);
        setError(null);

        const result = await extendedAdmissionService.getPatientAdmissionStatus(pChartID);

        if (result.success && result.data) {
          setLoading(false);
          return {
            isAdmitted: result.data.isAdmitted,
            admissionData: result.data.admissionData,
            patientData: result.data.patientData,
            admissionHistory: result.data.admissionHistory || [],
          };
        } else {
          throw new Error(result.errorMessage || "Failed to check admission status");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to check admission status";
        setError(errorMessage);
        setLoading(false);
        showAlert("Error", errorMessage, "error");
        return null;
      }
    },
    [showAlert]
  );

  return {
    checkStatus,
    loading,
    error,
  };
};

export default useAdmission;
