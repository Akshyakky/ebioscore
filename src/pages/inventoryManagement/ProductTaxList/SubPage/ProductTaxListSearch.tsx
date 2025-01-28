import GenericAdvanceSearch from "@/components/GenericDialog/GenericAdvanceSearch";
import { ProductTaxListDto } from "@/interfaces/InventoryManagement/ProductTaxListDto";
import { productTaxService } from "@/services/InventoryManagementService/inventoryManagementService";
import React from "react";

interface ProductTaxListSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (productTax: ProductTaxListDto) => void;
}

const ProductTaxListSearch: React.FC<ProductTaxListSearchProps> = ({ open, onClose, onSelect }) => {
  const fetchItems = async () => {
    try {
      const items = await productTaxService.getAll();
      return items.data || [];
    } catch (error) {
      return [];
    }
  };

  const updateActiveStatus = async (id: number, status: boolean) => {
    try {
      return await productTaxService.updateActiveStatus(id, status);
    } catch (error) {
      console.error("Error updating product tax active status:", error);
      return false;
    }
  };

  const getItemId = (item: ProductTaxListDto) => item.pTaxID;
  const getItemActiveStatus = (item: ProductTaxListDto) => item.rActiveYN === "Y";

  const columns = [
    { key: "serialNumber", header: "Sl.No", visible: true, sortable: true },
    { key: "pTaxCode", header: "Tax Code", visible: true },
    { key: "pTaxName", header: "Tax Name", visible: true },
    { key: "pTaxAmt", header: "Tax Amount", visible: true },
  ];

  return (
    <GenericAdvanceSearch
      open={open}
      onClose={onClose}
      onSelect={onSelect}
      title="PRODUCT TAX LIST"
      fetchItems={fetchItems}
      updateActiveStatus={updateActiveStatus}
      columns={columns}
      getItemId={getItemId}
      getItemActiveStatus={getItemActiveStatus}
      searchPlaceholder="Enter tax code or name"
      isActionVisible={true}
      isEditButtonVisible={true}
      isStatusVisible={true}
    />
  );
};

export default ProductTaxListSearch;
