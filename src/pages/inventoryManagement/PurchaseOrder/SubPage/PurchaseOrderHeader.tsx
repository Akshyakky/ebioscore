import FormField from "@/components/FormField/FormField";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { PurchaseOrderMastDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import { Grid, Paper } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import DepartmentInfoChange from "../../CommonPage/DepartmentInfoChange";
import { ProductListDto } from "@/interfaces/InventoryManagement/ProductListDto";
import { showAlert } from "@/utils/Common/showAlert";
import { purchaseOrderMastServices } from "@/services/InventoryManagementService/PurchaseOrderService/PurchaseOrderMastServices";
import { productListService } from "@/services/InventoryManagementService/inventoryManagementService";

interface PurchaseOrderHeaderProps {
  purchaseOrderData?: PurchaseOrderMastDto;
  handleDepartmentChange: () => void;
  onFormChange: (fieldName: keyof PurchaseOrderMastDto, value: any) => void;
  isSubmitted: boolean;
  handleSelectedProduct: (product: ProductListDto) => void;
}
const PurchaseOrderHeader: React.FC<PurchaseOrderHeaderProps> = ({ purchaseOrderData, handleDepartmentChange, onFormChange, handleSelectedProduct, isSubmitted }) => {
  const dropdownValues = useDropdownValues(["department"]);
  const [productOptions, setProductOptions] = useState<ProductListDto[]>([]);
  const [productName, setProductName] = useState<string>("");

  const handleProductSelect = useCallback(async (selectedProductString: string) => {
    const [selectedProductCode] = selectedProductString.split(" - ");
    const selectedProduct = productOptions.find((product) => product.productCode === selectedProductCode);
    console.log(selectedProduct);
    if (selectedProduct) {
      console.log("Selected Prod", selectedProduct);
      handleSelectedProduct(selectedProduct);
      setProductName("");
    }
  }, []);
  useEffect(() => {
    if (purchaseOrderData?.fromDeptName) {
      const fetchPOCode = async (deptName: string) => {
        const response = await purchaseOrderMastServices.getPOCode(deptName);
        if (response.success && response.data) {
          onFormChange("pOCode", response.data);
        } else {
          showAlert("error", "Failed to fetch PO Code", "error");
        }
      };
      const fetchProducts = async () => {
        try {
          const response = await productListService.getAll();
          console.log("Raw product response:", response);

          const productList = Array.isArray(response.data) ? response.data : [];
          const activeProducts = productList.filter((product) => product.rActiveYN === "Y");
          console.log("Active products:", activeProducts);
          setProductOptions(activeProducts);
        } catch (error) {
          console.error("Error fetching products:", error);
          showAlert("error", "Failed to fetch products", "error");
        }
      };
      fetchPOCode(purchaseOrderData.fromDeptName.substring(0, 3).toUpperCase());
      fetchProducts();
      onFormChange("pODate", new Date().toLocaleDateString("en-GB"));
    }
  }, [purchaseOrderData?.fromDeptID]);

  const fetchProductSuggestions = useCallback(
    async (searchTerm: string) => {
      if (searchTerm.trim() === "") {
        return productOptions.map((item) => `${item.productCode} - ${item.productName}`);
      }

      if (!searchTerm.trim()) return [];

      try {
        return productOptions
          .filter((item) => item.productCode?.toLowerCase().includes(searchTerm.toLowerCase()) || item.productName?.toLowerCase().includes(searchTerm.toLowerCase()))
          .map((item) => `${item.productCode} - ${item.productName}`);
      } catch (error) {
        console.error("Error fetching product suggestions:", error);
        return [];
      }
    },
    [productOptions]
  );

  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <DepartmentInfoChange deptName={purchaseOrderData?.fromDeptName || "Select Department"} handleChangeClick={handleDepartmentChange} />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
          <FormField
            type="text"
            label="Purchase Order Code"
            value={purchaseOrderData?.pOCode || ""}
            onChange={(e) => onFormChange("pOCode", e.target.value)}
            isSubmitted={isSubmitted}
            name="pOCode"
            ControlID="pOCode"
            isMandatory
            disabled
            gridProps={{ sm: 12 }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
          <FormField
            type="text"
            label="Date"
            value={purchaseOrderData?.pODate || ""}
            onChange={(e) => onFormChange("pODate", e.target.value)}
            isSubmitted={isSubmitted}
            name="pODate"
            ControlID="pODate"
            isMandatory
            disabled
            gridProps={{ sm: 12 }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
          <FormField
            type="select"
            label="Supplier Name"
            value={purchaseOrderData?.supplierID || ""}
            onChange={(e) => onFormChange("supplierID", e.target.value)}
            isSubmitted={isSubmitted}
            name="supplierID"
            ControlID="supplierID"
            options={dropdownValues.department}
            isMandatory
            gridProps={{ sm: 12 }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
          <FormField
            type="text"
            label="Sanction No"
            value={purchaseOrderData?.pOSActionNo || ""}
            onChange={(e) => onFormChange("pOSActionNo", e.target.value)}
            isSubmitted={isSubmitted}
            name="pOSActionNo"
            ControlID="pOSActionNo"
            gridProps={{ sm: 12 }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
          <FormField
            type="text"
            label="Approved No"
            value={purchaseOrderData?.pOApprovedNo || ""}
            onChange={(e) => onFormChange("pOApprovedNo", e.target.value)}
            isSubmitted={isSubmitted}
            name="pOApprovedNo"
            ControlID="pOApprovedNo"
            gridProps={{ sm: 12 }}
          />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <FormField
            ControlID="productName"
            label="Search Product"
            name="productCode"
            type="autocomplete"
            placeholder="Add product to the grid"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            fetchSuggestions={fetchProductSuggestions}
            onSelectSuggestion={handleProductSelect}
            gridProps={{ xs: 12 }}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PurchaseOrderHeader;
