import GenericAdvanceSearch from "@/components/GenericDialog/GenericAdvanceSearch";
import { ProductOverviewDto } from "@/interfaces/InventoryManagement/ProductOverviewDto";
import { productOverviewService } from "@/services/InventoryManagementService/inventoryManagementService";
import React, { useEffect, useState } from "react";

interface ProductOverviewSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (product: ProductOverviewDto) => void;
  selectedDeptID: number; // Pass the selected department ID
}

const ProductOverviewSearch: React.FC<ProductOverviewSearchProps> = ({ open, onClose, onSelect, selectedDeptID }) => {
  const [products, setProducts] = useState<ProductOverviewDto[]>([]);

  useEffect(() => {
    if (open && selectedDeptID !== 0) {
      fetchItems(selectedDeptID)
        .then((fetchedProducts) => {
          setProducts(fetchedProducts);
        })
        .catch((error) => {
          console.error("Error fetching products:", error);
        });
    }
  }, [open, selectedDeptID]);

  const fetchItems = async (deptID: number) => {
    try {
      const items = await productOverviewService.getAll();
      // Filter products by selected department ID
      const filteredProducts = items.data.filter((product: ProductOverviewDto) => product.deptID === deptID);
      return filteredProducts || [];
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  };

  const updateActiveStatus = async (id: number, status: boolean) => {
    try {
      const result = await productOverviewService.updateActiveStatus(id, status);
      return result.success;
    } catch (error) {
      console.error("Error updating product status:", error);
      return false;
    }
  };

  const getItemId = (item: ProductOverviewDto) => item.pvID;
  const getItemActiveStatus = (item: ProductOverviewDto) => item.rActiveYN === "Y";

  const columns = [
    { key: "serialNumber", header: "Sl.No", visible: true, sortable: true },
    { key: "productCode", header: "Product Code", visible: true },
    { key: "fsbCode", header: "FSB Code", visible: true },
    { key: "stockLevel", header: "Stock Level", visible: true },
    { key: "productName", header: "Product Name", visible: true },
    {
      key: "location",
      header: "Location",
      visible: true,
      render: (product: ProductOverviewDto) => {
        const locationParts = [product.productLocation || "", product.rackNo || "", product.shelfNo || ""].filter((part) => part);

        return locationParts.join(" - ");
      },
    },
  ];

  return (
    <GenericAdvanceSearch<ProductOverviewDto>
      open={open}
      onClose={onClose}
      onSelect={onSelect}
      title="Product Overview Search"
      fetchItems={() => fetchItems(selectedDeptID)}
      updateActiveStatus={updateActiveStatus}
      columns={columns}
      getItemId={getItemId}
      getItemActiveStatus={getItemActiveStatus}
      searchPlaceholder="Enter product code or name"
      isActionVisible={true}
      isEditButtonVisible={true}
      isStatusVisible={true}
    />
  );
};

export default ProductOverviewSearch;
