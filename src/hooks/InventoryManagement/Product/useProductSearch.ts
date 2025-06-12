import { ProductOption } from "@/interfaces/InventoryManagement/Product/ProductSearch.interface";
import { productListService } from "@/services/InventoryManagementService/inventoryManagementService";
import { debounce } from "@/utils/Common/debounceUtils";
import { useCallback, useEffect, useState } from "react";

interface UseProductSearchProps {
  debounceTimeMs?: number;
  minSearchLength?: number;
}

interface UseProductSearchResult {
  inputValue: string;
  setInputValue: (value: string) => void;
  options: ProductOption[];
  isLoading: boolean;
  selectedProduct: ProductOption | null;
  setSelectedProduct: (product: ProductOption | null) => void;
  clearSearch: () => void;
}

/**
 * Custom hook for product search functionality
 * @param debounceTimeMs - Debounce time in milliseconds (default: 500)
 * @param minSearchLength - Minimum search term length before search is performed (default: 2)
 */
export const useProductSearch = ({ debounceTimeMs = 500, minSearchLength = 2 }: UseProductSearchProps = {}): UseProductSearchResult => {
  const [inputValue, setInputValue] = useState<string>("");
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null);

  const debouncedSearch = useCallback(
    debounce(async (searchTerm: string) => {
      if (searchTerm.length < minSearchLength) {
        setOptions([]);
        return;
      }

      try {
        setLoading(true);
        const response = await productListService.getAll();
        if (response && response.data) {
          const filteredProducts = response.data.filter(
            (product: any) => product.productCode.toLowerCase().includes(searchTerm.toLowerCase()) || product.productName.toLowerCase().includes(searchTerm.toLowerCase())
          );
          const productOptions: ProductOption[] = filteredProducts.map((product: any) => ({
            productID: product.productID,
            productCode: product.productCode,
            productName: product.productName || "",
            productCategory: product.productCategory || "",
            rActiveYN: product.rActiveYN,
          }));

          setOptions(productOptions);
        } else {
          setOptions([]);
        }
      } catch (error) {
        console.error("Error searching for products:", error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, debounceTimeMs),
    [minSearchLength, debounceTimeMs]
  );

  useEffect(() => {
    debouncedSearch(inputValue);

    return () => {
      debouncedSearch.cancel();
    };
  }, [inputValue, debouncedSearch]);

  const clearSearch = useCallback(() => {
    setSelectedProduct(null);
    setInputValue("");
    setOptions([]);
  }, []);

  return {
    inputValue,
    setInputValue,
    options,
    isLoading,
    selectedProduct,
    setSelectedProduct,
    clearSearch,
  };
};
