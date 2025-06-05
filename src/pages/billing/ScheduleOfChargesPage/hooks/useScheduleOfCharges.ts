// src/pages/billing/ScheduleOfChargesPage/hooks/useScheduleOfCharges.ts
import { useState, useCallback, useRef } from "react";
import { ChargeWithAllDetailsDto, ChargeCodeGenerationDto } from "@/interfaces/Billing/ChargeDto";
import { bChargeService } from "@/services/BillingServices/BillingService";
import { useAlert } from "@/providers/AlertProvider";

interface UseScheduleOfChargesState {
  charges: ChargeWithAllDetailsDto[];
  loading: boolean;
  error: string | null;
}

interface UseScheduleOfChargesReturn extends UseScheduleOfChargesState {
  refreshCharges: () => Promise<void>;
  saveCharge: (chargeData: ChargeWithAllDetailsDto) => Promise<void>;
  deleteCharge: (chargeId: number) => Promise<void>;
  generateChargeCode: (codeGeneration: ChargeCodeGenerationDto) => Promise<string>;
  getChargeById: (chargeId: number) => Promise<ChargeWithAllDetailsDto | null>;
  clearState: () => void;
}

/**
 * Custom hook for managing Schedule of Charges operations.
 * Provides comprehensive functionality for charge management including
 * CRUD operations, code generation, and data caching.
 */
export const useScheduleOfCharges = (): UseScheduleOfChargesReturn => {
  const [state, setState] = useState<UseScheduleOfChargesState>({
    charges: [],
    loading: false,
    error: null,
  });

  const { showAlert } = useAlert();
  const lastFetchTime = useRef<number>(0);
  const cacheTimeout = 30000; // 30 seconds cache

  /**
   * Updates the state with new data while preserving other state properties
   */
  const updateState = useCallback((updates: Partial<UseScheduleOfChargesState>) => {
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
      console.error(`Charge operation error (${operation}):`, error);

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
   * Refreshes the list of charges with caching support
   */
  const refreshCharges = useCallback(async (): Promise<void> => {
    const now = Date.now();

    // Check if we should use cached data
    if (now - lastFetchTime.current < cacheTimeout && state.charges.length > 0) {
      return;
    }

    try {
      updateState({ loading: true, error: null });

      const result = await bChargeService.getAllChargesWithDetails();

      if (result.success && result.data) {
        updateState({
          charges: result.data,
          loading: false,
          error: null,
        });
        lastFetchTime.current = now;
      } else {
        throw new Error(result.errorMessage || "Failed to fetch charges");
      }
    } catch (error) {
      handleError(error, "fetch charges");
    }
  }, [state.charges.length, updateState, handleError]);

  /**
   * Saves a charge with all its related details
   */
  const saveCharge = useCallback(
    async (chargeData: ChargeWithAllDetailsDto): Promise<void> => {
      try {
        updateState({ loading: true, error: null });

        // Validate charge data before submission
        if (!chargeData.chargeCode) {
          throw new Error("Charge code is required");
        }

        if (!chargeData.chargeDesc) {
          throw new Error("Charge description is required");
        }

        if (!chargeData.chargeType) {
          throw new Error("Charge type is required");
        }

        if (!chargeData.chargeTo) {
          throw new Error("Charge to is required");
        }

        if (!chargeData.chargeStatus) {
          throw new Error("Charge status is required");
        }

        const result = await bChargeService.saveChargesWithAllDetails(chargeData);

        if (result.success) {
          updateState({ loading: false, error: null });
          showAlert("Success", `Charge ${chargeData.chargeID ? "updated" : "created"} successfully`, "success");

          // Refresh charges list to reflect changes
          await refreshCharges();
        } else {
          throw new Error(result.errorMessage || "Failed to save charge");
        }
      } catch (error) {
        handleError(error, "save charge");
        throw error; // Re-throw to allow caller to handle
      }
    },
    [updateState, handleError, showAlert, refreshCharges]
  );

  /**
   * Deletes a charge by ID
   */
  const deleteCharge = useCallback(
    async (chargeId: number): Promise<void> => {
      try {
        updateState({ loading: true, error: null });

        if (chargeId <= 0) {
          throw new Error("Invalid charge ID");
        }

        const result = await bChargeService.delete(chargeId);

        if (result.success) {
          updateState({ loading: false, error: null });
          showAlert("Success", "Charge deleted successfully", "success");

          // Refresh charges list to reflect changes
          await refreshCharges();
        } else {
          throw new Error(result.errorMessage || "Failed to delete charge");
        }
      } catch (error) {
        handleError(error, "delete charge");
        throw error; // Re-throw to allow caller to handle
      }
    },
    [updateState, handleError, showAlert, refreshCharges]
  );

  const generateChargeCode = useCallback(
    async (codeGeneration: ChargeCodeGenerationDto): Promise<string> => {
      try {
        debugger;
        if (!codeGeneration.ChargeType) {
          throw new Error("Charge type is required for code generation");
        }

        if (!codeGeneration.ChargeTo) {
          throw new Error("Charge to is required for code generation");
        }
        const result = await bChargeService.generateChargeCode(codeGeneration);
        if (result.success && result.data) {
          return result.data;
        } else {
          throw new Error(result.errorMessage || "Failed to generate charge code");
        }
      } catch (error) {
        handleError(error, "generate charge code");

        // Generate a fallback code based on timestamp and parameters
        const fallbackCode = `${codeGeneration.ChargeType}${codeGeneration.ChargeTo}${Date.now().toString().slice(-4)}`;
        showAlert("Warning", `Using fallback charge code: ${fallbackCode}`, "warning");
        return fallbackCode;
      }
    },
    [handleError, showAlert]
  );

  /**
   * Retrieves a specific charge by ID with all its details
   */
  const getChargeById = useCallback(
    async (chargeId: number): Promise<ChargeWithAllDetailsDto | null> => {
      try {
        updateState({ loading: true, error: null });

        if (chargeId <= 0) {
          throw new Error("Invalid charge ID");
        }

        const result = await bChargeService.getAllChargesWithDetailsByID(chargeId);

        updateState({ loading: false, error: null });

        if (result.success && result.data) {
          return result.data;
        } else {
          throw new Error(result.errorMessage || "Failed to fetch charge details");
        }
      } catch (error) {
        handleError(error, "fetch charge details");
        return null;
      }
    },
    [updateState, handleError]
  );

  /**
   * Clears all state data and resets the hook to initial state
   */
  const clearState = useCallback(() => {
    setState({
      charges: [],
      loading: false,
      error: null,
    });
    lastFetchTime.current = 0;
  }, []);

  return {
    ...state,
    refreshCharges,
    saveCharge,
    deleteCharge,
    generateChargeCode,
    getChargeById,
    clearState,
  };
};

/**
 * Hook specifically for charge lookup operations without full charge management
 * Useful for components that only need to search or validate charges
 */
export const useChargeSearch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showAlert } = useAlert();

  const searchCharges = useCallback(
    async (searchTerm: string): Promise<ChargeWithAllDetailsDto[]> => {
      try {
        setLoading(true);
        setError(null);

        const result = await bChargeService.getAllChargesWithDetails();

        if (result.success && result.data) {
          setLoading(false);

          // Filter charges based on search term
          if (!searchTerm.trim()) {
            return result.data;
          }

          const searchLower = searchTerm.toLowerCase();
          return result.data.filter(
            (charge) =>
              charge.chargeCode.toLowerCase().includes(searchLower) ||
              charge.chargeDesc.toLowerCase().includes(searchLower) ||
              charge.chargesHDesc?.toLowerCase().includes(searchLower) ||
              charge.cShortName?.toLowerCase().includes(searchLower)
          );
        } else {
          throw new Error(result.errorMessage || "Failed to search charges");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to search charges";
        setError(errorMessage);
        setLoading(false);
        showAlert("Error", errorMessage, "error");
        return [];
      }
    },
    [showAlert]
  );

  const validateChargeCode = useCallback(
    async (chargeCode: string): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        const result = await bChargeService.getAllChargesWithDetails();

        setLoading(false);

        if (result.success && result.data) {
          // Check if charge code already exists
          const existingCharge = result.data.find((charge) => charge.chargeCode.toLowerCase() === chargeCode.toLowerCase());
          return !existingCharge; // Return true if code is unique
        } else {
          throw new Error(result.errorMessage || "Failed to validate charge code");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to validate charge code";
        setError(errorMessage);
        setLoading(false);
        showAlert("Error", errorMessage, "error");
        return false;
      }
    },
    [showAlert]
  );

  return {
    searchCharges,
    validateChargeCode,
    loading,
    error,
  };
};

export default useScheduleOfCharges;
