import { createEntityHook } from "@/hooks/Common/useGenericEntity";
import { ProductTaxListDto } from "@/interfaces/InventoryManagement/ProductTaxListDto";
import { productTaxService } from "@/services/InventoryManagementService/inventoryManagementService";

const useGenericProductTaxList = createEntityHook<ProductTaxListDto>(productTaxService, "pTaxID");

export const useProductTaxList = () => {
  const hook = useGenericProductTaxList();

  return {
    productTaxList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchProductTaxList: hook.fetchEntityList,
    getProductTaxById: hook.getEntityById,
    saveProductTax: hook.saveEntity,
    deleteProductTax: hook.deleteEntity,
    updateProductTaxStatus: hook.updateEntityStatus,
    getNextCode: hook.getNextCode,
  };
};
