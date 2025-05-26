import { IndentSaveRequestDto } from "@/interfaces/InventoryManagement/IndentProductDto";
import { ProductGroupDto, ProductSubGroupDto, ProductUnitDto } from "@/interfaces/InventoryManagement/ProductGroup-Unit-SubGroup";
import { ProductListDto } from "@/interfaces/InventoryManagement/ProductListDto";
import { ProductOverviewDto } from "@/interfaces/InventoryManagement/ProductOverviewDto";
import { ProductTaxListDto } from "@/interfaces/InventoryManagement/ProductTaxListDto";
import { PurchaseOrderMastDto, purchaseOrderSaveDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import { createEntityService } from "@/utils/Common/serviceFactory";
import { useMemo } from "react";

export const productListService = useMemo(() => createEntityService<ProductListDto>("ProductMaster", "inventoryManagementURL"), []);
export const productSubGroupService = useMemo(() => createEntityService<ProductSubGroupDto>("ProductSubGroup", "inventoryManagementURL"), []);
export const productGroupService = useMemo(() => createEntityService<ProductGroupDto>("ProductGroup", "inventoryManagementURL"), []);
export const productUnitService = useMemo(() => createEntityService<ProductUnitDto>("ProductUnit", "inventoryManagementURL"), []);
export const productTaxService = useMemo(() => createEntityService<ProductTaxListDto>("ProductTaxList", "inventoryManagementURL"), []);
export const productOverviewService = useMemo(() => createEntityService<ProductOverviewDto>("ProductOverview", "inventoryManagementURL"), []);
export const purchaseOrderMastService = useMemo(() => createEntityService<PurchaseOrderMastDto>("PurchaseOrderMast", "inventoryManagementURL"), []);
export const indentProductMastService = useMemo(() => createEntityService<IndentSaveRequestDto>("IndentMast", "inventoryManagementURL"), []);
export const purchaseOrderService = useMemo(() => createEntityService<purchaseOrderSaveDto>("PurchaseOrder", "inventoryManagementURL"), []);
export const indentProductService = useMemo(() => createEntityService<IndentSaveRequestDto>("IndentProduct", "inventoryManagementURL"), []);
