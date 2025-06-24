import { useLoading } from "@/hooks/Common/useLoading";
import { GRNDepartmentTransfer, GRNHelpers, GRNHistoryDto, GRNQualityCheck, GRNSearchRequest, GRNWithAllDetailsDto } from "@/interfaces/InventoryManagement/GRNDto";
import { useAlert } from "@/providers/AlertProvider";
import { bGrnMastService, bGrnService } from "@/services/InventoryManagementService/GRNService/GRNService";

import { useCallback, useRef, useState } from "react";

interface UseEnhancedGRNState {
  grns: GRNWithAllDetailsDto[];
  loading: boolean;
  error: string | null;
  statistics: {
    total: number;
    approved: number;
    pending: number;
    overdue: number;
    hidden: number;
    totalValue: number;
    avgValue: number;
  };
}

interface UseEnhancedGRNReturn extends UseEnhancedGRNState {
  // Basic CRUD Operations
  refreshGrns: () => Promise<void>;
  saveGrn: (grnData: GRNWithAllDetailsDto) => Promise<void>;
  deleteGrn: (grnId: number) => Promise<void>;
  generateGrnCode: (departmentId: number) => Promise<string>;
  getGrnById: (grnId: number) => Promise<GRNWithAllDetailsDto | null>;

  // Approval Operations
  approveGrn: (grnId: number) => Promise<void>;
  bulkApproveGrns: (grnIds: number[]) => Promise<void>;
  updateProductStock: (grnId: number) => Promise<void>;

  // Advanced Operations
  hideGrn: (grnId: number) => Promise<void>;
  unhideGrn: (grnId: number) => Promise<void>;
  bulkHideGrns: (grnIds: number[]) => Promise<void>;
  bulkDeleteGrns: (grnIds: number[]) => Promise<void>;

  // Excel Operations
  // uploadFromExcel: (file: File, departmentId: number) => Promise<GRNExcelUploadResult | null>;
  downloadExcelTemplate: () => Promise<void>;
  exportGrnToExcel: (grnId: number) => Promise<void>;
  exportMultipleGrnsToExcel: (grnIds: number[]) => Promise<void>;

  // History Operations
  getGrnHistory: (grnId: number) => Promise<GRNHistoryDto[]>;

  // Department Transfer
  transferGrnToDepartment: (transferData: GRNDepartmentTransfer) => Promise<void>;
  createNewIssueDepartment: (grnId: number, departmentId: number, issueItems: number[]) => Promise<void>;

  // Quality Check
  performQualityCheck: (qualityCheck: GRNQualityCheck) => Promise<void>;
  getQualityCheckHistory: (grnId: number) => Promise<GRNQualityCheck[]>;

  // Reporting
  getGrnSummaryReport: (dateFrom: string, dateTo: string, departmentId?: number) => Promise<any>;
  getSupplierWiseReport: (dateFrom: string, dateTo: string) => Promise<any>;
  getDepartmentWiseReport: (dateFrom: string, dateTo: string) => Promise<any>;
  getProductWiseReport: (dateFrom: string, dateTo: string, productId?: number) => Promise<any>;

  // Dashboard
  getDashboardData: (dateFrom: string, dateTo: string) => Promise<any>;
  getRecentActivity: (limit?: number) => Promise<any[]>;

  // Utility
  validateGrn: (grnData: GRNWithAllDetailsDto) => Promise<boolean>;
  recalculateGrnTotals: (grnId: number) => Promise<void>;
  clearState: () => void;
}

export const useEnhancedGRN = (): UseEnhancedGRNReturn => {
  const [state, setState] = useState<UseEnhancedGRNState>({
    grns: [],
    loading: false,
    error: null,
    statistics: {
      total: 0,
      approved: 0,
      pending: 0,
      overdue: 0,
      hidden: 0,
      totalValue: 0,
      avgValue: 0,
    },
  });

  const { showAlert } = useAlert();
  const lastFetchTime = useRef<number>(0);
  const cacheTimeout = 30000;

  const updateState = useCallback((updates: Partial<UseEnhancedGRNState>) => {
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

  // Calculate statistics from GRN data
  const calculateStatistics = useCallback((grns: GRNWithAllDetailsDto[]) => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const statistics = {
      total: grns.length,
      approved: grns.filter((g) => g.grnApprovedYN === "Y").length,
      pending: grns.filter((g) => g.grnApprovedYN !== "Y").length,
      overdue: grns.filter((g) => g.grnApprovedYN !== "Y" && new Date(g.grnDate) < sevenDaysAgo).length,
      hidden: grns.filter((g) => g.hideYN === "Y").length,
      totalValue: grns.reduce((sum, grn) => sum + (grn.netTot || grn.tot || 0), 0),
      avgValue: 0,
    };

    statistics.avgValue = statistics.total > 0 ? statistics.totalValue / statistics.total : 0;

    return statistics;
  }, []);

  // Basic CRUD Operations
  const refreshGrns = useCallback(async (): Promise<void> => {
    const now = Date.now();
    if (now - lastFetchTime.current < cacheTimeout && state.grns.length > 0) {
      return;
    }

    try {
      updateState({ loading: true, error: null });
      const result = await bGrnService.getAllGrnsWithDetails();

      if (result.success && result.data) {
        const grnsWithDetails: GRNWithAllDetailsDto[] = result.data.map((grn: any) => ({
          ...grn,
          grnDetails: grn.grnDetails ?? [],
        }));

        const statistics = calculateStatistics(grnsWithDetails);

        updateState({
          grns: grnsWithDetails,
          statistics,
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
  }, [state.grns.length, updateState, handleError, calculateStatistics]);

  const saveGrn = useCallback(
    async (grnData: GRNWithAllDetailsDto): Promise<void> => {
      try {
        updateState({ loading: true, error: null });

        // Client-side validation using helpers
        const validationResult = GRNHelpers.validateCompleteGRN(grnData);
        if (!validationResult.isValid) {
          throw new Error(`Validation failed: ${validationResult.errors.join(", ")}`);
        }

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
        const result = await bGrnService.getAllGrnsWithDetailsByID(grnId);
        updateState({ loading: false, error: null });
        if (result.success && result.data) {
          return {
            ...result.data,
            grnDetails: result.data.grnDetails ?? [],
          };
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

  // Approval Operations
  const approveGrn = useCallback(
    async (grnId: number): Promise<void> => {
      try {
        updateState({ loading: true, error: null });
        if (grnId <= 0) {
          throw new Error("Invalid GRN ID");
        }
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

  const bulkApproveGrns = useCallback(
    async (grnIds: number[]): Promise<void> => {
      try {
        updateState({ loading: true, error: null });
        if (!grnIds.length) {
          throw new Error("No GRNs selected for approval");
        }
        const result = await bGrnService.bulkApprove(grnIds);
        if (result.success) {
          updateState({ loading: false, error: null });
          showAlert("Success", `${grnIds.length} GRNs approved successfully`, "success");
          await refreshGrns();
        } else {
          throw new Error(result.errorMessage || "Failed to approve GRNs");
        }
      } catch (error) {
        handleError(error, "bulk approve GRNs");
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

  // Advanced Operations
  const hideGrn = useCallback(
    async (grnId: number): Promise<void> => {
      try {
        updateState({ loading: true, error: null });
        const result = await bGrnMastService.hideGrn(grnId);
        if (result.success) {
          updateState({ loading: false, error: null });
          showAlert("Success", "GRN hidden successfully", "success");
          await refreshGrns();
        } else {
          throw new Error(result.errorMessage || "Failed to hide GRN");
        }
      } catch (error) {
        handleError(error, "hide GRN");
        throw error;
      }
    },
    [updateState, handleError, showAlert, refreshGrns]
  );

  const unhideGrn = useCallback(
    async (grnId: number): Promise<void> => {
      try {
        updateState({ loading: true, error: null });
        const result = await bGrnMastService.unhideGrn(grnId);
        if (result.success) {
          updateState({ loading: false, error: null });
          showAlert("Success", "GRN unhidden successfully", "success");
          await refreshGrns();
        } else {
          throw new Error(result.errorMessage || "Failed to unhide GRN");
        }
      } catch (error) {
        handleError(error, "unhide GRN");
        throw error;
      }
    },
    [updateState, handleError, showAlert, refreshGrns]
  );

  const bulkHideGrns = useCallback(
    async (grnIds: number[]): Promise<void> => {
      try {
        updateState({ loading: true, error: null });
        const result = await bGrnService.bulkHide(grnIds);
        if (result.success) {
          updateState({ loading: false, error: null });
          showAlert("Success", `${grnIds.length} GRNs hidden successfully`, "success");
          await refreshGrns();
        } else {
          throw new Error(result.errorMessage || "Failed to hide GRNs");
        }
      } catch (error) {
        handleError(error, "bulk hide GRNs");
        throw error;
      }
    },
    [updateState, handleError, showAlert, refreshGrns]
  );

  const bulkDeleteGrns = useCallback(
    async (grnIds: number[]): Promise<void> => {
      try {
        updateState({ loading: true, error: null });
        const result = await bGrnService.bulkDelete(grnIds);
        if (result.success) {
          updateState({ loading: false, error: null });
          showAlert("Success", `${grnIds.length} GRNs deleted successfully`, "success");
          await refreshGrns();
        } else {
          throw new Error(result.errorMessage || "Failed to delete GRNs");
        }
      } catch (error) {
        handleError(error, "bulk delete GRNs");
        throw error;
      }
    },
    [updateState, handleError, showAlert, refreshGrns]
  );

  // Excel Operations
  // const uploadFromExcel = useCallback(
  //   async (file: File, departmentId: number): Promise<GRNExcelUploadResult | null> => {
  //     try {
  //       updateState({ loading: true, error: null });
  //       const result = await bGrnService.uploadFromExcel(file, departmentId);
  //       updateState({ loading: false, error: null });

  //       if (result.success && result.data) {
  //         showAlert("Success", `Excel uploaded successfully. ${result.data.validRows} out of ${result.data.totalRows} rows processed.`, "success");
  //         if (result.data.errors.length > 0) {
  //           console.warn("Excel upload errors:", result.data.errors);
  //         }
  //         await refreshGrns();
  //         return result.data;
  //       } else {
  //         throw new Error(result.errorMessage || "Failed to upload Excel file");
  //       }
  //     } catch (error) {
  //       handleError(error, "upload Excel file");
  //       return null;
  //     }
  //   },
  //   [updateState, handleError, showAlert, refreshGrns]
  // );

  const downloadExcelTemplate = useCallback(async (): Promise<void> => {
    try {
      const result = await bGrnService.downloadExcelTemplate();
      if (result.success && result.data) {
        // Create download link
        const blob = result.data as Blob;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "GRN_Template.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        showAlert("Success", "Excel template downloaded successfully", "success");
      } else {
        throw new Error(result.errorMessage || "Failed to download template");
      }
    } catch (error) {
      handleError(error, "download Excel template");
    }
  }, [handleError, showAlert]);

  const exportGrnToExcel = useCallback(
    async (grnId: number): Promise<void> => {
      try {
        const result = await bGrnService.exportGrnToExcel(grnId);
        if (result.success && result.data) {
          const blob = result.data as Blob;
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `GRN_${grnId}.xlsx`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          showAlert("Success", "GRN exported to Excel successfully", "success");
        } else {
          throw new Error(result.errorMessage || "Failed to export GRN");
        }
      } catch (error) {
        handleError(error, "export GRN to Excel");
      }
    },
    [handleError, showAlert]
  );

  const exportMultipleGrnsToExcel = useCallback(
    async (grnIds: number[]): Promise<void> => {
      try {
        const result = await bGrnService.exportMultipleGrnsToExcel(grnIds);
        if (result.success && result.data) {
          const blob = result.data as Blob;
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `GRNs_${new Date().toISOString().split("T")[0]}.xlsx`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          showAlert("Success", `${grnIds.length} GRNs exported to Excel successfully`, "success");
        } else {
          throw new Error(result.errorMessage || "Failed to export GRNs");
        }
      } catch (error) {
        handleError(error, "export GRNs to Excel");
      }
    },
    [handleError, showAlert]
  );

  // History Operations
  const getGrnHistory = useCallback(
    async (grnId: number): Promise<GRNHistoryDto[]> => {
      try {
        const result = await bGrnService.getGrnHistory(grnId);
        if (result.success && result.data) {
          return result.data;
        } else {
          throw new Error(result.errorMessage || "Failed to fetch GRN history");
        }
      } catch (error) {
        handleError(error, "fetch GRN history");
        return [];
      }
    },
    [handleError]
  );

  // Department Transfer
  const transferGrnToDepartment = useCallback(
    async (transferData: GRNDepartmentTransfer): Promise<void> => {
      try {
        updateState({ loading: true, error: null });
        const result = await bGrnService.transferGrnToDepartment(transferData);
        if (result.success) {
          updateState({ loading: false, error: null });
          showAlert("Success", "GRN transferred to department successfully", "success");
          await refreshGrns();
        } else {
          throw new Error(result.errorMessage || "Failed to transfer GRN");
        }
      } catch (error) {
        handleError(error, "transfer GRN to department");
        throw error;
      }
    },
    [updateState, handleError, showAlert, refreshGrns]
  );

  const createNewIssueDepartment = useCallback(
    async (grnId: number, departmentId: number, issueItems: number[]): Promise<void> => {
      try {
        updateState({ loading: true, error: null });
        const result = await bGrnService.createNewIssueDepartment(grnId, departmentId, issueItems);
        if (result.success) {
          updateState({ loading: false, error: null });
          showAlert("Success", "New issue department created successfully", "success");
          await refreshGrns();
        } else {
          throw new Error(result.errorMessage || "Failed to create issue department");
        }
      } catch (error) {
        handleError(error, "create issue department");
        throw error;
      }
    },
    [updateState, handleError, showAlert, refreshGrns]
  );

  // Quality Check
  const performQualityCheck = useCallback(
    async (qualityCheck: GRNQualityCheck): Promise<void> => {
      try {
        updateState({ loading: true, error: null });
        const result = await bGrnService.performQualityCheck(qualityCheck);
        if (result.success) {
          updateState({ loading: false, error: null });
          showAlert("Success", "Quality check completed successfully", "success");
          await refreshGrns();
        } else {
          throw new Error(result.errorMessage || "Failed to perform quality check");
        }
      } catch (error) {
        handleError(error, "perform quality check");
        throw error;
      }
    },
    [updateState, handleError, showAlert, refreshGrns]
  );

  const getQualityCheckHistory = useCallback(
    async (grnId: number): Promise<GRNQualityCheck[]> => {
      try {
        const result = await bGrnService.getQualityCheckHistory(grnId);
        if (result.success && result.data) {
          return result.data;
        } else {
          throw new Error(result.errorMessage || "Failed to fetch quality check history");
        }
      } catch (error) {
        handleError(error, "fetch quality check history");
        return [];
      }
    },
    [handleError]
  );

  // Reporting
  const getGrnSummaryReport = useCallback(
    async (dateFrom: string, dateTo: string, departmentId?: number): Promise<any> => {
      try {
        const result = await bGrnService.getGrnSummaryReport(dateFrom, dateTo, departmentId);
        if (result.success && result.data) {
          return result.data;
        } else {
          throw new Error(result.errorMessage || "Failed to fetch summary report");
        }
      } catch (error) {
        handleError(error, "fetch summary report");
        return null;
      }
    },
    [handleError]
  );

  const getSupplierWiseReport = useCallback(
    async (dateFrom: string, dateTo: string): Promise<any> => {
      try {
        const result = await bGrnService.getSupplierWiseReport(dateFrom, dateTo);
        if (result.success && result.data) {
          return result.data;
        } else {
          throw new Error(result.errorMessage || "Failed to fetch supplier-wise report");
        }
      } catch (error) {
        handleError(error, "fetch supplier-wise report");
        return null;
      }
    },
    [handleError]
  );

  const getDepartmentWiseReport = useCallback(
    async (dateFrom: string, dateTo: string): Promise<any> => {
      try {
        const result = await bGrnService.getDepartmentWiseReport(dateFrom, dateTo);
        if (result.success && result.data) {
          return result.data;
        } else {
          throw new Error(result.errorMessage || "Failed to fetch department-wise report");
        }
      } catch (error) {
        handleError(error, "fetch department-wise report");
        return null;
      }
    },
    [handleError]
  );

  const getProductWiseReport = useCallback(
    async (dateFrom: string, dateTo: string, productId?: number): Promise<any> => {
      try {
        const result = await bGrnService.getProductWiseReport(dateFrom, dateTo, productId);
        if (result.success && result.data) {
          return result.data;
        } else {
          throw new Error(result.errorMessage || "Failed to fetch product-wise report");
        }
      } catch (error) {
        handleError(error, "fetch product-wise report");
        return null;
      }
    },
    [handleError]
  );

  // Dashboard
  const getDashboardData = useCallback(
    async (dateFrom: string, dateTo: string): Promise<any> => {
      try {
        const result = await bGrnService.getDashboardData(dateFrom, dateTo);
        if (result.success && result.data) {
          return result.data;
        } else {
          throw new Error(result.errorMessage || "Failed to fetch dashboard data");
        }
      } catch (error) {
        handleError(error, "fetch dashboard data");
        return null;
      }
    },
    [handleError]
  );

  const getRecentActivity = useCallback(
    async (limit: number = 10): Promise<any[]> => {
      try {
        const result = await bGrnService.getRecentActivity(limit);
        if (result.success && result.data) {
          return result.data;
        } else {
          throw new Error(result.errorMessage || "Failed to fetch recent activity");
        }
      } catch (error) {
        handleError(error, "fetch recent activity");
        return [];
      }
    },
    [handleError]
  );

  // Utility
  const validateGrn = useCallback(
    async (grnData: GRNWithAllDetailsDto): Promise<boolean> => {
      try {
        const result = await bGrnService.validateGrn(grnData);
        if (result.success && result.data) {
          return result.data;
        } else {
          throw new Error(result.errorMessage || "Failed to validate GRN");
        }
      } catch (error) {
        handleError(error, "validate GRN");
        return false;
      }
    },
    [handleError]
  );

  const recalculateGrnTotals = useCallback(
    async (grnId: number): Promise<void> => {
      try {
        updateState({ loading: true, error: null });
        const result = await bGrnService.recalculateGrnTotals(grnId);
        if (result.success) {
          updateState({ loading: false, error: null });
          showAlert("Success", "GRN totals recalculated successfully", "success");
          await refreshGrns();
        } else {
          throw new Error(result.errorMessage || "Failed to recalculate totals");
        }
      } catch (error) {
        handleError(error, "recalculate GRN totals");
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
      statistics: {
        total: 0,
        approved: 0,
        pending: 0,
        overdue: 0,
        hidden: 0,
        totalValue: 0,
        avgValue: 0,
      },
    });
    lastFetchTime.current = 0;
  }, []);

  return {
    ...state,
    // Basic CRUD
    refreshGrns,
    saveGrn,
    deleteGrn,
    generateGrnCode,
    getGrnById,
    // Approval
    approveGrn,
    bulkApproveGrns,
    updateProductStock,
    // Advanced
    hideGrn,
    unhideGrn,
    bulkHideGrns,
    bulkDeleteGrns,
    // Excel
    // uploadFromExcel,
    downloadExcelTemplate,
    exportGrnToExcel,
    exportMultipleGrnsToExcel,
    // History
    getGrnHistory,
    // Transfer
    transferGrnToDepartment,
    createNewIssueDepartment,
    // Quality
    performQualityCheck,
    getQualityCheckHistory,
    // Reports
    getGrnSummaryReport,
    getSupplierWiseReport,
    getDepartmentWiseReport,
    getProductWiseReport,
    // Dashboard
    getDashboardData,
    getRecentActivity,
    // Utility
    validateGrn,
    recalculateGrnTotals,
    clearState,
  };
};

// Enhanced Search Hook
export const useEnhancedGRNSearch = () => {
  const { isLoading, setLoading } = useLoading();
  const [error, setError] = useState<string | null>(null);
  const { showAlert } = useAlert();

  const searchGrns = useCallback(
    async (searchTerm: string): Promise<GRNWithAllDetailsDto[]> => {
      try {
        setLoading(true);
        setError(null);
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
                grn.grnStatus?.toLowerCase().includes(searchLower) ||
                grn.dcNo?.toLowerCase().includes(searchLower) ||
                grn.poNo?.toLowerCase().includes(searchLower)
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

  const advancedSearch = useCallback(
    async (searchRequest: GRNSearchRequest): Promise<GRNWithAllDetailsDto[]> => {
      try {
        setLoading(true);
        setError(null);
        const result = await bGrnService.searchGrns(searchRequest);
        setLoading(false);
        if (result.success && result.data) {
          return result.data.map((grn: any) => ({
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
    async (grnCode: string, excludeGrnId?: number): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);
        const result = await bGrnService.getAllGrnsWithDetails();
        setLoading(false);
        if (result.success && result.data) {
          const existingGrn = result.data.find((grn) => grn.grnCode?.toLowerCase() === grnCode.toLowerCase() && grn.grnID !== excludeGrnId);
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

  const validateDuplicateInvoice = useCallback(
    async (invoiceNo: string, supplierId: number, excludeGrnId?: number): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);
        const result = await bGrnService.validateDuplicateInvoice(invoiceNo, supplierId, excludeGrnId);
        setLoading(false);
        if (result.success) {
          return result.data as boolean;
        } else {
          throw new Error(result.errorMessage || "Failed to validate invoice");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to validate invoice";
        setError(errorMessage);
        setLoading(false);
        showAlert("Error", errorMessage, "error");
        return false;
      }
    },
    [showAlert, setLoading]
  );

  return {
    searchGrns,
    advancedSearch,
    validateGrnCode,
    validateDuplicateInvoice,
    isLoading,
    error,
  };
};

export default useEnhancedGRN;
