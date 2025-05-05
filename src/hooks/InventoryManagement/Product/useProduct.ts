import { useState, useCallback, useEffect } from "react";
import { ProductListDto } from "@/interfaces/InventoryManagement/ProductListDto";
import { ProductListService } from "@/services/InventoryManagementService/ProductListService/ProductListService";
import { useLoading } from "@/context/LoadingContext";
import { showAlert } from "@/utils/Common/showAlert";

const productService = new ProductListService();

interface UseProductReturn {
  products: ProductListDto[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  fetchProductById: (id: number) => Promise<ProductListDto | null>;
  fetchProductByCode: (code: string) => Promise<ProductListDto | null>;
  fetchProductsByName: (name: string) => Promise<ProductListDto[]>;
  saveProduct: (product: ProductListDto) => Promise<ProductListDto | null>;
  deleteProduct: (id: number) => Promise<boolean>;
  updateActiveStatus: (id: number, active: boolean) => Promise<boolean>;
  generateProductCode: () => Promise<string>;
}

/**
 * Custom hook for product management operations
 */
const useProduct = (): UseProductReturn => {
  const [products, setProducts] = useState<ProductListDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { setLoading: setGlobalLoading } = useLoading();

  // Fetch all products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setGlobalLoading(true);
      setError(null);

      const response = await productService.getAll();

      if (response.success && response.data) {
        setProducts(response.data);
        return;
      }

      setError(response.errorMessage || "Failed to fetch products");
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("An unexpected error occurred while fetching products");
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  }, []);

  // Fetch product by ID
  const fetchProductById = useCallback(
    async (id: number): Promise<ProductListDto | null> => {
      try {
        setGlobalLoading(true);

        const response = await productService.getById(id);

        if (response.success && response.data) {
          return response.data;
        }

        showAlert("Error", response.errorMessage || "Failed to fetch product", "error");
        return null;
      } catch (error) {
        console.error("Error fetching product by ID:", error);
        showAlert("Error", "An unexpected error occurred", "error");
        return null;
      } finally {
        setGlobalLoading(false);
      }
    },
    [setGlobalLoading]
  );

  // Fetch product by code
  const fetchProductByCode = useCallback(
    async (code: string): Promise<ProductListDto | null> => {
      try {
        setGlobalLoading(true);

        const response = await productService.getByProductCode(code);

        if (response.success && response.data) {
          return response.data;
        }

        return null;
      } catch (error) {
        console.error("Error fetching product by code:", error);
        return null;
      } finally {
        setGlobalLoading(false);
      }
    },
    [setGlobalLoading]
  );

  // Fetch products by name
  const fetchProductsByName = useCallback(
    async (name: string): Promise<ProductListDto[]> => {
      try {
        setGlobalLoading(true);

        const response = await productService.getByProductName(name);

        if (response.success && response.data) {
          return response.data;
        }

        return [];
      } catch (error) {
        console.error("Error fetching products by name:", error);
        return [];
      } finally {
        setGlobalLoading(false);
      }
    },
    [setGlobalLoading]
  );

  // Save product
  const saveProduct = useCallback(
    async (product: ProductListDto): Promise<ProductListDto | null> => {
      try {
        setGlobalLoading(true);

        const response = await productService.save(product);

        if (response.success && response.data) {
          showAlert("Success", "Product saved successfully", "success");
          return response.data;
        }

        showAlert("Error", response.errorMessage || "Failed to save product", "error");
        return null;
      } catch (error) {
        console.error("Error saving product:", error);
        showAlert("Error", "An unexpected error occurred while saving the product", "error");
        return null;
      } finally {
        setGlobalLoading(false);
      }
    },
    [setGlobalLoading]
  );

  // Delete product
  const deleteProduct = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        setGlobalLoading(true);

        const response = await productService.delete(id, true);

        if (response.success) {
          showAlert("Success", "Product deleted successfully", "success");
          return true;
        }

        showAlert("Error", response.errorMessage || "Failed to delete product", "error");
        return false;
      } catch (error) {
        console.error("Error deleting product:", error);
        showAlert("Error", "An unexpected error occurred while deleting the product", "error");
        return false;
      } finally {
        setGlobalLoading(false);
      }
    },
    [setGlobalLoading]
  );

  // Update product active status
  const updateActiveStatus = useCallback(
    async (id: number, active: boolean): Promise<boolean> => {
      try {
        setGlobalLoading(true);

        const response = await productService.updateActiveStatus(id, active);

        if (response.success) {
          showAlert("Success", `Product ${active ? "activated" : "deactivated"} successfully`, "success");
          return true;
        }

        showAlert("Error", response.errorMessage || "Failed to update product status", "error");
        return false;
      } catch (error) {
        console.error("Error updating product status:", error);
        showAlert("Error", "An unexpected error occurred while updating product status", "error");
        return false;
      } finally {
        setGlobalLoading(false);
      }
    },
    [setGlobalLoading]
  );

  // Generate next product code
  const generateProductCode = useCallback(async (): Promise<string> => {
    try {
      setGlobalLoading(true);

      const response = await productService.getNextProductCode();

      if (response.success && response.data) {
        return response.data;
      }

      return "";
    } catch (error) {
      console.error("Error generating product code:", error);
      return "";
    } finally {
      setGlobalLoading(false);
    }
  }, [setGlobalLoading]);

  // Load products on initial mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    fetchProducts,
    fetchProductById,
    fetchProductByCode,
    fetchProductsByName,
    saveProduct,
    deleteProduct,
    updateActiveStatus,
    generateProductCode,
  };
};

export default useProduct;
