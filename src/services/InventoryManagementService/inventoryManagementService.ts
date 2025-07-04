import { GrnDetailDto, GrnMastDto } from "@/interfaces/InventoryManagement/GRNDto";
import { ProductGroupDto, ProductSubGroupDto, ProductUnitDto } from "@/interfaces/InventoryManagement/ProductGroup-Unit-SubGroup";
import { ProductListDto } from "@/interfaces/InventoryManagement/ProductListDto";
import { ProductOverviewDto } from "@/interfaces/InventoryManagement/ProductOverviewDto";
import { ProductTaxListDto } from "@/interfaces/InventoryManagement/ProductTaxListDto";
import { PurchaseOrderMastDto, purchaseOrderSaveDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import { createEntityService } from "@/utils/Common/serviceFactory";

export const productListService = createEntityService<ProductListDto>("ProductMaster", "inventoryManagementURL");
export const productSubGroupService = createEntityService<ProductSubGroupDto>("ProductSubGroup", "inventoryManagementURL");
export const productGroupService = createEntityService<ProductGroupDto>("ProductGroup", "inventoryManagementURL");
export const productUnitService = createEntityService<ProductUnitDto>("ProductUnit", "inventoryManagementURL");
export const productTaxService = createEntityService<ProductTaxListDto>("ProductTaxList", "inventoryManagementURL");
export const productOverviewService = createEntityService<ProductOverviewDto>("ProductOverview", "inventoryManagementURL");
export const purchaseOrderMastService = createEntityService<PurchaseOrderMastDto>("PurchaseOrderMast", "inventoryManagementURL");
export const purchaseOrderService = createEntityService<purchaseOrderSaveDto>("PurchaseOrder", "inventoryManagementURL");
export const grnMastService = createEntityService<GrnMastDto>("GrnMast", "inventoryManagementURL");
export const grnDetailService = createEntityService<GrnDetailDto>("GrnDetail", "inventoryManagementURL");
