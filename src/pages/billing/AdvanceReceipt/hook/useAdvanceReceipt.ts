import { useLoading } from "@/hooks/Common/useLoading";
import { AdvanceReceiptDto, AdvanceReceiptStatus, BReceiptMastDto, PatientAdvanceSummaryDto } from "@/interfaces/Billing/AdvanceReceiptDto";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { PaginatedList } from "@/interfaces/Common/PaginatedList";
import { useAlert } from "@/providers/AlertProvider";
import { AdvanceReceiptSearchRequest, advanceReceiptService } from "@/services/BillingServices/AdvanceReceiptService";
import { useCallback, useState } from "react";

const defaultPaginatedList: PaginatedList<AdvanceReceiptDto> = {
  items: [],
  pageIndex: 1,
  totalPages: 1,
  totalCount: 0,
};

export interface AdvanceReceiptHookReturn {
  paginatedReceipts: PaginatedList<AdvanceReceiptDto>;
  isLoading: boolean;
  error: string | null;

  searchAdvanceReceipts: (searchRequest: AdvanceReceiptSearchRequest) => Promise<PaginatedList<AdvanceReceiptDto>>;
  getAdvanceReceiptById: (receiptId: number) => Promise<AdvanceReceiptDto | null>;
  getAdvanceReceiptsByPatientId: (patientId: number) => Promise<AdvanceReceiptDto[]>;
  saveAdvanceReceipt: (advanceReceiptDto: AdvanceReceiptDto) => Promise<OperationResult<AdvanceReceiptDto>>;
  updateAdvanceReceipt: (receiptId: number, advanceReceiptDto: AdvanceReceiptDto) => Promise<OperationResult<AdvanceReceiptDto>>;
  updateAdvanceReceiptStatus: (receiptId: number, status: AdvanceReceiptStatus) => Promise<boolean>;
  cancelAdvanceReceipt: (receiptId: number) => Promise<boolean>;
  adjustAdvanceAgainstBill: (receiptId: number, billId: number, adjustmentAmount: number) => Promise<boolean>;
  getPatientAdvanceSummary: (patientId: number) => Promise<PatientAdvanceSummaryDto | null>;
  getPatientAdvanceBalance: (patientId: number) => Promise<number>;
  getActiveAdvanceReceipts: (patientId: number) => Promise<AdvanceReceiptDto[]>;
  generateAdvanceReceiptCode: () => Promise<string | null>;
  validateAdvanceReceipt: (receiptDto: AdvanceReceiptDto) => Promise<boolean>;
  getAdvanceReceiptSummary: (startDate?: Date, endDate?: Date) => Promise<any>;
  getReceiptsWithFilters: (filters: Partial<AdvanceReceiptSearchRequest>) => Promise<PaginatedList<AdvanceReceiptDto>>;
  getActiveReceipts: (pageIndex?: number, pageSize?: number) => Promise<PaginatedList<AdvanceReceiptDto>>;
  getAdjustedReceipts: (pageIndex?: number, pageSize?: number) => Promise<PaginatedList<AdvanceReceiptDto>>;
  getCancelledReceipts: (pageIndex?: number, pageSize?: number) => Promise<PaginatedList<AdvanceReceiptDto>>;
  canEditReceipt: (receipt: AdvanceReceiptDto) => boolean;
  canCancelReceipt: (receipt: AdvanceReceiptDto) => boolean;
  canAdjustReceipt: (receipt: AdvanceReceiptDto) => boolean;
  validateReceiptAdjustment: (receiptId: number, adjustmentAmount: number) => Promise<boolean>;
  clearError: () => void;
  refreshCurrentPage: () => Promise<void>;
}

export const useAdvanceReceipt = (): AdvanceReceiptHookReturn => {
  const { setLoading } = useLoading();
  const { showAlert } = useAlert();
  const [paginatedReceipts, setPaginatedReceipts] = useState<PaginatedList<AdvanceReceiptDto>>(defaultPaginatedList);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchRequest, setLastSearchRequest] = useState<AdvanceReceiptSearchRequest | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleApiCall = async <T>(apiCall: () => Promise<OperationResult<T>>, successMessage?: string, refresh = false): Promise<OperationResult<T>> => {
    try {
      setLoading(true);
      setIsLoading(true);
      clearError();
      const response = await apiCall();
      if (response.success) {
        if (successMessage) {
          showAlert("Success", successMessage, "success");
        }
        if (refresh) {
          await refreshCurrentPage();
        }
        return response;
      } else {
        throw new Error(response.errorMessage || "An unexpected error occurred");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      showAlert("Error", errorMessage, "error");
      return { success: false, errorMessage };
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  const searchAdvanceReceipts = useCallback(async (searchRequest: AdvanceReceiptSearchRequest): Promise<PaginatedList<AdvanceReceiptDto>> => {
    setLastSearchRequest(searchRequest);
    const response = await handleApiCall(() => advanceReceiptService.searchAdvanceReceipts(searchRequest));
    if (response.success && response.data) {
      setPaginatedReceipts(response.data);
      return response.data;
    }
    setPaginatedReceipts(defaultPaginatedList);
    return defaultPaginatedList;
  }, []);

  const refreshCurrentPage = useCallback(async () => {
    if (lastSearchRequest) {
      await searchAdvanceReceipts(lastSearchRequest);
    }
  }, [lastSearchRequest, searchAdvanceReceipts]);

  const getAdvanceReceiptById = useCallback(async (receiptId: number): Promise<AdvanceReceiptDto | null> => {
    if (!receiptId || receiptId <= 0) {
      showAlert("Error", "A valid receipt ID is required.", "error");
      return null;
    }
    const response = await handleApiCall(() => advanceReceiptService.getAdvanceReceiptById(receiptId));
    return response.data ?? null;
  }, []);

  const getAdvanceReceiptsByPatientId = useCallback(async (patientId: number): Promise<AdvanceReceiptDto[]> => {
    if (!patientId || patientId <= 0) {
      showAlert("Error", "A valid patient ID is required.", "error");
      return [];
    }
    const response = await handleApiCall(() => advanceReceiptService.getAdvanceReceiptsByPatientId(patientId));
    return response.data ?? [];
  }, []);

  const saveAdvanceReceipt = useCallback(async (advanceReceiptDto: AdvanceReceiptDto): Promise<OperationResult<AdvanceReceiptDto>> => {
    const validationErrors = advanceReceiptService.validateAdvanceReceiptData(advanceReceiptDto);
    if (validationErrors.length > 0) {
      const errorMessage = validationErrors.join(", ");
      showAlert("Validation Error", errorMessage, "warning");
      return { success: false, errorMessage };
    }

    return handleApiCall(() => advanceReceiptService.saveAdvanceReceipt(advanceReceiptDto), "Advance receipt created successfully!", true);
  }, []);

  const updateAdvanceReceipt = useCallback(async (receiptId: number, advanceReceiptDto: AdvanceReceiptDto): Promise<OperationResult<AdvanceReceiptDto>> => {
    const validationErrors = advanceReceiptService.validateAdvanceReceiptData(advanceReceiptDto);
    if (validationErrors.length > 0) {
      const errorMessage = validationErrors.join(", ");
      showAlert("Validation Error", errorMessage, "warning");
      return { success: false, errorMessage };
    }

    // Ensure the IDs are set correctly for update
    advanceReceiptDto.receiptMaster.docID = receiptId;
    advanceReceiptDto.receiptDetail.docID = receiptId;

    return handleApiCall(() => advanceReceiptService.saveAdvanceReceipt(advanceReceiptDto), "Advance receipt updated successfully!", true);
  }, []);

  const updateAdvanceReceiptStatus = useCallback(async (receiptId: number, status: AdvanceReceiptStatus): Promise<boolean> => {
    const response = await handleApiCall(() => advanceReceiptService.updateAdvanceReceiptStatus(receiptId, status), `Receipt status updated to ${status}`, true);
    return response.success;
  }, []);

  const cancelAdvanceReceipt = useCallback(async (receiptId: number): Promise<boolean> => {
    const response = await handleApiCall(() => advanceReceiptService.cancelAdvanceReceipt(receiptId), "Advance receipt cancelled successfully", true);
    return response.success;
  }, []);

  const adjustAdvanceAgainstBill = useCallback(async (receiptId: number, billId: number, adjustmentAmount: number): Promise<boolean> => {
    if (adjustmentAmount <= 0) {
      showAlert("Validation Error", "Adjustment amount must be greater than zero.", "warning");
      return false;
    }

    const response = await handleApiCall(
      () => advanceReceiptService.adjustAdvanceAgainstBill(receiptId, billId, adjustmentAmount),
      "Advance adjusted against bill successfully",
      true
    );
    return response.success;
  }, []);

  const getPatientAdvanceSummary = useCallback(async (patientId: number): Promise<PatientAdvanceSummaryDto | null> => {
    if (!patientId || patientId <= 0) {
      showAlert("Error", "A valid patient ID is required.", "error");
      return null;
    }
    const response = await handleApiCall(() => advanceReceiptService.getPatientAdvanceSummary(patientId));
    return response.data ?? null;
  }, []);

  const getPatientAdvanceBalance = useCallback(async (patientId: number): Promise<number> => {
    if (!patientId || patientId <= 0) {
      showAlert("Error", "A valid patient ID is required.", "error");
      return 0;
    }
    const response = await handleApiCall(() => advanceReceiptService.getPatientAdvanceBalance(patientId));
    return response.data ?? 0;
  }, []);

  const getActiveAdvanceReceipts = useCallback(async (patientId: number): Promise<AdvanceReceiptDto[]> => {
    if (!patientId || patientId <= 0) {
      showAlert("Error", "A valid patient ID is required.", "error");
      return [];
    }
    const response = await handleApiCall(() => advanceReceiptService.getActiveAdvanceReceipts(patientId));
    return response.data ?? [];
  }, []);

  const generateAdvanceReceiptCode = useCallback(async (receiptMaster?: Partial<BReceiptMastDto>): Promise<string | null> => {
    const response = await handleApiCall(() => advanceReceiptService.generateAdvanceReceiptCode(receiptMaster));
    return response.data ?? null;
  }, []);

  const validateAdvanceReceipt = useCallback(async (receiptDto: AdvanceReceiptDto): Promise<boolean> => {
    const response = await handleApiCall(() => advanceReceiptService.validateAdvanceReceipt(receiptDto));
    return response.success && (response.data ?? false);
  }, []);

  const getAdvanceReceiptSummary = useCallback(async (startDate?: Date, endDate?: Date) => {
    const response = await handleApiCall(() => advanceReceiptService.getAdvanceReceiptSummary(startDate, endDate));
    return response.data ?? null;
  }, []);

  const getReceiptsWithFilters = useCallback(
    async (filters: Partial<AdvanceReceiptSearchRequest>): Promise<PaginatedList<AdvanceReceiptDto>> => {
      const searchRequest: AdvanceReceiptSearchRequest = {
        pageNumber: 1,
        pageSize: 25,
        ...filters,
      };
      return searchAdvanceReceipts(searchRequest);
    },
    [searchAdvanceReceipts]
  );

  const getReceiptsByStatus = useCallback(
    async (status: AdvanceReceiptStatus, pageIndex = 1, pageSize = 25): Promise<PaginatedList<AdvanceReceiptDto>> => {
      const searchRequest: AdvanceReceiptSearchRequest = {
        pageNumber: pageIndex,
        pageSize,
        status,
      };
      return searchAdvanceReceipts(searchRequest);
    },
    [searchAdvanceReceipts]
  );

  const getActiveReceipts = useCallback((pageIndex = 1, pageSize = 25) => getReceiptsByStatus(AdvanceReceiptStatus.ACTIVE, pageIndex, pageSize), [getReceiptsByStatus]);

  const getAdjustedReceipts = useCallback((pageIndex = 1, pageSize = 25) => getReceiptsByStatus(AdvanceReceiptStatus.ADJUSTED, pageIndex, pageSize), [getReceiptsByStatus]);

  const getCancelledReceipts = useCallback((pageIndex = 1, pageSize = 25) => getReceiptsByStatus(AdvanceReceiptStatus.CANCELLED, pageIndex, pageSize), [getReceiptsByStatus]);

  const validateReceiptAdjustment = useCallback(
    async (receiptId: number, adjustmentAmount: number): Promise<boolean> => {
      const receipt = await getAdvanceReceiptById(receiptId);
      if (!receipt) {
        showAlert("Validation Error", "Receipt not found.", "error");
        return false;
      }

      const originalAmount = receipt.receiptDetail.docAmount ?? 0;
      const currentAdjusted = receipt.receiptDetail.docAdjAmount ?? 0;
      const availableBalance = originalAmount - currentAdjusted;

      if (adjustmentAmount > availableBalance) {
        showAlert("Validation Error", `Adjustment amount (₹${adjustmentAmount.toLocaleString()}) exceeds available balance (₹${availableBalance.toLocaleString()}).`, "warning");
        return false;
      }

      if (receipt.receiptDetail.docStatus !== AdvanceReceiptStatus.ACTIVE) {
        showAlert("Validation Error", "Only active receipts can be adjusted.", "warning");
        return false;
      }

      return true;
    },
    [getAdvanceReceiptById, showAlert]
  );

  const canEditReceipt = (receipt: AdvanceReceiptDto): boolean => {
    return receipt?.receiptDetail?.docStatus === AdvanceReceiptStatus.ACTIVE;
  };

  const canCancelReceipt = (receipt: AdvanceReceiptDto): boolean => {
    return receipt?.receiptDetail?.docStatus === AdvanceReceiptStatus.ACTIVE;
  };

  const canAdjustReceipt = (receipt: AdvanceReceiptDto): boolean => {
    if (receipt?.receiptDetail?.docStatus !== AdvanceReceiptStatus.ACTIVE) {
      return false;
    }
    const originalAmount = receipt.receiptDetail.docAmount ?? 0;
    const adjustedAmount = receipt.receiptDetail.docAdjAmount ?? 0;
    return originalAmount > adjustedAmount;
  };

  return {
    paginatedReceipts,
    isLoading,
    error,
    clearError,
    refreshCurrentPage,
    searchAdvanceReceipts,
    getAdvanceReceiptById,
    getAdvanceReceiptsByPatientId,
    saveAdvanceReceipt,
    updateAdvanceReceipt,
    updateAdvanceReceiptStatus,
    cancelAdvanceReceipt,
    adjustAdvanceAgainstBill,
    getPatientAdvanceSummary,
    getPatientAdvanceBalance,
    getActiveAdvanceReceipts,
    generateAdvanceReceiptCode,
    validateAdvanceReceipt,
    getAdvanceReceiptSummary,
    getReceiptsWithFilters,
    getActiveReceipts,
    getAdjustedReceipts,
    getCancelledReceipts,
    canEditReceipt,
    canCancelReceipt,
    canAdjustReceipt,
    validateReceiptAdjustment,
  };
};
