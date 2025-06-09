import React, { useEffect } from "react";
import { Control, UseFormSetValue } from "react-hook-form";
import { Grid, Paper } from "@mui/material";
import DepartmentInfoChange from "../../CommonPage/DepartmentInfoChange";
import { PurchaseOrderHeaderProps } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { purchaseOrderMastServices } from "@/services/InventoryManagementService/PurchaseOrderService/PurchaseOrderMastServices";
import { useAlert } from "@/providers/AlertProvider";
import { ProductSearch } from "../../CommonPage/Product/ProductSearchForm";
import { ProductSearchResult } from "@/interfaces/InventoryManagement/Product/ProductSearch.interface";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";

interface PurchaseOrderHeaderFormProps extends PurchaseOrderHeaderProps {
  control: Control<any>;
  setValue: UseFormSetValue<any>;
}

const PurchaseOrderHeader: React.FC<PurchaseOrderHeaderFormProps> = ({ control, setValue, handleDepartmentChange }) => {
  const { showAlert } = useAlert();
  const dropdownValues = useDropdownValues(["department"]);
  const departmentName = control._formValues.purchaseOrderMast.fromDeptName;
  const departmentId = control._formValues.purchaseOrderMast.fromDeptID;
  const approvedDisable = control._formValues.purchaseOrderMast.disableApprovedFields || false;

  const handleProductSelect = (product: ProductSearchResult | null) => {
    if (departmentId === 0) {
      showAlert("Please select a department first", "", "warning");
      return;
    }
    if (product) {
      setValue("selectedProduct", product);
    }
  };

  const fetchPOCode = async (departmentId: number) => {
    const response = await purchaseOrderMastServices.getPOCode(departmentId);
    if (response.success && response.data) {
      setValue("purchaseOrderMast.pOCode", response.data);
    } else {
      showAlert("error", "Failed to fetch PO Code", "error");
    }
  };

  useEffect(() => {
    if (departmentId > 0) {
      fetchPOCode(departmentId);
      setValue("purchaseOrderMast.pODate", new Date().toLocaleDateString("en-GB"));
    }
  }, [departmentId, setValue]);

  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <DepartmentInfoChange deptName={departmentName || "Select Department"} handleChangeClick={handleDepartmentChange} />
        </Grid>
      </Grid>
      <Grid container spacing={2} marginTop={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}>
          <FormField control={control} name="purchaseOrderMast.pOCode" type="text" label="Purchase Order Code" disabled required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}>
          <FormField control={control} name="purchaseOrderMast.pODate" type="text" label="Date" disabled required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}>
          <FormField
            control={control}
            name="purchaseOrderMast.supplierID"
            type="select"
            label="Supplier Name"
            options={dropdownValues.department || []}
            required
            disabled={approvedDisable}
            onChange={(value) => {
              const selected = dropdownValues.department?.find((opt) => Number(opt.value) === Number(value));
              if (selected) {
                setValue("purchaseOrderMast.supplierName", selected.label);
              }
              return value;
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}>
          <FormField control={control} name="purchaseOrderMast.pOSActionNo" type="text" label="Sanction No" disabled={approvedDisable} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}>
          <FormField control={control} name="purchaseOrderMast.pOApprovedNo" type="text" label="Approved No" disabled={approvedDisable} />
        </Grid>
      </Grid>
      <Grid container spacing={2} marginTop={2}>
        <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 3 }}>
          <ProductSearch onProductSelect={handleProductSelect} label="Search Product" placeholder="Search product..." initialSelection={null} />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PurchaseOrderHeader;
