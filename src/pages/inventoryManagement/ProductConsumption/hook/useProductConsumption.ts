// src/pages/inventoryManagement/DepartmentConsumption/hooks/useDepartmentConsumption.ts

import { OperationResult } from "@/interfaces/Common/OperationResult";
import { PaginatedList } from "@/interfaces/Common/PaginatedList";
import {
  ProductConsumptionCompositeDto,
  ProductConsumptionMastDto,
  ProductConsumptionSearchRequest,
  ValidateConsumptionStockRequest,
} from "@/interfaces/InventoryManagement/ProductConsumption";
import { ProductStockBalance } from "@/interfaces/InventoryManagement/ProductIssualDto";
import { useAlert } from "@/providers/AlertProvider";
import { productConsumptionService } from "@/services/InventoryManagementService/ProductConsumptionService/ProductConsumptionService";

import { useCallback, useState } from "react";

// Custom hook
export const useDepartmentConsumption = () => {
  const { showAlert } = useAlert();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const generateConsumptionCode = useCallback(
    async (departmentId: number): Promise<string | null> => {
      try {
        setIsLoading(true);
        const result = await productConsumptionService.generateConsumptionCode(departmentId);

        if (result.success && result.data) {
          return result.data;
        } else {
          setError(result.errorMessage || "Failed to generate consumption code");
          showAlert("Error", result.errorMessage || "Failed to generate consumption code", "error");
          return null;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to generate consumption code";
        setError(errorMessage);
        showAlert("Error", errorMessage, "error");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [showAlert]
  );

  const saveDepartmentConsumption = useCallback(
    async (consumptionDto: ProductConsumptionCompositeDto): Promise<OperationResult<ProductConsumptionCompositeDto>> => {
      try {
        setIsLoading(true);
        const result = await productConsumptionService.createConsumptionWithDetails(consumptionDto);

        if (result.success) {
          showAlert("Success", "Department consumption saved successfully", "success");
        } else {
          setError(result.errorMessage || "Failed to save consumption");
          showAlert("Error", result.errorMessage || "Failed to save consumption", "error");
        }

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to save consumption";
        setError(errorMessage);
        showAlert("Error", errorMessage, "error");
        return {
          success: false,
          errorMessage,
          data: null as any,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [showAlert]
  );

  const getConsumptionWithDetailsById = useCallback(
    async (consumptionId: number): Promise<ProductConsumptionCompositeDto | null> => {
      try {
        setIsLoading(true);
        const result = await productConsumptionService.getConsumptionWithDetailsById(consumptionId);

        if (result.success && result.data) {
          return result.data;
        } else {
          setError(result.errorMessage || "Failed to fetch consumption details");
          showAlert("Error", result.errorMessage || "Failed to fetch consumption details", "error");
          return null;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch consumption details";
        setError(errorMessage);
        showAlert("Error", errorMessage, "error");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [showAlert]
  );

  const searchConsumptions = useCallback(async (searchRequest: ProductConsumptionSearchRequest): Promise<PaginatedList<ProductConsumptionMastDto> | null> => {
    try {
      setIsLoading(true);
      const result = await productConsumptionService.consumptionSearch(searchRequest);

      if (result.success && result.data) {
        return result.data;
      } else {
        setError(result.errorMessage || "Failed to search consumptions");
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to search consumptions";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteConsumption = useCallback(
    async (consumptionId: number): Promise<boolean> => {
      try {
        setIsLoading(true);
        const result = await productConsumptionService.deleteConsumption(consumptionId);

        if (result.success) {
          showAlert("Success", "Department consumption deleted successfully", "success");
          return true;
        } else {
          setError(result.errorMessage || "Failed to delete consumption");
          showAlert("Error", result.errorMessage || "Failed to delete consumption", "error");
          return false;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to delete consumption";
        setError(errorMessage);
        showAlert("Error", errorMessage, "error");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [showAlert]
  );

  const validateStockAvailability = useCallback(
    async (request: ValidateConsumptionStockRequest): Promise<boolean> => {
      try {
        const result = await productConsumptionService.validateStockAvailability(request);

        if (result.success) {
          return result.data;
        } else {
          setError(result.errorMessage || "Failed to validate stock availability");
          showAlert("Error", result.errorMessage || "Failed to validate stock availability", "error");
          return false;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to validate stock availability";
        setError(errorMessage);
        showAlert("Error", errorMessage, "error");
        return false;
      }
    },
    [showAlert]
  );

  const getAvailableStock = useCallback(async (departmentId: number, productId?: number): Promise<ProductStockBalance[]> => {
    try {
      const result = await productConsumptionService.getAvailableStockForConsumption(departmentId, productId);

      if (result.success && result.data) {
        return result.data;
      } else {
        setError(result.errorMessage || "Failed to fetch available stock");
        return [];
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch available stock";
      setError(errorMessage);
      return [];
    }
  }, []);

  // Helper functions for permissions
  const canEditConsumption = useCallback((consumption: ProductConsumptionMastDto): boolean => {
    // Can edit if it's active and user has permissions
    return consumption.rActiveYN === "Y";
  }, []);

  const canDeleteConsumption = useCallback((consumption: ProductConsumptionMastDto): boolean => {
    // Can delete if it's active and user has permissions
    return consumption.rActiveYN === "Y";
  }, []);

  return {
    isLoading,
    error,
    clearError,
    generateConsumptionCode,
    saveDepartmentConsumption,
    getConsumptionWithDetailsById,
    searchConsumptions,
    deleteConsumption,
    validateStockAvailability,
    getAvailableStock,
    canEditConsumption,
    canDeleteConsumption,
  };
};

export default useDepartmentConsumption;
