import { useLoading } from "@/hooks/Common/useLoading";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { PaginatedList } from "@/interfaces/Common/PaginatedList";
import { IssualType, ProductIssualCompositeDto, ProductIssualDto, ProductIssualSearchRequest, ProductStockBalance } from "@/interfaces/InventoryManagement/ProductIssualDto";
import { useAlert } from "@/providers/AlertProvider";
import { productIssualService } from "@/services/InventoryManagementService/ProductIssualService/ProductIssualService";
import { useCallback, useState } from "react";

const defaultPaginatedList: PaginatedList<ProductIssualDto> = {
  items: [],
  pageIndex: 1,
  totalPages: 1,
  totalCount: 0,
};

export interface ProductIssualHookReturn {
  paginatedIssuals: PaginatedList<ProductIssualDto>;
  isLoading: boolean;
  error: string | null;

  genericIssualSearch: (searchRequest: ProductIssualSearchRequest) => Promise<PaginatedList<ProductIssualDto>>;
  departmentIssualSearch: (searchRequest: ProductIssualSearchRequest) => Promise<PaginatedList<ProductIssualDto>>;
  physicianIssualSearch: (searchRequest: ProductIssualSearchRequest) => Promise<PaginatedList<ProductIssualDto>>;
  getIssualWithDetailsById: (issualId: number) => Promise<ProductIssualCompositeDto | null>;
  saveIssualWithDetails: (issualData: ProductIssualCompositeDto) => Promise<OperationResult<ProductIssualCompositeDto>>;
  saveDepartmentIssual: (issualData: ProductIssualCompositeDto) => Promise<OperationResult<ProductIssualCompositeDto>>;
  savePhysicianIssual: (issualData: ProductIssualCompositeDto) => Promise<OperationResult<ProductIssualCompositeDto>>;
  deleteIssual: (issualId: number) => Promise<boolean>;
  approveIssual: (issualId: number) => Promise<boolean>;
  genericGenerateIssualCode: (fromDepartmentId: number, issualType: IssualType) => Promise<string | null>;
  generateDepartmentIssualCode: (fromDepartmentId: number) => Promise<string | null>;
  generatePhysicianIssualCode: (fromDepartmentId: number) => Promise<string | null>;
  getAvailableStock: (departmentId: number, productId?: number) => Promise<ProductStockBalance[]>;
  validateStockAvailability: (departmentId: number, productId: number, requiredQty: number, batchNo?: string) => Promise<boolean>;
  getIssualSummary: (startDate?: Date, endDate?: Date) => Promise<any>;
  getIssualTypes: () => Promise<any[]>;
  getPendingIssuals: (issualType?: IssualType, pageIndex?: number, pageSize?: number) => Promise<PaginatedList<ProductIssualDto>>;
  getApprovedIssuals: (issualType?: IssualType, pageIndex?: number, pageSize?: number) => Promise<PaginatedList<ProductIssualDto>>;
  canEditIssual: (issual: ProductIssualDto) => boolean;
  canApproveIssual: (issual: ProductIssualDto) => boolean;
  canDeleteIssual: (issual: ProductIssualDto) => boolean;
  clearError: () => void;
  refreshCurrentPage: () => Promise<void>;
}

export const useProductIssual = (): ProductIssualHookReturn => {
  const { setLoading } = useLoading();
  const { showAlert } = useAlert();
  const [paginatedIssuals, setPaginatedIssuals] = useState<PaginatedList<ProductIssualDto>>(defaultPaginatedList);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchRequest, setLastSearchRequest] = useState<ProductIssualSearchRequest | null>(null);

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

  const genericIssualSearch = useCallback(async (searchRequest: ProductIssualSearchRequest): Promise<PaginatedList<ProductIssualDto>> => {
    setLastSearchRequest(searchRequest);
    const response = await handleApiCall(() => productIssualService.issualSearch(searchRequest));
    if (response.success && response.data) {
      setPaginatedIssuals(response.data);
      return response.data;
    }
    setPaginatedIssuals(defaultPaginatedList);
    return defaultPaginatedList;
  }, []);

  const departmentIssualSearch = useCallback(
    async (searchRequest: ProductIssualSearchRequest): Promise<PaginatedList<ProductIssualDto>> => {
      debugger;
      searchRequest.issualType = IssualType.Department;
      return genericIssualSearch(searchRequest);
    },
    [genericIssualSearch]
  );

  const physicianIssualSearch = useCallback(
    async (searchRequest: ProductIssualSearchRequest): Promise<PaginatedList<ProductIssualDto>> => {
      searchRequest.issualType = IssualType.Physician;
      return genericIssualSearch(searchRequest);
    },
    [genericIssualSearch]
  );

  const refreshCurrentPage = useCallback(async () => {
    if (lastSearchRequest) {
      await genericIssualSearch(lastSearchRequest);
    }
  }, [lastSearchRequest, genericIssualSearch]);

  const getIssualWithDetailsById = useCallback(async (issualId: number): Promise<ProductIssualCompositeDto | null> => {
    if (!issualId || issualId <= 0) {
      showAlert("Error", "A valid issual ID is required.", "error");
      return null;
    }
    const response = await handleApiCall(() => productIssualService.getIssualWithDetailsById(issualId));
    return response.data ?? null;
  }, []);

  const saveDepartmentIssual = useCallback(async (issualData: ProductIssualCompositeDto): Promise<OperationResult<ProductIssualCompositeDto>> => {
    const isEdit = issualData.productIssual.pisid > 0;
    return handleApiCall(() => productIssualService.createDepartmentIssual(issualData), `Department Issual ${isEdit ? "updated" : "created"} successfully!`, true);
  }, []);

  const savePhysicianIssual = useCallback(async (issualData: ProductIssualCompositeDto): Promise<OperationResult<ProductIssualCompositeDto>> => {
    const isEdit = issualData.productIssual.pisid > 0;
    return handleApiCall(() => productIssualService.createPhysicianIssual(issualData), `Physician Issual ${isEdit ? "updated" : "created"} successfully!`, true);
  }, []);

  const saveIssualWithDetails = useCallback(
    async (issualData: ProductIssualCompositeDto): Promise<OperationResult<ProductIssualCompositeDto>> => {
      if (issualData.productIssual.issualType === IssualType.Physician) {
        return savePhysicianIssual(issualData);
      }
      return saveDepartmentIssual(issualData);
    },
    [saveDepartmentIssual, savePhysicianIssual]
  );

  const deleteIssual = useCallback(async (issualId: number): Promise<boolean> => {
    const response = await handleApiCall(() => productIssualService.deleteIssual(issualId), "Issual deleted successfully", true);
    return response.success;
  }, []);

  const approveIssual = useCallback(async (issualId: number): Promise<boolean> => {
    const response = await handleApiCall(() => productIssualService.approveIssual(issualId), "Issual approved successfully", true);
    return response.success;
  }, []);

  const genericGenerateIssualCode = useCallback(async (fromDepartmentId: number, issualType: IssualType): Promise<string | null> => {
    const response = await handleApiCall(() => productIssualService.generateIssualCode(fromDepartmentId, issualType));
    return response.data ?? null;
  }, []);

  const generateDepartmentIssualCode = useCallback((fromDepartmentId: number) => genericGenerateIssualCode(fromDepartmentId, IssualType.Department), [genericGenerateIssualCode]);
  const generatePhysicianIssualCode = useCallback((fromDepartmentId: number) => genericGenerateIssualCode(fromDepartmentId, IssualType.Physician), [genericGenerateIssualCode]);

  const getAvailableStock = useCallback(async (departmentId: number, productId?: number): Promise<ProductStockBalance[]> => {
    const response = await handleApiCall(() => productIssualService.getAvailableStock(departmentId, productId));
    return response.data ?? [];
  }, []);

  const validateStockAvailability = useCallback(
    async (departmentId: number, productId: number, requiredQty: number, batchNo?: string): Promise<boolean> => {
      const stockResult = await getAvailableStock(departmentId, productId);
      const stockItem = stockResult.find((s) => !batchNo || s.batchNumber === batchNo);
      if (!stockItem) {
        showAlert("Validation Error", "Product not found in stock for the specified batch.", "warning");
        return false;
      }
      const availableQty = stockItem.productUnitQuantityOnHand ?? 0;
      if (availableQty < requiredQty) {
        showAlert("Validation Error", `Insufficient stock. Available: ${availableQty}, Required: ${requiredQty}`, "warning");
        return false;
      }
      return true;
    },
    [getAvailableStock, showAlert]
  );

  const getIssualSummary = useCallback(async (startDate?: Date, endDate?: Date) => {
    const response = await handleApiCall(() => productIssualService.getIssualSummaryByType(startDate, endDate));
    return response.data ?? null;
  }, []);

  const getIssualTypes = useCallback(async () => {
    const response = await handleApiCall(() => productIssualService.getIssualTypes());
    return response.data ?? [];
  }, []);

  const getIssualsByStatus = useCallback(
    async (isApproved: boolean, issualType?: IssualType, pageIndex = 1, pageSize = 20): Promise<PaginatedList<ProductIssualDto>> => {
      const searchRequest: ProductIssualSearchRequest = {
        pageIndex,
        pageSize,
        issualType,
        approvedStatus: isApproved ? "Y" : "N",
      };
      return genericIssualSearch(searchRequest);
    },
    [genericIssualSearch]
  );

  const getPendingIssuals = useCallback(
    (issualType?: IssualType, pageIndex = 1, pageSize = 20) => getIssualsByStatus(false, issualType, pageIndex, pageSize),
    [getIssualsByStatus]
  );

  const getApprovedIssuals = useCallback(
    (issualType?: IssualType, pageIndex = 1, pageSize = 20) => getIssualsByStatus(true, issualType, pageIndex, pageSize),
    [getIssualsByStatus]
  );

  const canEditIssual = (issual: ProductIssualDto) => issual?.approvedYN !== "Y";
  const canApproveIssual = (issual: ProductIssualDto) => issual?.approvedYN !== "Y";
  const canDeleteIssual = (issual: ProductIssualDto) => issual?.approvedYN !== "Y";

  return {
    paginatedIssuals,
    isLoading,
    error,
    clearError,
    refreshCurrentPage,
    genericIssualSearch,
    departmentIssualSearch,
    physicianIssualSearch,
    getIssualWithDetailsById,
    saveIssualWithDetails,
    saveDepartmentIssual,
    savePhysicianIssual,
    deleteIssual,
    approveIssual,
    genericGenerateIssualCode,
    generateDepartmentIssualCode,
    generatePhysicianIssualCode,
    getAvailableStock,
    validateStockAvailability,
    getIssualSummary,
    getIssualTypes,
    getPendingIssuals,
    getApprovedIssuals,
    canEditIssual,
    canApproveIssual,
    canDeleteIssual,
  };
};
