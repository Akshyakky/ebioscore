import { useLoading } from "@/hooks/Common/useLoading";
import { PaginatedList } from "@/interfaces/Common/PaginatedList";
import { ProductIssualCompositeDto, ProductIssualDto, ProductIssualSearchRequest, ProductStockBalance } from "@/interfaces/InventoryManagement/ProductIssualDto";
import { useAlert } from "@/providers/AlertProvider";
import { OperationResult } from "@/services/GenericEntityService/GenericEntityService";
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
  issualSearch: (searchRequest: ProductIssualSearchRequest) => Promise<PaginatedList<ProductIssualDto>>;
  getIssualWithDetailsById: (issualId: number) => Promise<ProductIssualCompositeDto | null>;
  saveIssualWithDetails: (issualData: ProductIssualCompositeDto) => Promise<OperationResult<ProductIssualCompositeDto>>;
  deleteIssual: (issualId: number) => Promise<boolean>;
  approveIssual: (issualId: number) => Promise<boolean>;
  generateIssualCode: (fromDepartmentId: number) => Promise<string | null>;
  getAvailableStock: (departmentId: number, productId?: number) => Promise<ProductStockBalance[]>;
  validateStockAvailability: (departmentId: number, productId: number, requiredQty: number, batchNo?: string) => Promise<boolean>;
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

  const issualSearch = useCallback(
    async (searchRequest: ProductIssualSearchRequest): Promise<PaginatedList<ProductIssualDto>> => {
      try {
        setIsLoading(true);
        setError(null);
        setLastSearchRequest(searchRequest);

        const response = await productIssualService.issualSearch(searchRequest);

        if (response.success && response.data) {
          setPaginatedIssuals(response.data);
          return response.data;
        } else {
          throw new Error(response.errorMessage || "Failed to search for product issuals");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during search";
        setError(errorMessage);
        showAlert("Error", errorMessage, "error");
        setPaginatedIssuals(defaultPaginatedList);
        return defaultPaginatedList;
      } finally {
        setIsLoading(false);
      }
    },
    [showAlert]
  );

  const refreshCurrentPage = useCallback(async () => {
    if (lastSearchRequest) {
      await issualSearch(lastSearchRequest);
    }
  }, [lastSearchRequest, issualSearch]);

  const getIssualWithDetailsById = useCallback(
    async (issualId: number): Promise<ProductIssualCompositeDto | null> => {
      try {
        setLoading(true);
        clearError();

        if (!issualId || issualId <= 0) {
          throw new Error("Valid issual ID is required");
        }

        const response = await productIssualService.getIssualWithDetailsById(issualId);

        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.errorMessage || "Failed to fetch product issual details");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch details";
        setError(errorMessage);
        showAlert("Error", errorMessage, "error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, showAlert, clearError]
  );

  const saveIssualWithDetails = useCallback(
    async (issualData: ProductIssualCompositeDto): Promise<OperationResult<ProductIssualCompositeDto>> => {
      try {
        debugger;
        setLoading(true);
        clearError();
        if (!issualData.productIssual.fromDeptID) {
          throw new Error("From department is required");
        }
        if (!issualData.productIssual.toDeptID) {
          throw new Error("To department is required");
        }
        if (issualData.productIssual.fromDeptID === issualData.productIssual.toDeptID) {
          throw new Error("From department and To department cannot be the same");
        }
        if (!issualData.details || issualData.details.length === 0) {
          throw new Error("At least one product detail is required");
        }
        for (const detail of issualData.details) {
          if (!detail.productID || detail.productID <= 0) {
            throw new Error("Product is required for all detail items");
          }
          if (!detail.issuedQty || detail.issuedQty <= 0) {
            throw new Error(`Invalid issued quantity for product ${detail.productName || "Unknown"}`);
          }
          if (!detail.requestedQty || detail.requestedQty <= 0) {
            throw new Error(`Invalid requested quantity for product ${detail.productName || "Unknown"}`);
          }
          if (detail.issuedQty > detail.requestedQty) {
            throw new Error(`Issued quantity cannot exceed requested quantity for product ${detail.productName || "Unknown"}`);
          }
          if (detail.availableQty !== undefined && detail.issuedQty > detail.availableQty) {
            throw new Error(`Insufficient stock for product ${detail.productName || "Unknown"}. Available: ${detail.availableQty}, Requested: ${detail.issuedQty}`);
          }
        }

        const response = await productIssualService.createIssualWithDetails(issualData);

        if (response.success) {
          const isEdit = issualData.productIssual.pisid > 0;
          showAlert("Success", `Product Issual ${isEdit ? "updated" : "created"} successfully!`, "success");
          if (lastSearchRequest) {
            await refreshCurrentPage();
          }

          return response;
        } else {
          throw new Error(response.errorMessage || "Failed to save product issual");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        showAlert("Error", errorMessage, "error");
        return { success: false, errorMessage, data: undefined };
      } finally {
        setLoading(false);
      }
    },
    [setLoading, showAlert, clearError, lastSearchRequest, refreshCurrentPage]
  );

  const deleteIssual = useCallback(
    async (issualId: number): Promise<boolean> => {
      try {
        setLoading(true);
        clearError();

        if (!issualId || issualId <= 0) {
          throw new Error("Valid issual ID is required");
        }

        const response = await productIssualService.deleteIssual(issualId);

        if (response.success) {
          showAlert("Success", "Product Issual deleted successfully", "success");

          // Refresh the current page
          await refreshCurrentPage();

          return true;
        } else {
          throw new Error(response.errorMessage || "Failed to delete product issual");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete";
        setError(errorMessage);
        showAlert("Error", errorMessage, "error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, showAlert, clearError, refreshCurrentPage]
  );

  const generateIssualCode = useCallback(
    async (fromDepartmentId: number): Promise<string | null> => {
      try {
        debugger;
        setLoading(true);
        const response = await productIssualService.generateIssualCode(fromDepartmentId);

        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.errorMessage || "Failed to generate issual code");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Code generation failed";
        showAlert("Error", errorMessage, "error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, showAlert]
  );

  const approveIssual = useCallback(
    async (issualId: number): Promise<boolean> => {
      try {
        setLoading(true);
        clearError();

        if (!issualId || issualId <= 0) {
          throw new Error("Valid issual ID is required");
        }

        const response = await productIssualService.approveIssual(issualId);

        if (response.success) {
          showAlert("Success", "Product Issual approved successfully", "success");

          // Refresh the current page
          await refreshCurrentPage();

          return true;
        } else {
          throw new Error(response.errorMessage || "Failed to approve product issual");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Approval failed";
        setError(errorMessage);
        showAlert("Error", errorMessage, "error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, showAlert, clearError, refreshCurrentPage]
  );

  const getAvailableStock = useCallback(
    async (departmentId: number, productId?: number): Promise<ProductStockBalance[]> => {
      try {
        setIsLoading(true);
        clearError();

        if (!departmentId || departmentId <= 0) {
          throw new Error("Valid department ID is required");
        }

        const response = await productIssualService.getAvailableStock(departmentId, productId);

        if (response.success && response.data) {
          // Filter out products with zero or negative stock
          const availableProducts = response.data.filter((product) => (product.productQuantityOnHand || 0) > 0);

          return availableProducts;
        }

        throw new Error(response.errorMessage || "Failed to fetch available stock");
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Could not retrieve stock";
        setError(errorMessage);
        showAlert("Error", errorMessage, "error");
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [setIsLoading, showAlert, clearError]
  );

  const validateStockAvailability = useCallback(
    async (departmentId: number, productId: number, requiredQty: number, batchNo?: string): Promise<boolean> => {
      try {
        clearError();

        const response = await productIssualService.validateStockAvailability(departmentId, productId, requiredQty, batchNo);

        if (response.success) {
          return true;
        } else {
          setError(response.errorMessage || "Stock validation failed");
          return false;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Stock validation failed";
        setError(errorMessage);
        return false;
      }
    },
    [clearError]
  );

  const canEditIssual = useCallback((issual: ProductIssualDto): boolean => {
    if (!issual) return false;
    return issual.approvedYN !== "Y";
  }, []);

  const canApproveIssual = useCallback((issual: ProductIssualDto): boolean => {
    if (!issual) return false;
    return issual.approvedYN !== "Y";
  }, []);

  const canDeleteIssual = useCallback((issual: ProductIssualDto): boolean => {
    if (!issual) return false;
    return issual.approvedYN !== "Y";
  }, []);

  return {
    paginatedIssuals,
    isLoading,
    error,
    issualSearch,
    getIssualWithDetailsById,
    saveIssualWithDetails,
    deleteIssual,
    approveIssual,
    generateIssualCode,
    getAvailableStock,
    validateStockAvailability,
    canEditIssual,
    canApproveIssual,
    canDeleteIssual,
    clearError,
    refreshCurrentPage,
  };
};
