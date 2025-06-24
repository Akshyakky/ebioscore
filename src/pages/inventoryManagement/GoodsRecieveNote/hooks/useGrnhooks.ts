import { useLoading } from "@/hooks/Common/useLoading";
import { GRNSearchRequest, GRNWithAllDetailsDto } from "@/interfaces/InventoryManagement/GRNDto";
import { useAlert } from "@/providers/AlertProvider";
import { bGrnMastService, bGrnService } from "@/services/InventoryManagementService/GRNService/GRNService";
import { useCallback, useRef, useState } from "react";

interface UseGRNState {
  grns: GRNWithAllDetailsDto[];
  loading: boolean;
  error: string | null;
}

interface UseGRNReturn extends UseGRNState {
  refreshGrns: () => Promise<void>;
  saveGrn: (grnData: GRNWithAllDetailsDto) => Promise<void>;
  deleteGrn: (grnId: number) => Promise<void>;
  generateGrnCode: (departmentId: number) => Promise<string>;
  getGrnById: (grnId: number) => Promise<GRNWithAllDetailsDto | null>;
  approveGrn: (grnId: number) => Promise<void>;
  updateProductStock: (grnId: number) => Promise<void>;
  clearState: () => void;
}

export const useGRN = (): UseGRNReturn => {
  const [state, setState] = useState<UseGRNState>({
    grns: [],
    loading: false,
    error: null,
  });
  const { showAlert } = useAlert();
  const lastFetchTime = useRef<number>(0);
  const cacheTimeout = 30000;

  const updateState = useCallback((updates: Partial<UseGRNState>) => {
    setState((prevState) => ({
      ...prevState,
      ...updates,
    }));
  }, []);

  const handleError = useCallback(
    (error: unknown, operation: string) => {
      const errorMessage = error instanceof Error ? error.message : `Failed to ${operation}`;
      updateState({
        error: errorMessage,
        loading: false,
      });

      showAlert("Error", errorMessage, "error");
      return errorMessage;
    },
    [updateState, showAlert]
  );

  const refreshGrns = useCallback(async (): Promise<void> => {
    const now = Date.now();
    if (now - lastFetchTime.current < cacheTimeout && state.grns.length > 0) {
      return;
    }
    try {
      updateState({ loading: true, error: null });
      // Use GetAll endpoint instead of GetAllGrnsWithDetails
      const result = await bGrnService.getAllGrnsWithDetails();
      if (result.success && result.data) {
        // Ensure each item has grnDetails (fallback to empty array if missing)
        const grnsWithDetails: GRNWithAllDetailsDto[] = result.data.map((grn: any) => ({
          ...grn,
          grnDetails: grn.grnDetails ?? [],
        }));
        updateState({
          grns: grnsWithDetails,
          loading: false,
          error: null,
        });
        lastFetchTime.current = now;
      } else {
        throw new Error(result.errorMessage || "Failed to fetch GRNs");
      }
    } catch (error) {
      handleError(error, "fetch GRNs");
    }
  }, [state.grns.length, updateState, handleError]);

  const saveGrn = useCallback(
    async (grnData: GRNWithAllDetailsDto): Promise<void> => {
      try {
        updateState({ loading: true, error: null });
        if (!grnData.deptID || grnData.deptID <= 0) {
          throw new Error("Department is required");
        }
        if (!grnData.deptName || grnData.deptName.trim() === "") {
          throw new Error("Department name is required");
        }
        if (!grnData.supplrID || grnData.supplrID <= 0) {
          throw new Error("Supplier is required");
        }
        if (!grnData.supplrName || grnData.supplrName.trim() === "") {
          throw new Error("Supplier name is required");
        }
        if (!grnData.invoiceNo || grnData.invoiceNo.trim() === "") {
          throw new Error("Invoice number is required");
        }
        if (!grnData.grnDate) {
          throw new Error("GRN date is required");
        }
        if (!grnData.invDate) {
          throw new Error("Invoice date is required");
        }
        if (!grnData.grnDetails || grnData.grnDetails.length === 0) {
          throw new Error("At least one GRN detail is required");
        }

        // Use CreateWithDetails endpoint
        const result = await bGrnService.saveGrnWithAllDetails(grnData);
        if (result.success) {
          updateState({ loading: false, error: null });
          showAlert("Success", `GRN ${grnData.grnID ? "updated" : "created"} successfully`, "success");
          await refreshGrns();
        } else {
          throw new Error(result.errorMessage || "Failed to save GRN");
        }
      } catch (error) {
        handleError(error, "save GRN");
        throw error;
      }
    },
    [updateState, handleError, showAlert, refreshGrns]
  );

  const deleteGrn = useCallback(
    async (grnId: number): Promise<void> => {
      try {
        updateState({ loading: true, error: null });
        if (grnId <= 0) {
          throw new Error("Invalid GRN ID");
        }
        const result = await bGrnService.delete(grnId);
        if (result.success) {
          updateState({ loading: false, error: null });
          showAlert("Success", "GRN deleted successfully", "success");
          await refreshGrns();
        } else {
          throw new Error(result.errorMessage || "Failed to delete GRN");
        }
      } catch (error) {
        handleError(error, "delete GRN");
        throw error;
      }
    },
    [updateState, handleError, showAlert, refreshGrns]
  );

  const generateGrnCode = useCallback(
    async (departmentId: number): Promise<string> => {
      try {
        if (departmentId <= 0) {
          throw new Error("Department ID is required for code generation");
        }
        const result = await bGrnService.generateGrnCode(departmentId);
        if (result.success && result.data) {
          return result.data as string;
        } else {
          throw new Error(result.errorMessage || "Failed to generate GRN code");
        }
      } catch (error) {
        handleError(error, "generate GRN code");
        const fallbackCode = `GRN${departmentId}${Date.now().toString().slice(-4)}`;
        showAlert("Warning", `Using fallback GRN code: ${fallbackCode}`, "warning");
        return fallbackCode;
      }
    },
    [handleError, showAlert]
  );

  const getGrnById = useCallback(
    async (grnId: number): Promise<GRNWithAllDetailsDto | null> => {
      try {
        updateState({ loading: true, error: null });
        if (grnId <= 0) {
          throw new Error("Invalid GRN ID");
        }
        // Use GetGrnWithDetailsById endpoint
        const result = await bGrnService.getAllGrnsWithDetailsByID(grnId);
        updateState({ loading: false, error: null });
        if (result.success && result.data) {
          return result.data.map((grn: any) => ({
            ...grn,
            grnDetails: grn.grnDetails ?? [],
          }));
        } else {
          throw new Error(result.errorMessage || "Failed to fetch GRN details");
        }
      } catch (error) {
        handleError(error, "fetch GRN details");
        return null;
      }
    },
    [updateState, handleError]
  );

  const approveGrn = useCallback(
    async (grnId: number): Promise<void> => {
      try {
        updateState({ loading: true, error: null });
        if (grnId <= 0) {
          throw new Error("Invalid GRN ID");
        }
        // Use Approve endpoint
        const result = await bGrnService.approveGrn(grnId);
        if (result.success) {
          updateState({ loading: false, error: null });
          showAlert("Success", "GRN approved successfully", "success");
          await refreshGrns();
        } else {
          throw new Error(result.errorMessage || "Failed to approve GRN");
        }
      } catch (error) {
        handleError(error, "approve GRN");
        throw error;
      }
    },
    [updateState, handleError, showAlert, refreshGrns]
  );

  const updateProductStock = useCallback(
    async (grnId: number): Promise<void> => {
      try {
        updateState({ loading: true, error: null });
        if (grnId <= 0) {
          throw new Error("Invalid GRN ID");
        }
        const result = await bGrnMastService.updateProductStock(grnId);
        if (result.success) {
          updateState({ loading: false, error: null });
          showAlert("Success", "Product stock updated successfully", "success");
          await refreshGrns();
        } else {
          throw new Error(result.errorMessage || "Failed to update product stock");
        }
      } catch (error) {
        handleError(error, "update product stock");
        throw error;
      }
    },
    [updateState, handleError, showAlert, refreshGrns]
  );

  const clearState = useCallback(() => {
    setState({
      grns: [],
      loading: false,
      error: null,
    });
    lastFetchTime.current = 0;
  }, []);

  return {
    ...state,
    refreshGrns,
    saveGrn,
    deleteGrn,
    generateGrnCode,
    getGrnById,
    approveGrn,
    updateProductStock,
    clearState,
  };
};

export const useGRNSearch = () => {
  const { isLoading, setLoading } = useLoading();
  const [error, setError] = useState<string | null>(null);
  const { showAlert } = useAlert();

  const searchGrns = useCallback(
    async (searchTerm: string): Promise<GRNWithAllDetailsDto[]> => {
      try {
        setLoading(true);
        setError(null);
        // Use GetAll endpoint for search
        const result = await bGrnService.getAllGrnsWithDetails();
        if (result.success && result.data) {
          setLoading(false);
          if (!searchTerm.trim()) {
            return result.data.map((grn: any) => ({
              ...grn,
              grnDetails: grn.grnDetails ?? [],
            }));
          }
          const searchLower = searchTerm.toLowerCase();
          return result.data
            .filter(
              (grn) =>
                grn.grnCode?.toLowerCase().includes(searchLower) ||
                grn.invoiceNo?.toLowerCase().includes(searchLower) ||
                grn.supplrName?.toLowerCase().includes(searchLower) ||
                grn.deptName?.toLowerCase().includes(searchLower) ||
                grn.grnStatus?.toLowerCase().includes(searchLower)
            )
            .map((grn: any) => ({
              ...grn,
              grnDetails: grn.grnDetails ?? [],
            }));
        } else {
          throw new Error(result.errorMessage || "Failed to search GRNs");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to search GRNs";
        setError(errorMessage);
        setLoading(false);
        showAlert("Error", errorMessage, "error");
        return [];
      }
    },
    [showAlert, setLoading]
  );

  const validateGrnCode = useCallback(
    async (grnCode: string): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);
        const result = await bGrnService.getAllGrnsWithDetails();
        setLoading(false);
        if (result.success && result.data) {
          const existingGrn = result.data.find((grn) => grn.grnCode?.toLowerCase() === grnCode.toLowerCase());
          return !existingGrn;
        } else {
          throw new Error(result.errorMessage || "Failed to validate GRN code");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to validate GRN code";
        setError(errorMessage);
        setLoading(false);
        showAlert("Error", errorMessage, "error");
        return false;
      }
    },
    [showAlert, setLoading]
  );

  const searchGrnsByRequest = useCallback(
    async (searchRequest: GRNSearchRequest): Promise<any> => {
      try {
        setLoading(true);
        setError(null);
        // Use GrnSearch endpoint
        const result = await bGrnService.searchGrns(searchRequest);
        setLoading(false);
        if (result.success) {
          return result.data;
        } else {
          throw new Error(result.errorMessage || "Failed to search GRNs");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to search GRNs";
        setError(errorMessage);
        setLoading(false);
        showAlert("Error", errorMessage, "error");
        return null;
      }
    },
    [showAlert, setLoading]
  );

  return {
    searchGrns,
    validateGrnCode,
    searchGrnsByRequest,
    isLoading,
    error,
  };
};

export default useGRN;
