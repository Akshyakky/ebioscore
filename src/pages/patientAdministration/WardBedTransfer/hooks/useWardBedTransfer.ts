// src/pages/patientAdministration/WardBedTransfer/hooks/useWardBedTransfer.ts
import { useState, useCallback, useRef } from "react";
import { AdmissionDto } from "@/interfaces/PatientAdministration/AdmissionDto";
import { BedTransferRequestDto } from "@/interfaces/PatientAdministration/BedTransferRequestDto";
import { wardBedTransferService } from "@/services/PatientAdministrationServices/WardBedTransferService/WardBedTransferService";
import { extendedAdmissionService } from "@/services/PatientAdministrationServices/admissionService";
import { useAlert } from "@/providers/AlertProvider";

interface TransferHistoryRecord {
  transferId: number;
  admitID: number;
  pChartID: number;
  pChartCode: string;
  patientName: string;
  fromBedId: number;
  fromBedName: string;
  fromRoomName: string;
  toBedId: number;
  toBedName: string;
  toRoomName: string;
  transferDate: Date;
  treatPhyID: number;
  treatPhyName: string;
  reasonForTransfer: string;
  transferNotes: string;
  transferredBy: string;
  status: "Completed" | "Pending" | "Cancelled";
}

interface UseWardBedTransferState {
  currentAdmission: AdmissionDto | null;
  transferHistory: TransferHistoryRecord[];
  recentTransfers: BedTransferRequestDto[];
  loading: boolean;
  error: string | null;
}

interface UseWardBedTransferReturn extends UseWardBedTransferState {
  checkPatientAdmission: (pChartID: number) => Promise<void>;
  processTransfer: (transferData: BedTransferRequestDto) => Promise<void>;
  validateTransfer: (currentBedId: number, newBedId: number, admitId: number) => Promise<boolean>;
  getTransferHistory: (admitId: number) => Promise<void>;
  refreshTransfers: (days?: number, maxRecords?: number) => Promise<void>;
  clearState: () => void;
}

/**
 * Custom hook for managing ward/bed transfer operations.
 * Provides comprehensive functionality for patient transfer management including
 * admission checking, transfer processing, validation, and history retrieval.
 */
export const useWardBedTransfer = (): UseWardBedTransferReturn => {
  const [state, setState] = useState<UseWardBedTransferState>({
    currentAdmission: null,
    transferHistory: [],
    recentTransfers: [],
    loading: false,
    error: null,
  });

  const { showAlert } = useAlert();
  const lastFetchTime = useRef<number>(0);
  const cacheTimeout = 30000; // 30 seconds cache

  /**
   * Updates the state with new data while preserving other state properties
   */
  const updateState = useCallback((updates: Partial<UseWardBedTransferState>) => {
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
      console.error(`Ward/Bed transfer operation error (${operation}):`, error);

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
   * Checks if the patient is currently admitted and retrieves admission details
   */
  const checkPatientAdmission = useCallback(
    async (pChartID: number): Promise<void> => {
      try {
        updateState({ loading: true, error: null });

        const result = await extendedAdmissionService.getPatientAdmissionStatus(pChartID);

        if (result.success && result.data) {
          if (result.data.isAdmitted && result.data.admissionData) {
            updateState({
              currentAdmission: result.data.admissionData,
              loading: false,
              error: null,
            });
          } else {
            updateState({
              currentAdmission: null,
              loading: false,
              error: "Patient is not currently admitted",
            });
            showAlert("Information", "Patient is not currently admitted", "info");
          }
        } else {
          throw new Error(result.errorMessage || "Failed to check patient admission status");
        }
      } catch (error) {
        handleError(error, "check patient admission");
        updateState({ currentAdmission: null });
      }
    },
    [updateState, handleError, showAlert]
  );

  /**
   * Validates if a transfer is possible between the current and new bed
   */
  const validateTransfer = useCallback(
    async (currentBedId: number, newBedId: number, admitId: number): Promise<boolean> => {
      try {
        if (currentBedId === newBedId) {
          showAlert("Warning", "Cannot transfer to the same bed", "warning");
          return false;
        }

        const isValid = await wardBedTransferService.validateTransfer(currentBedId, newBedId, admitId);

        if (!isValid) {
          showAlert("Warning", "Transfer validation failed. The selected bed may not be available.", "warning");
        }

        return isValid;
      } catch (error) {
        handleError(error, "validate transfer");
        return false;
      }
    },
    [handleError, showAlert]
  );

  /**
   * Processes a ward/bed transfer request
   */
  const processTransfer = useCallback(
    async (transferData: BedTransferRequestDto): Promise<void> => {
      try {
        updateState({ loading: true, error: null });

        // Validate transfer before processing
        const isValid = await validateTransfer(
          transferData.admitID, // Using admitID as current bed reference
          transferData.bedID,
          transferData.admitID
        );

        if (!isValid) {
          updateState({ loading: false });
          return;
        }

        // Process the transfer
        const result = await wardBedTransferService.processTransfer(transferData);

        if (result.success) {
          updateState({ loading: false, error: null });
          showAlert("Success", "Transfer processed successfully", "success");

          // Refresh the current admission data to reflect the transfer
          if (state.currentAdmission) {
            await checkPatientAdmission(state.currentAdmission.ipAdmissionDto.pChartID);
          }

          // Refresh recent transfers
          await refreshTransfers();
        } else {
          throw new Error(result.errorMessage || "Failed to process transfer");
        }
      } catch (error) {
        handleError(error, "process transfer");
        throw error; // Re-throw to allow caller to handle
      }
    },
    [validateTransfer, state.currentAdmission, checkPatientAdmission, updateState, handleError, showAlert]
  );

  /**
   * Retrieves transfer history for a specific admission
   */
  const getTransferHistory = useCallback(
    async (admitId: number): Promise<void> => {
      try {
        updateState({ loading: true, error: null });

        const transfers = await wardBedTransferService.getTransfersByAdmission(admitId);

        // Transform the raw transfer data into our enhanced format
        const transformedHistory: TransferHistoryRecord[] = transfers.map((transfer, index) => ({
          transferId: index + 1,
          admitID: transfer.admitID || admitId,
          pChartID: transfer.pChartID,
          pChartCode: transfer.pChartCode,
          patientName: `Patient ${transfer.pChartCode}`, // This would ideally come from patient data
          fromBedId: 0, // Would need to track previous bed
          fromBedName: "Previous Bed",
          fromRoomName: "Previous Room",
          toBedId: transfer.bedID,
          toBedName: transfer.bedName,
          toRoomName: transfer.rName,
          transferDate: new Date(transfer.transferDate),
          treatPhyID: transfer.treatPhyID,
          treatPhyName: transfer.treatPhyName,
          reasonForTransfer: transfer.reasonForTransfer,
          transferNotes: transfer.rNotes || "",
          transferredBy: "System User", // Would come from audit trail
          status: "Completed" as const,
        }));

        updateState({
          transferHistory: transformedHistory,
          loading: false,
          error: null,
        });
      } catch (error) {
        handleError(error, "fetch transfer history");
      }
    },
    [updateState, handleError]
  );

  /**
   * Refreshes the list of recent transfers with caching support
   * @param days Number of days to look back for transfers (default: 7)
   * @param maxRecords Maximum number of records to return (default: 50)
   */
  const refreshTransfers = useCallback(
    async (days: number = 7, maxRecords: number = 50): Promise<void> => {
      const now = Date.now();

      // Check if we should use cached data (only if using default parameters)
      if (days === 7 && maxRecords === 50 && now - lastFetchTime.current < cacheTimeout && state.recentTransfers.length > 0) {
        return;
      }

      try {
        updateState({ loading: true, error: null });

        const recentTransfers = await wardBedTransferService.getRecentTransfers(days, maxRecords);

        updateState({
          recentTransfers: recentTransfers || [],
          loading: false,
          error: null,
        });

        // Update cache time only for default parameters
        if (days === 7 && maxRecords === 50) {
          lastFetchTime.current = now;
        }
      } catch (error) {
        handleError(error, "fetch recent transfers");
      }
    },
    [state.recentTransfers.length, updateState, handleError]
  );

  /**
   * Clears all state data and resets the hook to initial state
   */
  const clearState = useCallback(() => {
    setState({
      currentAdmission: null,
      transferHistory: [],
      recentTransfers: [],
      loading: false,
      error: null,
    });
    lastFetchTime.current = 0;
  }, []);

  return {
    ...state,
    checkPatientAdmission,
    processTransfer,
    validateTransfer,
    getTransferHistory,
    refreshTransfers,
    clearState,
  };
};

/**
 * Simplified hook for transfer validation only
 * Useful for components that only need to validate transfers
 */
export const useTransferValidation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showAlert } = useAlert();

  const validateTransfer = useCallback(
    async (currentBedId: number, newBedId: number, admitId: number): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        if (currentBedId === newBedId) {
          showAlert("Warning", "Cannot transfer to the same bed", "warning");
          setLoading(false);
          return false;
        }

        const isValid = await wardBedTransferService.validateTransfer(currentBedId, newBedId, admitId);

        if (!isValid) {
          showAlert("Warning", "Transfer validation failed. The selected bed may not be available.", "warning");
        }

        setLoading(false);
        return isValid;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to validate transfer";
        setError(errorMessage);
        setLoading(false);
        showAlert("Error", errorMessage, "error");
        return false;
      }
    },
    [showAlert]
  );

  return {
    validateTransfer,
    loading,
    error,
  };
};

export default useWardBedTransfer;
