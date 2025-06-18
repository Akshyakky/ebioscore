import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import useContactMastByCategory from "@/hooks/hospitalAdministration/useContactMastByCategory";
import { ProductSearchResult } from "@/interfaces/InventoryManagement/Product/ProductSearch.interface";
import { useAlert } from "@/providers/AlertProvider";
import { Add as AddIcon, Today as TodayIcon } from "@mui/icons-material";
import { Card, CardContent, Divider, Grid, Paper, Typography } from "@mui/material";
import React from "react";
import { Control, UseFormSetValue } from "react-hook-form";
import { ProductSearch } from "../../CommonPage/Product/ProductSearchForm";

interface PurchaseOrderHeaderProps {
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  onProductSelect: (product: ProductSearchResult | null) => void;
  approvedDisable: boolean;
}

const PurchaseOrderHeader: React.FC<PurchaseOrderHeaderProps> = ({ control, setValue, onProductSelect, approvedDisable }) => {
  const { showAlert } = useAlert();
  const { contacts: suppliers } = useContactMastByCategory({ consValue: "PHY" });
  console.log(suppliers);
  const departmentId = control._formValues.fromDeptID;

  const handleProductSelectLocal = (product: ProductSearchResult | null) => {
    if (departmentId === 0) {
      showAlert("Warning", "Please select a department first", "warning");
      return;
    }
    onProductSelect(product);
  };

  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <Grid size={{ xs: 12 }}>
        <Card variant="outlined" sx={{ borderLeft: "3px solid #1976d2" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
              <TodayIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              Basic Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2} marginTop={2}>
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}>
                <FormField control={control} name="pOCode" type="text" label="Purchase Order Code" disabled required />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}>
                <FormField control={control} name="pODate" type="text" label="Date" disabled required />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}>
                <FormField
                  control={control}
                  name="supplierID"
                  type="select"
                  label="Supplier Name"
                  options={suppliers}
                  required
                  disabled={approvedDisable}
                  onChange={(value) => {
                    const selected = suppliers.find((opt) => Number(opt.value) === Number(value.value));
                    if (selected) {
                      setValue("supplierName", selected.label);
                      setValue("supplierID", selected.conID);
                    }
                    return value;
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}>
                <FormField control={control} name="pOSActionNo" type="text" label="Sanction No" disabled={approvedDisable} />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}>
                <FormField control={control} name="pOApprovedNo" type="text" label="Approved No" disabled={approvedDisable} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      {!approvedDisable && (
        <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
          <Card variant="outlined" sx={{ borderLeft: "3px solid #2e7d32" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="#2e7d32" fontWeight="bold">
                <AddIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                Add Products
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2} marginTop={2}>
                <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
                  <ProductSearch
                    onProductSelect={handleProductSelectLocal}
                    label="Search Product"
                    placeholder="Search product..."
                    initialSelection={null}
                    disabled={approvedDisable}
                    className="product-search-field"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Paper>
  );
};

export default PurchaseOrderHeader;
