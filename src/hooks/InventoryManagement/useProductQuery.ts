// src/hooks/InventoryManagement/useProductQuery.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProductListDto } from "@/interfaces/InventoryManagement/ProductListDto";
import { ProductListService } from "@/services/InventoryManagementService/ProductListService/ProductListService";
import { showAlert } from "@/utils/Common/showAlert";
import { useLoading } from "@/context/LoadingContext";

const productService = new ProductListService();

// Query Keys
export const productQueryKeys = {
  all: ["products"] as const,
  lists: () => [...productQueryKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...productQueryKeys.lists(), filters] as const,
  details: () => [...productQueryKeys.all, "detail"] as const,
  detail: (id: number) => [...productQueryKeys.details(), id] as const,
  nextCode: () => [...productQueryKeys.all, "nextCode"] as const,
};

// Get all products with caching
export const useProductsQuery = () => {
  return useQuery({
    queryKey: productQueryKeys.lists(),
    queryFn: async () => {
      const response = await productService.getAll();
      if (!response.success) {
        throw new Error(response.errorMessage || "Failed to fetch products");
      }
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// Get product by ID
export const useProductQuery = (id: number) => {
  return useQuery({
    queryKey: productQueryKeys.detail(id),
    queryFn: async () => {
      const response = await productService.getById(id);
      if (!response.success) {
        throw new Error(response.errorMessage || "Failed to fetch product");
      }
      return response.data;
    },
    enabled: !!id && id > 0,
    staleTime: 5 * 60 * 1000,
  });
};

// Get next product code
export const useNextProductCodeQuery = () => {
  return useQuery({
    queryKey: productQueryKeys.nextCode(),
    queryFn: async () => {
      const response = await productService.getNextProductCode();
      if (!response.success) {
        throw new Error(response.errorMessage || "Failed to generate product code");
      }
      return response.data;
    },
    staleTime: 0, // Always fresh
    retry: 2,
  });
};

// Create/Update product mutation
export const useProductMutation = () => {
  const queryClient = useQueryClient();
  const { setLoading } = useLoading();

  return useMutation({
    mutationFn: async (product: ProductListDto) => {
      const response = await productService.save(product);
      if (!response.success) {
        throw new Error(response.errorMessage || "Failed to save product");
      }
      return response.data;
    },
    onMutate: (variables) => {
      setLoading(true);
      // Optimistic update
      if (variables.productID) {
        queryClient.setQueryData(productQueryKeys.detail(variables.productID), variables);
      }
    },
    onSuccess: (data, variables) => {
      // Update the products list
      queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });

      // Update the specific product if it's an edit
      if (variables.productID) {
        queryClient.setQueryData(productQueryKeys.detail(variables.productID), data);
      }

      // Invalidate next code query to generate new code for next product
      queryClient.invalidateQueries({ queryKey: productQueryKeys.nextCode() });

      showAlert("Success", variables.productID ? "Product updated successfully" : "Product created successfully", "success");
    },
    onError: (error: Error, variables) => {
      // Revert optimistic update on error
      if (variables.productID) {
        queryClient.invalidateQueries({
          queryKey: productQueryKeys.detail(variables.productID),
        });
      }
      showAlert("Error", error.message, "error");
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

// Delete product mutation
export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient();
  const { setLoading } = useLoading();

  return useMutation({
    mutationFn: async ({ id, softDelete }: { id: number; softDelete: boolean }) => {
      const response = await productService.delete(id, softDelete);
      if (!response.success) {
        throw new Error(response.errorMessage || "Failed to delete product");
      }
      return response.data;
    },
    onMutate: ({ id }) => {
      setLoading(true);
      // Optimistic update - remove from list
      queryClient.setQueryData(productQueryKeys.lists(), (oldData: ProductListDto[] | undefined) => oldData?.filter((product) => product.productID !== id) || []);
    },
    onSuccess: (_, variables) => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
      queryClient.removeQueries({ queryKey: productQueryKeys.detail(variables.id) });

      showAlert("Success", "Product deleted successfully", "success");
    },
    onError: (error: Error) => {
      // Revert optimistic update
      queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
      showAlert("Error", error.message, "error");
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

// Bulk operations
export const useBulkDeleteProductsMutation = () => {
  const queryClient = useQueryClient();
  const { setLoading } = useLoading();

  return useMutation({
    mutationFn: async ({ ids, softDelete }: { ids: number[]; softDelete: boolean }) => {
      const response = await productService.bulkDelete(ids, softDelete);
      if (!response.success) {
        throw new Error(response.errorMessage || "Failed to delete products");
      }
      return response.data;
    },
    onMutate: ({ ids }) => {
      setLoading(true);
      // Optimistic update - remove from list
      queryClient.setQueryData(productQueryKeys.lists(), (oldData: ProductListDto[] | undefined) => oldData?.filter((product) => !ids.includes(product.productID)) || []);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
      // Remove individual queries
      variables.ids.forEach((id) => {
        queryClient.removeQueries({ queryKey: productQueryKeys.detail(id) });
      });

      showAlert("Success", `${variables.ids.length} products deleted successfully`, "success");
    },
    onError: (error: Error) => {
      queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
      showAlert("Error", error.message, "error");
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};
