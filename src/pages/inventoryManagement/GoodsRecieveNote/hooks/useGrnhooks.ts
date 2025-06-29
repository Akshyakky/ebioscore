import { useLoading } from "@/hooks/Common/useLoading";
import { GrnMastDto, GrnSearchRequest } from "@/interfaces/InventoryManagement/GRNDto";
import { useAlert } from "@/providers/AlertProvider";
import { OperationResult } from "@/services/GenericEntityService/GenericEntityService";
import { grnMastServices } from "@/services/InventoryManagementService/GRNService/GRNService";
import { useCallback, useState } from "react";

/**
 * Custom hook for managing Goods Receipt Note (GRN) operations.
 * It provides state and functions for fetching, creating, approving, and deleting GRNs.
 */
export const useGrn = () => {
  const { setLoading } = useLoading();
  const { showAlert } = useAlert();
  const [grnList, setGrnList] = useState<GrnMastDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Stores the last used search request to enable easy refreshing
  const [lastSearchRequest, setLastSearchRequest] = useState<GrnSearchRequest | null>(null);

  /**
   * Fetches a list of GRNs based on search criteria.
   */
  const fetchGrnList = useCallback(
    async (searchRequest?: Partial<GrnSearchRequest>) => {
      try {
        setIsLoading(true);
        setError(null);

        // Define default search parameters, which can be overridden
        const defaultRequest: GrnSearchRequest = {
          pageIndex: 1,
          pageSize: 100,
          sortBy: "GrnDate",
          sortAscending: false,
          ...searchRequest,
        };

        setLastSearchRequest(defaultRequest);

        const response = await grnMastServices.getAll();

        if (response.success && response.data) {
          setGrnList(response.data);
          return response.data;
        } else {
          throw new Error(response.errorMessage || "Failed to fetch GRN list");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred while fetching GRNs.";
        setError(errorMessage);
        showAlert("Error", errorMessage, "error");
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [showAlert]
  );

  /**
   * Refreshes the GRN list using the last successful search criteria.
   */
  const refreshGrnList = useCallback(async () => {
    if (lastSearchRequest) {
      return await fetchGrnList(lastSearchRequest);
    }
    showAlert("Info", "No previous search to refresh.", "info");
    return [];
  }, [lastSearchRequest, fetchGrnList, showAlert]);

  /**
   * Fetches a single GRN with its details by its ID.
   */
  const getGrnById = useCallback(
    async (grnId: number): Promise<GrnMastDto | null> => {
      try {
        setLoading(true);
        const response = await grnMastServices.getGrnWithDetailsById(grnId);

        if (response.success && response.data) {
          return response.data;
        } else {
          // The backend returns a specific error for approved GRNs
          const message = response.errorMessage?.includes("approved")
            ? "Cannot fetch for editing: This GRN is already approved."
            : response.errorMessage || "Failed to fetch GRN details.";
          throw new Error(message);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        setError(errorMessage);
        showAlert("Error", errorMessage, "error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showAlert, setLoading]
  );

  /**
   * Creates a new GRN with its details.
   */
  const createGrn = useCallback(
    async (grnData: GrnMastDto): Promise<OperationResult<GrnMastDto>> => {
      try {
        setLoading(true);
        const response = await grnMastServices.createGrnWithDetails(grnData);
        if (response.success) {
          showAlert("Success", "GRN created successfully!", "success");
          await refreshGrnList(); // Refresh the list to show the new GRN
          return response;
        } else {
          throw new Error(response.errorMessage || "Failed to create GRN.");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        showAlert("Error", errorMessage, "error");
        return { success: false, errorMessage, data: undefined };
      } finally {
        setLoading(false);
      }
    },
    [showAlert, setLoading, refreshGrnList]
  );

  /**
   * Deletes a GRN. This is based on the generic delete functionality.
   */
  const deleteGrn = useCallback(
    async (grnId: number): Promise<boolean> => {
      try {
        setLoading(true);
        const response = await grnMastServices.delete(grnId);
        if (response.success) {
          // Optimistically remove from local state for a faster UI update
          setGrnList((prev) => prev.filter((grn) => grn.GrnID !== grnId));
          showAlert("Success", "GRN deleted successfully.", "success");
          return true;
        } else {
          throw new Error(response.errorMessage || "Failed to delete GRN.");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        showAlert("Error", errorMessage, "error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [showAlert, setLoading]
  );

  /**
   * Approves a GRN, which updates its status and triggers stock updates on the backend.
   */
  const approveGrn = useCallback(
    async (grnId: number): Promise<boolean> => {
      try {
        setLoading(true);
        const response = await grnMastServices.approveGrn(grnId);
        if (response.success) {
          // Optimistically update the local state to reflect the approval
          setGrnList((prev) => prev.map((grn) => (grn.GrnID === grnId ? { ...grn, ...response.data, GrnApprovedYN: "Y", GrnStatusCode: "APPROVED", GrnStatus: "Approved" } : grn)));
          showAlert("Success", "GRN approved successfully!", "success");
          return true;
        } else {
          throw new Error(response.errorMessage || "Failed to approve GRN.");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        showAlert("Error", errorMessage, "error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [showAlert, setLoading]
  );

  /**
   * Generates a unique GRN code for a specific department.
   */
  const generateGrnCode = useCallback(
    async (departmentId: number): Promise<string | null> => {
      try {
        setLoading(true);
        const response = await grnMastServices.generateGrnCode(departmentId);
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.errorMessage || "Failed to generate GRN code.");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        showAlert("Error", errorMessage, "error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showAlert, setLoading]
  );

  /**
   * Calculates key statistics from the current list of GRNs.
   */
  const getGrnStatistics = useCallback(
    (deptId?: number) => {
      const list = deptId ? grnList.filter((grn) => grn.DeptID === deptId) : grnList;
      const totalGrns = list.length;
      const approvedGrns = list.filter((grn) => grn.GrnApprovedYN === "Y").length;
      const pendingGrns = list.filter((grn) => grn.GrnStatusCode === "PENDING").length;
      return { totalGrns, approvedGrns, pendingGrns };
    },
    [grnList]
  );

  /**
   * Gets a user-friendly display name for a GRN status code.
   */
  const getStatusDisplayName = useCallback((grn: GrnMastDto): string => {
    return grn.GrnStatus || grn.GrnStatusCode || "Unknown";
  }, []);

  /**
   * Determines if a GRN can be edited based on its status.
   */
  const canEditGrn = useCallback((grn: GrnMastDto): boolean => {
    return grn.GrnApprovedYN !== "Y";
  }, []);

  /**
   * Determines if a GRN can be deleted based on its status.
   */
  const canDeleteGrn = useCallback((grn: GrnMastDto): boolean => {
    // A GRN can typically be deleted only if it hasn't been approved.
    return grn.GrnApprovedYN !== "Y";
  }, []);

  /**
   * Returns a color code for a GRN status, useful for UI badges.
   */
  const getGrnStatusColor = useCallback((grn: GrnMastDto): "success" | "warning" | "error" | "default" => {
    if (grn.GrnApprovedYN === "Y") return "success";
    if (grn.GrnStatusCode === "PENDING") return "warning";
    if (grn.GrnStatusCode === "REJECTED") return "error";
    return "default";
  }, []);

  return {
    // State
    grnList,
    isLoading,
    error,
    // Core Functions
    fetchGrnList,
    refreshGrnList,
    getGrnById,
    createGrn,
    deleteGrn,
    approveGrn,
    generateGrnCode,
    // Utility Functions
    getGrnStatistics,
    getStatusDisplayName,
    getGrnStatusColor,
    canEditGrn,
    canDeleteGrn,
  };
};
