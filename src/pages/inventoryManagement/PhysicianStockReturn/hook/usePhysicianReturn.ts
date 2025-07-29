import { useLoading } from "@/hooks/Common/useLoading";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { PaginatedList } from "@/interfaces/Common/PaginatedList";
import {
  ProductStockBalance,
  ProductStockReturnCompositeDto,
  ProductStockReturnDto,
  ProductStockReturnSearchRequest,
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

// Define a new type for Physician Return
export enum PhysicianReturnType {
  Physician = "PHY", // Base type for physician returns
  InventoryAdjustment = "ADJ", // Adjustment of physician inventory
}

export interface PhysicianReturnHookReturn {
  paginatedReturns: PaginatedList<ProductStockReturnDto>;
  isLoading: boolean;
  error: string | null;

  physicianReturnSearch: (searchRequest: ProductStockReturnSearchRequest) => Promise<PaginatedList<ProductStockReturnDto>>;
  inventoryAdjustmentSearch: (searchRequest: ProductStockReturnSearchRequest) => Promise<PaginatedList<ProductStockReturnDto>>;

  getReturnWithDetailsById: (returnId: number) => Promise<ProductStockReturnCompositeDto | null>;
  savePhysicianReturn: (returnData: ProductStockReturnCompositeDto) => Promise<OperationResult<ProductStockReturnCompositeDto>>;
  saveInventoryAdjustment: (returnData: ProductStockReturnCompositeDto) => Promise<OperationResult<ProductStockReturnCompositeDto>>;

  deleteReturn: (returnId: number) => Promise<boolean>;
  approveReturn: (returnId: number) => Promise<boolean>;

  generatePhysicianReturnCode: (departmentId: number) => Promise<string | null>;
  generateAdjustmentReturnCode: (departmentId: number) => Promise<string | null>;

  getAvailableStockForReturn: (departmentId: number, physicianId?: number, productId?: number) => Promise<ProductStockBalance[]>;
  validateStockAvailability: (request: ValidateReturnStockRequest) => Promise<boolean>;

  getReturnSummary: (startDate?: Date, endDate?: Date, departmentId?: number, physicianId?: number) => Promise<any>;
  getReturnTypes: () => Promise<any[]>;
  getReturnsByDateRange: (startDate: Date, endDate: Date, departmentId?: number, physicianId?: number) => Promise<ProductStockReturnDto[]>;

  getPendingReturns: (returnType?: string, pageIndex?: number, pageSize?: number) => Promise<PaginatedList<ProductStockReturnDto>>;
  getApprovedReturns: (returnType?: string, pageIndex?: number, pageSize?: number) => Promise<PaginatedList<ProductStockReturnDto>>;

  canEditReturn: (stockReturn: ProductStockReturnDto) => boolean;
  canApproveReturn: (stockReturn: ProductStockReturnDto) => boolean;
  canDeleteReturn: (stockReturn: ProductStockReturnDto) => boolean;

  clearError: () => void;
  refreshCurrentPage: () => Promise<void>;
}

export const usePhysicianReturn = (): PhysicianReturnHookReturn => {
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

  // Generic search function - we're adapting the product return service for physician returns
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

  // Physician return specific search
  const physicianReturnSearch = useCallback(
    async (searchRequest: ProductStockReturnSearchRequest): Promise<PaginatedList<ProductStockReturnDto>> => {
      searchRequest.returnTypeCode = PhysicianReturnType.Physician;
      return genericReturnSearch(searchRequest);
    },
    [genericReturnSearch]
  );

  // Inventory adjustment search
  const inventoryAdjustmentSearch = useCallback(
    async (searchRequest: ProductStockReturnSearchRequest): Promise<PaginatedList<ProductStockReturnDto>> => {
      searchRequest.returnTypeCode = PhysicianReturnType.InventoryAdjustment;
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

  // Save physician return using the product return service
  const savePhysicianReturn = useCallback(async (returnData: ProductStockReturnCompositeDto): Promise<OperationResult<ProductStockReturnCompositeDto>> => {
    // Ensure the return type is set correctly
    returnData.productStockReturn.returnTypeCode = PhysicianReturnType.Physician;
    returnData.productStockReturn.returnType = "Physician Return";

    const isEdit = returnData.productStockReturn.psrID > 0;
    return handleApiCall(() => productStockReturnService.createReturnWithDetails(returnData), `Physician Return ${isEdit ? "updated" : "created"} successfully!`, true);
  }, []);

  // Save inventory adjustment
  const saveInventoryAdjustment = useCallback(async (returnData: ProductStockReturnCompositeDto): Promise<OperationResult<ProductStockReturnCompositeDto>> => {
    // Ensure the return type is set correctly
    returnData.productStockReturn.returnTypeCode = PhysicianReturnType.InventoryAdjustment;
    returnData.productStockReturn.returnType = "Inventory Adjustment";

    const isEdit = returnData.productStockReturn.psrID > 0;
    return handleApiCall(() => productStockReturnService.createReturnWithDetails(returnData), `Inventory Adjustment ${isEdit ? "updated" : "created"} successfully!`, true);
  }, []);

  const deleteReturn = useCallback(async (returnId: number): Promise<boolean> => {
    const response = await handleApiCall(() => productStockReturnService.deleteReturn(returnId), "Return deleted successfully", true);
    return response.success;
  }, []);

  const approveReturn = useCallback(async (returnId: number): Promise<boolean> => {
    const response = await handleApiCall(() => productStockReturnService.approveReturn(returnId), "Return approved successfully", true);
    return response.success;
  }, []);

  // Generate return codes using the existing service
  const generatePhysicianReturnCode = useCallback(async (departmentId: number): Promise<string | null> => {
    const response = await handleApiCall(() => productStockReturnService.generateReturnCode(departmentId, PhysicianReturnType.Physician));
    return response.data ?? null;
  }, []);

  const generateAdjustmentReturnCode = useCallback(async (departmentId: number): Promise<string | null> => {
    const response = await handleApiCall(() => productStockReturnService.generateReturnCode(departmentId, PhysicianReturnType.InventoryAdjustment));
    return response.data ?? null;
  }, []);

  // Get available stock - modified to support physician ID
  const getAvailableStockForReturn = useCallback(async (departmentId: number, physicianId?: number, productId?: number): Promise<ProductStockBalance[]> => {
    // Use the base service to get available stock
    // In a real implementation, you might need to modify this to filter by physician
    const response = await handleApiCall(() => productStockReturnService.getAvailableStockForReturn(departmentId, productId));

    // Filter by physician if necessary (in a real implementation, this would be done on the server)
    const stockItems = response.data ?? [];
    if (physicianId && stockItems.length > 0) {
      // This is a simplified filter - in a real implementation,
      // the backend would handle filtering by physician
      return stockItems.filter((item) => true); // Placeholder for physician filtering
    }

    return stockItems;
  }, []);

  const validateStockAvailability = useCallback(async (request: ValidateReturnStockRequest): Promise<boolean> => {
    const response = await handleApiCall(() => productStockReturnService.validateStockAvailability(request));
    return response.success && !!response.data;
  }, []);

  // Get return summary
  const getReturnSummary = useCallback(async (startDate?: Date, endDate?: Date, departmentId?: number, physicianId?: number): Promise<any> => {
    // In a real implementation, we would need to modify this to filter by physician returns
    const response = await handleApiCall(() => productStockReturnService.getReturnSummary(startDate, endDate, departmentId));

    // If physicianId is provided, we might need to filter the results
    const summaryData = response.data ?? null;
    if (physicianId && summaryData) {
      // Placeholder for physician filtering
      return summaryData;
    }

    return summaryData;
  }, []);

  const getReturnTypes = useCallback(async (): Promise<any[]> => {
    const response = await handleApiCall(() => productStockReturnService.getReturnTypes());
    // Filter to only include physician-related return types
    const allTypes = response.data ?? [];
    return allTypes.filter((type) => type.Value === PhysicianReturnType.Physician || type.Value === PhysicianReturnType.InventoryAdjustment);
  }, []);

  const getReturnsByDateRange = useCallback(async (startDate: Date, endDate: Date, departmentId?: number, physicianId?: number): Promise<ProductStockReturnDto[]> => {
    const response = await handleApiCall(() => productStockReturnService.getReturnsByDateRange(startDate, endDate, departmentId));

    const returns = response.data ?? [];
    // Filter to only include physician returns
    return returns.filter((ret) => ret.returnTypeCode === PhysicianReturnType.Physician || ret.returnTypeCode === PhysicianReturnType.InventoryAdjustment);
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
    physicianReturnSearch,
    inventoryAdjustmentSearch,
    getReturnWithDetailsById,
    savePhysicianReturn,
    saveInventoryAdjustment,
    deleteReturn,
    approveReturn,
    generatePhysicianReturnCode,
    generateAdjustmentReturnCode,
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
