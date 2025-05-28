import { createEntityHook } from "@/hooks/Common/useGenericEntity";
import { ProductOverviewDto } from "@/interfaces/InventoryManagement/ProductOverviewDto";
import { ProductListDto } from "@/interfaces/InventoryManagement/ProductListDto";
import { productOverviewService, productListService } from "@/services/InventoryManagementService/inventoryManagementService";
import { useState, useCallback } from "react";

const useGenericProductOverview = createEntityHook<ProductOverviewDto>(productOverviewService, "pvID");

export const useProductOverview = () => {
  const hook = useGenericProductOverview();
  const [productSuggestions, setProductSuggestions] = useState<ProductListDto[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const fetchProductSuggestions = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setProductSuggestions([]);
      return [];
    }
    try {
      setIsLoadingProducts(true);
      const response = await productListService.getAll();
      if (response.success && response.data) {
        const filteredProducts = response.data.filter((product: ProductListDto) => {
          const prodCode = product.productCode?.toLowerCase();
          const prodName = product.productName?.toLowerCase();
          const searchLower = searchTerm.toLowerCase();

          return prodCode?.includes(searchLower) || prodName?.includes(searchLower);
        });
        setProductSuggestions(filteredProducts);
        return filteredProducts.map((product: ProductListDto) => {
          const prodCode = product.productCode || "";
          const prodName = product.productName || "";
          return `${prodCode} - ${prodName}`;
        });
      }

      return [];
    } catch (error) {
      return [];
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  const getProductByCode = useCallback(async (productCode: string) => {
    try {
      const response = await productListService.getAll();
      if (response.success && response.data) {
        const product = response.data.find((p: ProductListDto) => p.productCode === productCode);
        return product || null;
      }
      return null;
    } catch (error) {
      return null;
    }
  }, []);

  const getProductOverviewByDepartment = useCallback(async (deptID: number) => {
    try {
      const result = await productOverviewService.getAll();
      const items = result.success ? result.data ?? [] : [];
      return items.filter((product: ProductOverviewDto) => product.deptID === deptID);
    } catch (error) {
      return [];
    }
  }, []);

  const convertLeadTimeToDays = useCallback((leadTime: number, leadTimeUnit: string) => {
    let days = leadTime;
    switch (leadTimeUnit) {
      case "weeks":
        days = leadTime * 7;
        break;
      case "months":
        days = leadTime * 30;
        break;
      case "years":
        days = leadTime * 365;
        break;
      default:
        break;
    }
    return days;
  }, []);

  return {
    productOverviewList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchProductOverviewList: hook.fetchEntityList,
    getProductOverviewById: hook.getEntityById,
    saveProductOverview: hook.saveEntity,
    deleteProductOverview: hook.deleteEntity,
    updateProductOverviewStatus: hook.updateEntityStatus,
    getNextCode: hook.getNextCode,
    productSuggestions,
    isLoadingProducts,
    fetchProductSuggestions,
    getProductByCode,
    getProductOverviewByDepartment,
    convertLeadTimeToDays,
  };
};
