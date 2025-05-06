import GenericAdvanceSearch from "@/components/GenericDialog/GenericAdvanceSearch";
import { ProductListDto } from "@/interfaces/InventoryManagement/ProductListDto";
import { productListService } from "@/services/InventoryManagementService/inventoryManagementService";
import React from "react";

interface ProductListSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (productListDto: ProductListDto) => void;
}

const ProductListSearch: React.FC<ProductListSearchProps> = ({ open, onClose, onSelect }) => {
  const fetchItems = () => productListService.getAll().then((result) => result.data || []);

  const updateActiveStatus = async (id: number, status: boolean) => {
    const result = await productListService.updateActiveStatus(id, status);
    return result.success;
  };

  const getItemId = (item: ProductListDto) => item.productID;
  const getItemActiveStatus = (item: ProductListDto) => item.rActiveYN === "Y";

  const columns = [
    { key: "serialNumber", header: "Sl No", visible: true },
    { key: "productCode", header: "Product Code", visible: true },
    { key: "productName", header: "Product Name", visible: true },
    { key: "manufacturerName", header: "Manufacturer", visible: true },
    { key: "productLocation", header: "Location", visible: true },
    { key: "expiry", header: "Expiry Date", visible: true },
    { key: "rNotes", header: "Remarks", visible: true },
  ];

  return (
    <GenericAdvanceSearch
      open={open}
      onClose={onClose}
      onSelect={onSelect}
      title="Product List"
      fetchItems={fetchItems}
      updateActiveStatus={updateActiveStatus}
      columns={columns}
      getItemId={getItemId}
      getItemActiveStatus={getItemActiveStatus}
      searchPlaceholder="Enter Product name or code"
      isActionVisible={true}
      isEditButtonVisible={true}
      isStatusVisible={true}
    />
  );
};

export default ProductListSearch;
