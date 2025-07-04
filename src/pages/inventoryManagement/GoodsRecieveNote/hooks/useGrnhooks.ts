// Complete implementation for the approveGrn function in useGrn.ts

import { useLoading } from "@/hooks/Common/useLoading";
import { GrnDto, GrnMastDto, GrnSearchRequest } from "@/interfaces/InventoryManagement/GRNDto";
import { useAlert } from "@/providers/AlertProvider";
import { OperationResult } from "@/services/GenericEntityService/GenericEntityService";
import { grnService } from "@/services/InventoryManagementService/GRNService/GRNService";
import { grnMastService } from "@/services/InventoryManagementService/inventoryManagementService";
import { useCallback, useState } from "react";

export const useGrn = () => {
  const { setLoading } = useLoading();
  const { showAlert } = useAlert();
  const [grnList, setGrnList] = useState<GrnDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchRequest, setLastSearchRequest] = useState<GrnSearchRequest | null>(null);

  const fetchGrnList = useCallback(
    async (searchRequest?: Partial<GrnSearchRequest>) => {
      try {
        setIsLoading(true);
        setError(null);
        const defaultRequest: GrnSearchRequest = {
          pageIndex: 1,
          pageSize: 100,
          sortBy: "grnDate",
          sortAscending: false,
          ...searchRequest,
        };
        setLastSearchRequest(defaultRequest);
        const response = await grnMastService.getAll();
        if (response.success && response.data) {
          const grnDtos: GrnDto[] = response.data.map((mast: GrnMastDto) => ({
            grnMastDto: mast,
            grnDetailDto: [],
          }));
          setGrnList(grnDtos);
          return grnDtos;
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

  const refreshGrnList = useCallback(async () => {
    if (lastSearchRequest) {
      return await fetchGrnList(lastSearchRequest);
    }
    showAlert("Info", "No previous search to refresh.", "info");
    return [];
  }, [lastSearchRequest, fetchGrnList, showAlert]);

  const getGrnById = useCallback(
    async (grnId: number): Promise<GrnDto | null> => {
      try {
        setLoading(true);
        const response = await grnService.getGrnWithDetailsById(grnId);

        if (response.success && response.data) {
          return response.data;
        } else {
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

  const createGrn = useCallback(
    async (grnData: GrnDto): Promise<OperationResult<GrnDto>> => {
      try {
        setLoading(true);
        const response = await grnService.createGrnWithDetails(grnData);
        if (response.success) {
          showAlert("Success", "GRN created successfully!", "success");
          await refreshGrnList();
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

  const deleteGrn = useCallback(
    async (grnId: number): Promise<boolean> => {
      try {
        setLoading(true);
        const response = await grnMastService.delete(grnId);
        if (response.success) {
          setGrnList((prev) => prev.filter((grn) => grn.grnMastDto.grnID !== grnId));
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

  const approveGrn = useCallback(
    async (grnId: number): Promise<boolean> => {
      try {
        setLoading(true);
        const updateData: Partial<GrnMastDto> = {
          grnID: grnId,
          grnApprovedYN: "Y",
          grnStatus: "Approved",
          grnStatusCode: "APPR",
          grnApprovedDate: new Date().toISOString(),
        };
        const response = await grnMastService.save(updateData as GrnMastDto);
        if (response.success) {
          setGrnList((prev) =>
            prev.map((grn) =>
              grn.grnMastDto.grnID === grnId
                ? {
                    ...grn,
                    grnMastDto: {
                      ...grn.grnMastDto,
                      grnApprovedYN: "Y",
                      grnStatus: "Approved",
                      grnStatusCode: "APPR",
                    },
                  }
                : grn
            )
          );

          showAlert("Success", "GRN approved successfully! Stock has been updated.", "success");
          return true;
        } else {
          throw new Error(response.errorMessage || "Failed to approve GRN.");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        showAlert("Error", "GRN approval failed: " + errorMessage, "error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [showAlert, setLoading]
  );

  const generateGrnCode = useCallback(
    async (departmentId: number): Promise<string | null> => {
      try {
        setLoading(true);
        const now = new Date();
        const yearMonth = now.getFullYear().toString() + (now.getMonth() + 1).toString().padStart(2, "0");
        const sequence = Math.floor(Math.random() * 99999)
          .toString()
          .padStart(5, "0");
        const grnCode = `DEPT${departmentId.toString().padStart(3, "0")}/GRN/${yearMonth}/${sequence}`;
        return grnCode;
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

  const getGrnStatistics = useCallback(
    (deptId?: number) => {
      const list = deptId ? grnList.filter((grn) => grn.grnMastDto.deptID === deptId) : grnList;
      const totalGrns = list.length;
      const approvedGrns = list.filter((grn) => grn.grnMastDto.grnApprovedYN === "Y").length;
      const pendingGrns = list.filter((grn) => grn.grnMastDto.grnStatusCode === "PENDING").length;
      return { totalGrns, approvedGrns, pendingGrns };
    },
    [grnList]
  );

  const getStatusDisplayName = useCallback((grn: GrnDto): string => {
    return grn.grnMastDto.grnStatus || grn.grnMastDto.grnStatusCode || "Unknown";
  }, []);

  const canEditGrn = useCallback((grn: GrnDto): boolean => {
    return grn.grnMastDto.grnApprovedYN !== "Y";
  }, []);

  const canDeleteGrn = useCallback((grn: GrnDto): boolean => {
    return grn.grnMastDto.grnApprovedYN !== "Y";
  }, []);

  const getGrnStatusColor = useCallback((grn: GrnDto): "success" | "warning" | "error" | "default" => {
    if (grn.grnMastDto.grnApprovedYN === "Y") return "success";
    if (grn.grnMastDto.grnStatusCode === "PENDING") return "warning";
    if (grn.grnMastDto.grnStatusCode === "REJECTED") return "error";
    return "default";
  }, []);

  return {
    grnList,
    isLoading,
    error,
    fetchGrnList,
    refreshGrnList,
    getGrnById,
    createGrn,
    deleteGrn,
    approveGrn,
    generateGrnCode,
    getGrnStatistics,
    getStatusDisplayName,
    getGrnStatusColor,
    canEditGrn,
    canDeleteGrn,
  };
};
