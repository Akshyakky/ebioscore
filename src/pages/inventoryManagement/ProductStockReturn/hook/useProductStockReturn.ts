import { useLoading } from "@/hooks/Common/useLoading";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { PaginatedList } from "@/interfaces/Common/PaginatedList";
import {
  ProductStockBalance,
  ProductStockReturnCompositeDto,
  ProductStockReturnDto,
  ProductStockReturnSearchRequest,
  ReturnType,
  ValidateReturnStockRequest,
} from "@/interfaces/InventoryManagement/ProductStockReturnDto";
import { useAlert } from "@/providers/AlertProvider";
import { productStockReturnService } from "@/services/InventoryManagementService/ProductStockReturnService/ProductStockReturnService";
import { useCallback, useState } from "react";

const defaultPaginatedList: PaginatedList<ProductStockReturnDto> = {
  items: [],
  pageIndex: 1,
  totalPages: 1,
  totalCount: 0,
};

export interface ProductStockReturnHookReturn {
  paginatedReturns: PaginatedList<ProductStockReturnDto>;
  isLoading: boolean;
  error: string | null;

  genericReturnSearch: (searchRequest: ProductStockReturnSearchRequest) => Promise<PaginatedList<ProductStockReturnDto>>;
  supplierReturnSearch: (searchRequest: ProductStockReturnSearchRequest) => Promise<PaginatedList<ProductStockReturnDto>>;
  internalReturnSearch: (searchRequest: ProductStockReturnSearchRequest) => Promise<PaginatedList<ProductStockReturnDto>>;
  expiredReturnSearch: (searchRequest: ProductStockReturnSearchRequest) => Promise<PaginatedList<ProductStockReturnDto>>;
  damagedReturnSearch: (searchRequest: ProductStockReturnSearchRequest) => Promise<PaginatedList<ProductStockReturnDto>>;

  getReturnWithDetailsById: (returnId: number) => Promise<ProductStockReturnCompositeDto | null>;
  saveReturnWithDetails: (returnData: ProductStockReturnCompositeDto) => Promise<OperationResult<ProductStockReturnCompositeDto>>;
  saveSupplierReturn: (returnData: ProductStockReturnCompositeDto) => Promise<OperationResult<ProductStockReturnCompositeDto>>;
  saveInternalReturn: (returnData: ProductStockReturnCompositeDto) => Promise<OperationResult<ProductStockReturnCompositeDto>>;
  saveExpiredReturn: (returnData: ProductStockReturnCompositeDto) => Promise<OperationResult<ProductStockReturnCompositeDto>>;
  saveDamagedReturn: (returnData: ProductStockReturnCompositeDto) => Promise<OperationResult<ProductStockReturnCompositeDto>>;

  deleteReturn: (returnId: number) => Promise<boolean>;
  approveReturn: (returnId: number) => Promise<boolean>;

  generateReturnCode: (departmentId: number, returnType: string) => Promise<string | null>;
  generateSupplierReturnCode: (departmentId: number) => Promise<string | null>;
  generateInternalReturnCode: (departmentId: number) => Promise<string | null>;
  generateExpiredReturnCode: (departmentId: number) => Promise<string | null>;
  generateDamagedReturnCode: (departmentId: number) => Promise<string | null>;

  getAvailableStockForReturn: (departmentId: number, productId?: number) => Promise<ProductStockBalance[]>;
  validateStockAvailability: (request: ValidateReturnStockRequest) => Promise<boolean>;

  getReturnSummary: (startDate?: Date, endDate?: Date, departmentId?: number, returnType?: string) => Promise<any>;
  getReturnTypes: () => Promise<any[]>;
  getReturnsByDateRange: (startDate: Date, endDate: Date, departmentId?: number, returnType?: string) => Promise<ProductStockReturnDto[]>;

  getPendingReturns: (returnType?: string, pageIndex?: number, pageSize?: number) => Promise<PaginatedList<ProductStockReturnDto>>;
  getApprovedReturns: (returnType?: string, pageIndex?: number, pageSize?: number) => Promise<PaginatedList<ProductStockReturnDto>>;

  canEditReturn: (stockReturn: ProductStockReturnDto) => boolean;
  canApproveReturn: (stockReturn: ProductStockReturnDto) => boolean;
  canDeleteReturn: (stockReturn: ProductStockReturnDto) => boolean;

  clearError: () => void;
  refreshCurrentPage: () => Promise<void>;
}

export const useProductStockReturn = (): ProductStockReturnHookReturn => {
  const { setLoading } = useLoading();
  const { showAlert } = useAlert();
  const [paginatedReturns, setPaginatedReturns] = useState<PaginatedList<ProductStockReturnDto>>(defaultPaginatedList);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchRequest, setLastSearchRequest] = useState<ProductStockReturnSearchRequest | null>(null);

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

  const genericReturnSearch = useCallback(async (searchRequest: ProductStockReturnSearchRequest): Promise<PaginatedList<ProductStockReturnDto>> => {
    setLastSearchRequest(searchRequest);
    const response = await handleApiCall(() => productStockReturnService.returnSearch(searchRequest));
    if (response.success && response.data) {
      setPaginatedReturns(response.data);
      return response.data;
    }
    setPaginatedReturns(defaultPaginatedList);
    return defaultPaginatedList;
  }, []);

  const supplierReturnSearch = useCallback(
    async (searchRequest: ProductStockReturnSearchRequest): Promise<PaginatedList<ProductStockReturnDto>> => {
      searchRequest.returnTypeCode = ReturnType.Supplier;
      return genericReturnSearch(searchRequest);
    },
    [genericReturnSearch]
  );

  const internalReturnSearch = useCallback(
    async (searchRequest: ProductStockReturnSearchRequest): Promise<PaginatedList<ProductStockReturnDto>> => {
      searchRequest.returnTypeCode = ReturnType.Internal;
      return genericReturnSearch(searchRequest);
    },
    [genericReturnSearch]
  );

  const expiredReturnSearch = useCallback(
    async (searchRequest: ProductStockReturnSearchRequest): Promise<PaginatedList<ProductStockReturnDto>> => {
      searchRequest.returnTypeCode = ReturnType.Expired;
      return genericReturnSearch(searchRequest);
    },
    [genericReturnSearch]
  );

  const damagedReturnSearch = useCallback(
    async (searchRequest: ProductStockReturnSearchRequest): Promise<PaginatedList<ProductStockReturnDto>> => {
      searchRequest.returnTypeCode = ReturnType.Damaged;
      return genericReturnSearch(searchRequest);
    },
    [genericReturnSearch]
  );

  const refreshCurrentPage = useCallback(async () => {
    if (lastSearchRequest) {
      await genericReturnSearch(lastSearchRequest);
    }
  }, [lastSearchRequest, genericReturnSearch]);

  const getReturnWithDetailsById = useCallback(async (returnId: number): Promise<ProductStockReturnCompositeDto | null> => {
    if (!returnId || returnId <= 0) {
      showAlert("Error", "A valid return ID is required.", "error");
      return null;
    }
    const response = await handleApiCall(() => productStockReturnService.getReturnWithDetailsById(returnId));
    return response.data ?? null;
  }, []);

  const saveSupplierReturn = useCallback(async (returnData: ProductStockReturnCompositeDto): Promise<OperationResult<ProductStockReturnCompositeDto>> => {
    const isEdit = returnData.productStockReturn.psrID > 0;
    return handleApiCall(() => productStockReturnService.createSupplierReturn(returnData), `Supplier Return ${isEdit ? "updated" : "created"} successfully!`, true);
  }, []);

  const saveInternalReturn = useCallback(async (returnData: ProductStockReturnCompositeDto): Promise<OperationResult<ProductStockReturnCompositeDto>> => {
    const isEdit = returnData.productStockReturn.psrID > 0;
    return handleApiCall(() => productStockReturnService.createInternalReturn(returnData), `Internal Return ${isEdit ? "updated" : "created"} successfully!`, true);
  }, []);

  const saveExpiredReturn = useCallback(async (returnData: ProductStockReturnCompositeDto): Promise<OperationResult<ProductStockReturnCompositeDto>> => {
    const isEdit = returnData.productStockReturn.psrID > 0;
    return handleApiCall(() => productStockReturnService.createExpiredReturn(returnData), `Expired Return ${isEdit ? "updated" : "created"} successfully!`, true);
  }, []);

  const saveDamagedReturn = useCallback(async (returnData: ProductStockReturnCompositeDto): Promise<OperationResult<ProductStockReturnCompositeDto>> => {
    const isEdit = returnData.productStockReturn.psrID > 0;
    return handleApiCall(() => productStockReturnService.createDamagedReturn(returnData), `Damaged Return ${isEdit ? "updated" : "created"} successfully!`, true);
  }, []);

  const saveReturnWithDetails = useCallback(
    async (returnData: ProductStockReturnCompositeDto): Promise<OperationResult<ProductStockReturnCompositeDto>> => {
      const returnType = returnData.productStockReturn.returnTypeCode;

      switch (returnType) {
        case ReturnType.Supplier:
          return saveSupplierReturn(returnData);
        case ReturnType.Internal:
          return saveInternalReturn(returnData);
        case ReturnType.Expired:
          return saveExpiredReturn(returnData);
        case ReturnType.Damaged:
          return saveDamagedReturn(returnData);
        default:
          return handleApiCall(
            () => productStockReturnService.createReturnWithDetails(returnData),
            `Stock Return ${returnData.productStockReturn.psrID > 0 ? "updated" : "created"} successfully`,
            true
          );
      }
    },
    [saveSupplierReturn, saveInternalReturn, saveExpiredReturn, saveDamagedReturn]
  );

  const deleteReturn = useCallback(async (returnId: number): Promise<boolean> => {
    const response = await handleApiCall(() => productStockReturnService.deleteReturn(returnId), "Return deleted successfully", true);
    return response.success;
  }, []);

  const approveReturn = useCallback(async (returnId: number): Promise<boolean> => {
    const response = await handleApiCall(() => productStockReturnService.approveReturn(returnId), "Return approved successfully", true);
    return response.success;
  }, []);

  const generateReturnCode = useCallback(async (departmentId: number, returnType: string): Promise<string | null> => {
    const response = await handleApiCall(() => productStockReturnService.generateReturnCode(departmentId, returnType));
    return response.data ?? null;
  }, []);

  const generateSupplierReturnCode = useCallback(async (departmentId: number): Promise<string | null> => {
    const response = await handleApiCall(() => productStockReturnService.generateSupplierReturnCode(departmentId));
    return response.data ?? null;
  }, []);

  const generateInternalReturnCode = useCallback(async (departmentId: number): Promise<string | null> => {
    const response = await handleApiCall(() => productStockReturnService.generateInternalReturnCode(departmentId));
    return response.data ?? null;
  }, []);

  const generateExpiredReturnCode = useCallback(async (departmentId: number): Promise<string | null> => {
    const response = await handleApiCall(() => productStockReturnService.generateExpiredReturnCode(departmentId));
    return response.data ?? null;
  }, []);

  const generateDamagedReturnCode = useCallback(async (departmentId: number): Promise<string | null> => {
    const response = await handleApiCall(() => productStockReturnService.generateDamagedReturnCode(departmentId));
    return response.data ?? null;
  }, []);

  const getAvailableStockForReturn = useCallback(async (departmentId: number, productId?: number): Promise<ProductStockBalance[]> => {
    const response = await handleApiCall(() => productStockReturnService.getAvailableStockForReturn(departmentId, productId));
    return response.data ?? [];
  }, []);

  const validateStockAvailability = useCallback(async (request: ValidateReturnStockRequest): Promise<boolean> => {
    const response = await handleApiCall(() => productStockReturnService.validateStockAvailability(request));
    return response.success && !!response.data;
  }, []);

  const getReturnSummary = useCallback(async (startDate?: Date, endDate?: Date, departmentId?: number, returnType?: string): Promise<any> => {
    const response = await handleApiCall(() => productStockReturnService.getReturnSummary(startDate, endDate, departmentId, returnType));
    return response.data ?? null;
  }, []);

  const getReturnTypes = useCallback(async (): Promise<any[]> => {
    const response = await handleApiCall(() => productStockReturnService.getReturnTypes());
    return response.data ?? [];
  }, []);

  const getReturnsByDateRange = useCallback(async (startDate: Date, endDate: Date, departmentId?: number, returnType?: string): Promise<ProductStockReturnDto[]> => {
    const response = await handleApiCall(() => productStockReturnService.getReturnsByDateRange(startDate, endDate, departmentId, returnType));
    return response.data ?? [];
  }, []);

  const getReturnsByStatus = useCallback(
    async (isApproved: boolean, returnType?: string, pageIndex = 1, pageSize = 20): Promise<PaginatedList<ProductStockReturnDto>> => {
      const searchRequest: ProductStockReturnSearchRequest = {
        pageIndex,
        pageSize,
        returnTypeCode: returnType,
        approvedStatus: isApproved ? "Y" : "N",
      };
      return genericReturnSearch(searchRequest);
    },
    [genericReturnSearch]
  );

  const getPendingReturns = useCallback((returnType?: string, pageIndex = 1, pageSize = 20) => getReturnsByStatus(false, returnType, pageIndex, pageSize), [getReturnsByStatus]);

  const getApprovedReturns = useCallback((returnType?: string, pageIndex = 1, pageSize = 20) => getReturnsByStatus(true, returnType, pageIndex, pageSize), [getReturnsByStatus]);

  const canEditReturn = useCallback((stockReturn: ProductStockReturnDto): boolean => {
    return stockReturn?.approvedYN !== "Y";
  }, []);

  const canApproveReturn = useCallback((stockReturn: ProductStockReturnDto): boolean => {
    return stockReturn?.approvedYN !== "Y";
  }, []);

  const canDeleteReturn = useCallback((stockReturn: ProductStockReturnDto): boolean => {
    return stockReturn?.approvedYN !== "Y";
  }, []);

  return {
    paginatedReturns,
    isLoading,
    error,
    clearError,
    refreshCurrentPage,
    genericReturnSearch,
    supplierReturnSearch,
    internalReturnSearch,
    expiredReturnSearch,
    damagedReturnSearch,
    getReturnWithDetailsById,
    saveReturnWithDetails,
    saveSupplierReturn,
    saveInternalReturn,
    saveExpiredReturn,
    saveDamagedReturn,
    deleteReturn,
    approveReturn,
    generateReturnCode,
    generateSupplierReturnCode,
    generateInternalReturnCode,
    generateExpiredReturnCode,
    generateDamagedReturnCode,
    getAvailableStockForReturn,
    validateStockAvailability,
    getReturnSummary,
    getReturnTypes,
    getReturnsByDateRange,
    getPendingReturns,
    getApprovedReturns,
    canEditReturn,
    canApproveReturn,
    canDeleteReturn,
  };
};
