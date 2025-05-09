import { Grid, Paper } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import DepartmentInfoChange from "../../CommonPage/DepartmentInfoChange";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import FormField from "@/components/FormField/FormField";
import { initialPOMastDto, PurchaseOrderHeaderProps } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import { AppDispatch } from "@/store";
import { useDispatch } from "react-redux";
import { updatePurchaseOrderMastField, setSelectedProduct } from "@/store/features/purchaseOrder/purchaseOrderSlice";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { ProductListDto } from "@/interfaces/InventoryManagement/ProductListDto";
import { purchaseOrderMastServices } from "@/services/InventoryManagementService/PurchaseOrderService/PurchaseOrderMastServices";
import { showAlert } from "@/utils/Common/showAlert";
import { productListService } from "@/services/InventoryManagementService/inventoryManagementService";

const PurchaseOrderHeader: React.FC<PurchaseOrderHeaderProps> = ({ handleDepartmentChange }) => {
  const dispatch = useDispatch<AppDispatch>();
  const dropdownValues = useDropdownValues(["department"]);
  const departmentInfo = useSelector((state: RootState) => state.purchaseOrder.departmentInfo) ?? { departmentId: 0, departmentName: "" };
  const { departmentId, departmentName } = departmentInfo;

  const purchaseOrderMastData = useSelector((state: RootState) => state.purchaseOrder.purchaseOrderMastData) ?? initialPOMastDto;
  const { pOCode, pODate, supplierID, pOSActionNo, pOApprovedNo } = purchaseOrderMastData;
  const approvedDisable = useSelector((state: RootState) => state.purchaseOrder.disableApprovedFields) ?? false;
  const [productOptions, setProductOptions] = useState<ProductListDto[]>([]);
  const [productName, setProductName] = useState<string>("");

  const handleProductSelect = useCallback(
    (selectedProductString: string) => {
      if (departmentId === 0) {
        showAlert("Please select a department first", "", "warning");
        return;
      }
      const [selectedProductCode] = selectedProductString.split(" - ");
      const selectedProduct = productOptions.find((product) => product.productCode === selectedProductCode);

      if (selectedProduct) {
        dispatch(setSelectedProduct(selectedProduct));
      }
    },
    [productOptions, dispatch]
  );
  const fetchPOCode = async (departmentId: number) => {
    const response = await purchaseOrderMastServices.getPOCode(departmentId);
    if (response.success && response.data) {
      dispatch(updatePurchaseOrderMastField({ field: "pOCode", value: response.data }));
    } else {
      showAlert("error", "Failed to fetch PO Code", "error");
    }
  };
  const fetchProducts = async () => {
    try {
      const response = await productListService.getAll();

      const productList = Array.isArray(response.data) ? response.data : [];
      const activeProducts = productList.filter((product) => product.rActiveYN === "Y");
      setProductOptions(activeProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      showAlert("error", "Failed to fetch products", "error");
    }
  };
  useEffect(() => {
    if (departmentId > 0) {
      fetchPOCode(departmentId);
      fetchProducts();
      dispatch(updatePurchaseOrderMastField({ field: "pODate", value: new Date().toLocaleDateString("en-GB") }));
    }
  }, [departmentId]);

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
        <Grid size={{ xs: 12 }}>
          <DepartmentInfoChange deptName={departmentName || "Select Department"} handleChangeClick={handleDepartmentChange} />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <FormField
          type="text"
          label="Purchase Order Code"
          value={pOCode}
          onChange={(e) => {
            dispatch(updatePurchaseOrderMastField({ field: "pOCode", value: e.target.value }));
          }}
          name="pOCode"
          ControlID="pOCode"
          isMandatory
          disabled
          gridProps={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
        />
        <FormField
          type="text"
          label="Date"
          value={pODate}
          onChange={(e) => {
            dispatch(updatePurchaseOrderMastField({ field: "pODate", value: e.target.value }));
          }}
          name="pODate"
          ControlID="pODate"
          isMandatory
          disabled
          gridProps={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
        />
        <FormField
          type="select"
          label="Supplier Name"
          value={supplierID}
          onChange={(e) => {
            const value = Number(e.target.value);
            const selected = dropdownValues?.department?.find((opt) => Number(opt.value) === value);
            if (selected) {
              dispatch(updatePurchaseOrderMastField({ field: "supplierName", value: selected.label }));
            }
            dispatch(updatePurchaseOrderMastField({ field: "supplierID", value: e.target.value }));
          }}
          name="supplierID"
          ControlID="supplierID"
          options={dropdownValues.department || []}
          isMandatory
          disabled={approvedDisable}
          gridProps={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
        />
        <FormField
          type="text"
          label="Sanction No"
          value={pOSActionNo}
          onChange={(e) => {
            dispatch(updatePurchaseOrderMastField({ field: "pOSActionNo", value: e.target.value }));
          }}
          name="pOSActionNo"
          ControlID="pOSActionNo"
          disabled={approvedDisable}
          gridProps={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
        />
        <FormField
          type="text"
          label="Approved No"
          value={pOApprovedNo}
          onChange={(e) => {
            dispatch(updatePurchaseOrderMastField({ field: "pOApprovedNo", value: e.target.value }));
          }}
          name="pOApprovedNo"
          ControlID="pOApprovedNo"
          disabled={approvedDisable}
          gridProps={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
        />
      </Grid>
      <Grid container spacing={2}>
        {!approvedDisable && (
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
            disabled={approvedDisable}
            gridProps={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
          />
        )}
      </Grid>
    </Paper>
  );
};

export default PurchaseOrderHeader;
