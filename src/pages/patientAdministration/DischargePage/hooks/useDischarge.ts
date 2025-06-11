// src/pages/patientAdministration/DischargePage/hooks/useDischarge.ts
import { useLoading } from "@/hooks/Common/useLoading";
import { AdmissionDto } from "@/interfaces/PatientAdministration/AdmissionDto";
import { IpDischargeDto } from "@/interfaces/PatientAdministration/IpDischargeDto";
import { useAlert } from "@/providers/AlertProvider";
import { extendedAdmissionService } from "@/services/PatientAdministrationServices/admissionService";
import { dischargeService } from "@/services/PatientAdministrationServices/DischargeService/DischargeService";
import { useCallback, useRef, useState } from "react";

interface PatientAdmissionStatusResponse {
  isAdmitted: boolean;
  admissionData?: AdmissionDto | undefined;
  patientData?: any | undefined;
  admissionHistory: any[];
}

interface UseDischargeState {
  currentAdmissions: AdmissionDto[];
  recentDischarges: IpDischargeDto[];
  currentAdmissionStatus: PatientAdmissionStatusResponse | null;
  existingDischarge: IpDischargeDto | null;
  loading: boolean;
  error: string | null;
}

interface UseDischargeReturn extends UseDischargeState {
  refreshCurrentAdmissions: () => Promise<void>;
  refreshRecentDischarges: () => Promise<void>;
  checkPatientAdmissionStatus: (pChartID: number) => Promise<PatientAdmissionStatusResponse>;
  checkExistingDischarge: (admitID: number) => Promise<IpDischargeDto | null>;
  processDischarge: (dischargeData: IpDischargeDto) => Promise<void>;
  generateDischargeCode: () => Promise<string>;
  clearState: () => void;
}

/**
 * Custom hook for managing patient discharge operations.
 * Provides comprehensive functionality for discharge management including
 * patient status checking, discharge processing, and history retrieval.
 */
export const useDischarge = (): UseDischargeReturn => {
  const [state, setState] = useState<UseDischargeState>({
    currentAdmissions: [],
    recentDischarges: [],
    currentAdmissionStatus: null,
    existingDischarge: null,
    loading: false,
    error: null,
  });

  const { showAlert } = useAlert();
  const lastFetchTime = useRef<number>(0);
  const cacheTimeout = 30000; // 30 seconds cache

  /**
   * Updates the state with new data while preserving other state properties
   */
  const updateState = useCallback((updates: Partial<UseDischargeState>) => {
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
      console.error(`Discharge operation error (${operation}):`, error);

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
   * Refreshes the list of current admissions eligible for discharge
   */
  const refreshCurrentAdmissions = useCallback(async (): Promise<void> => {
    const now = Date.now();

    // Check if we should use cached data
    if (now - lastFetchTime.current < cacheTimeout && state.currentAdmissions.length > 0) {
      return;
    }

    try {
      updateState({ loading: true, error: null });

      const result = await extendedAdmissionService.getCurrentAdmissions();

      if (result.success && result.data) {
        // Filter only admitted patients (eligible for discharge)
        const eligibleAdmissions = result.data.filter((admission) => admission.ipAdmissionDto.ipStatus === "ADMITTED");

        updateState({
          currentAdmissions: eligibleAdmissions,
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
  }, [state.currentAdmissions.length, updateState, handleError]);

  /**
   * Refreshes the list of recent discharges
   */
  const refreshRecentDischarges = useCallback(async (): Promise<void> => {
    try {
      updateState({ loading: true, error: null });

      // Get recent discharges (last 30 days)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const result = await dischargeService.getDischargesWithPagination(1, 50, `dischgDate>="${startDate.toISOString()}"`);

      if (result.success && result.data) {
        updateState({
          recentDischarges: result.data.items || [],
          loading: false,
          error: null,
        });
      } else {
        throw new Error(result.errorMessage || "Failed to fetch recent discharges");
      }
    } catch (error) {
      handleError(error, "fetch recent discharges");
    }
  }, [updateState, handleError]);

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
   * Checks if there's an existing discharge for the given admission
   */
  const checkExistingDischarge = useCallback(
    async (admitID: number): Promise<IpDischargeDto | null> => {
      try {
        const existingDischarge = await dischargeService.getDischargeByAdmissionId(admitID);

        updateState({
          existingDischarge,
        });

        return existingDischarge;
      } catch (error) {
        handleError(error, "check existing discharge");
        return null;
      }
    },
    [updateState, handleError]
  );

  /**
   * Processes a patient discharge
   */
  const processDischarge = useCallback(
    async (dischargeData: IpDischargeDto): Promise<void> => {
      try {
        updateState({ loading: true, error: null });

        // Validate discharge data before submission
        if (!dischargeData.admitID) {
          throw new Error("Admission ID is required for discharge");
        }

        if (!dischargeData.dischgStatus) {
          throw new Error("Discharge status is required");
        }

        if (!dischargeData.dischgPhyID) {
          throw new Error("Discharging physician is required");
        }

        const result = await dischargeService.processDischarge(dischargeData);

        if (result.success) {
          updateState({ loading: false, error: null });
          showAlert("Success", "Patient discharged successfully", "success");

          // Refresh admissions and discharges list
          await refreshCurrentAdmissions();
          await refreshRecentDischarges();
        } else {
          throw new Error(result.errorMessage || "Failed to process discharge");
        }
      } catch (error) {
        handleError(error, "process discharge");
        throw error; // Re-throw to allow caller to handle
      }
    },
    [updateState, handleError, showAlert, refreshCurrentAdmissions, refreshRecentDischarges]
  );

  /**
   * Generates a new discharge code
   */
  const generateDischargeCode = useCallback(async (): Promise<string> => {
    try {
      // Generate a discharge code based on current timestamp and random number
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      const dischargeCode = `DSC${timestamp}${random}`;

      return dischargeCode;
    } catch (error) {
      handleError(error, "generate discharge code");

      // Generate a fallback code based on timestamp
      const fallbackCode = `DSC${Date.now().toString().slice(-6)}`;
      showAlert("Warning", `Using fallback discharge code: ${fallbackCode}`, "warning");
      return fallbackCode;
    }
  }, [handleError, showAlert]);

  /**
   * Clears all state data and resets the hook to initial state
   */
  const clearState = useCallback(() => {
    setState({
      currentAdmissions: [],
      recentDischarges: [],
      currentAdmissionStatus: null,
      existingDischarge: null,
      loading: false,
      error: null,
    });
    lastFetchTime.current = 0;
  }, []);

  return {
    ...state,
    refreshCurrentAdmissions,
    refreshRecentDischarges,
    checkPatientAdmissionStatus,
    checkExistingDischarge,
    processDischarge,
    generateDischargeCode,
    clearState,
  };
};

/**
 * Hook specifically for discharge status operations without full discharge management
 * Useful for components that only need to check discharge status
 */
export const useDischargeStatus = () => {
  const { isLoading, setLoading } = useLoading();
  const [error, setError] = useState<string | null>(null);
  const { showAlert } = useAlert();

  const checkDischargeStatus = useCallback(
    async (admitID: number): Promise<IpDischargeDto | null> => {
      try {
        setLoading(true);
        setError(null);

        const discharge = await dischargeService.getDischargeByAdmissionId(admitID);
        setLoading(false);
        return discharge;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to check discharge status";
        setError(errorMessage);
        setLoading(false);
        showAlert("Error", errorMessage, "error");
        return null;
      }
    },
    [showAlert]
  );

  return {
    checkDischargeStatus,
    isLoading,
    error,
  };
};

export default useDischarge;
