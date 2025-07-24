// src/pages/billing/Billing/MainPage/components/ItemsSection.tsx
import { BillProductsDto } from "@/interfaces/Billing/BillingDto";
import { ProductBatchDto } from "@/interfaces/InventoryManagement/ProductBatchDto";
import { BatchSelectionDialog, useBatchSelection } from "@/pages/inventoryManagement/CommonPage/BatchSelectionDialog";
import { Edit as EditIcon, MedicalServices as MedicalServicesIcon, ShoppingCart as ShoppingCartIcon } from "@mui/icons-material";
import { alpha, Autocomplete, Box, Card, Chip, CircularProgress, TextField, ToggleButton, ToggleButtonGroup, Typography, useTheme } from "@mui/material";
import React, { useCallback, useMemo, useState } from "react";
import { Control, useFieldArray, UseFormSetValue } from "react-hook-form";
import { BillingFormData, DropdownOption } from "../types";
import { filterProducts, filterServices } from "../utils/billingUtils";
import { ProductGrid } from "./grids/ProductGrid";
import { ServiceGrid } from "./grids/ServiceGrid";

interface ItemsSectionProps {
  control: Control<BillingFormData>;
  itemMode: "service" | "product";
  setItemMode: (mode: "service" | "product") => void;
  services: any[];
  products: any[];
  loadingServices: boolean;
  loadingProducts: boolean;
  isDepartmentSelected: boolean;
  selectedDeptId: number | null;
  selectedDeptName: string;
  openDepartmentDialog: () => void;
  showAlert: (title: string, message: string, type: "success" | "error" | "warning" | "info") => void;
  watchedBillServices: any[];
  watchedBillProducts: any[];
  calculateDiscountFromPercent: (amount: number, percentage: number) => number;
  billingService: any;
  physicians: DropdownOption[];
  setValue: UseFormSetValue<BillingFormData>;
}

export const ItemsSection: React.FC<ItemsSectionProps> = ({
  control,
  itemMode,
  setItemMode,
  services,
  products,
  loadingServices,
  loadingProducts,
  isDepartmentSelected,
  selectedDeptId,
  selectedDeptName,
  openDepartmentDialog,
  showAlert,
  watchedBillServices,
  watchedBillProducts,
  calculateDiscountFromPercent,
  billingService,
  physicians,
  setValue,
}) => {
  const theme = useTheme();
  const [serviceSearchTerm, setServiceSearchTerm] = useState("");
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const { isDialogOpen: isBatchSelectionDialogOpen, availableBatches, openDialog: openBatchDialog, closeDialog: closeBatchDialog } = useBatchSelection();
  const {
    append: appendService,
    remove: removeService,
    update: updateService,
  } = useFieldArray({
    control,
    name: "billServices",
  });

  const {
    append: appendProduct,
    remove: removeProduct,
    update: updateProduct,
  } = useFieldArray({
    control,
    name: "billProducts",
  });

  // Filter services and products
  const filteredServices = useMemo(() => filterServices(services, serviceSearchTerm), [serviceSearchTerm, services]);

  const filteredProducts = useMemo(() => filterProducts(products, productSearchTerm), [productSearchTerm, products]);

  const handleBatchSelect = useCallback(
    (batch: ProductBatchDto) => {
      const selectedProduct: BillProductsDto = {
        productID: batch.productID,
        productName: batch.productName,
        batchNo: batch.batchNo,
        expiryDate: batch.expiryDate,
        grnDetID: batch.grnDetID,
        deptID: batch.deptID,
        deptName: batch.deptName,
        selectedQuantity: 1,
        productQOH: batch.productQOH,
        hValue: batch.sellingPrice,
        hospPercShare: 0,
        hValDisc: 0,
        packID: 0,
        packName: "",
        rActiveYN: "Y",
      };
      appendProduct(selectedProduct);
      showAlert("Success", `Batch "${batch.batchNo}" added`, "success");
      closeBatchDialog();
    },
    [appendProduct, showAlert, closeBatchDialog]
  );
  // Handle service selection
  const handleServiceSelect = useCallback(
    async (service: any | null) => {
      if (service) {
        try {
          const response = await billingService.getBillingServiceById(service.chargeID);
          appendService(response.data);
          setSelectedService(null);
          setServiceSearchTerm("");
          showAlert("Success", `Service "${service.chargeDesc}" added`, "success");
        } catch (error) {
          showAlert("Error", "Failed to add service", "error");
        }
      }
    },
    [appendService, showAlert, billingService]
  );

  // Handle product selection
  const handleProductSelect = useCallback(
    async (product: any | null) => {
      if (!product) return;

      if (!isDepartmentSelected) {
        showAlert("Warning", "Please select a department first", "warning");
        openDepartmentDialog();
        return;
      }

      try {
        const response = await billingService.getBatchNoProduct(product.productID, selectedDeptId);

        if (response.success && response.data) {
          const batches = response.data;

          if (batches.length === 0) {
            showAlert("Warning", "No batches available for this product", "warning");
          } else if (batches.length === 1) {
            appendProduct({
              ...batches[0],
              selectedQuantity: 1,
              hValue: batches[0].sellingPrice,
              hospPercShare: 0,
              hValDisc: 0,
              packID: 0,
              packName: "",
              rActiveYN: "Y",
            });
            showAlert("Success", `Product "${product.productName}" added`, "success");
          } else {
            openBatchDialog(batches);
          }
        }

        setSelectedProduct(null);
        setProductSearchTerm("");
      } catch (error) {
        showAlert("Error", "Failed to fetch product batches", "error");
      }
    },
    [appendProduct, showAlert, isDepartmentSelected, selectedDeptId, openDepartmentDialog, billingService, openBatchDialog]
  );

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        transition: "box-shadow 0.3s ease",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        },
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.04),
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <ToggleButtonGroup
            value={itemMode}
            exclusive
            onChange={(_event, newMode) => {
              if (newMode !== null) {
                if (newMode === "product" && !isDepartmentSelected) {
                  openDepartmentDialog();
                }
                setItemMode(newMode);
              }
            }}
            size="small"
          >
            <ToggleButton value="service">
              <MedicalServicesIcon sx={{ mr: 1, fontSize: 18 }} />
              Services
            </ToggleButton>
            <ToggleButton value="product">
              <ShoppingCartIcon sx={{ mr: 1, fontSize: 18 }} />
              Products
            </ToggleButton>
          </ToggleButtonGroup>

          {itemMode === "product" && (
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" color="text.secondary">
                {isDepartmentSelected ? " Department: " : "Department Not Selected"}
              </Typography>
              <Chip label={selectedDeptName} size="small" color="primary" variant="outlined" onDelete={openDepartmentDialog} deleteIcon={<EditIcon fontSize="small" />} />
            </Box>
          )}
        </Box>

        <Box display="flex" gap={2} alignItems="center">
          {/* Item count chips */}
          {itemMode === "service" && watchedBillServices.length > 0 && (
            <Chip label={`${watchedBillServices.length} ${watchedBillServices.length === 1 ? "Service" : "Services"}`} variant="outlined" color="primary" size="small" />
          )}
          {itemMode === "product" && watchedBillProducts.length > 0 && (
            <Chip label={`${watchedBillProducts.length} ${watchedBillProducts.length === 1 ? "Product" : "Products"}`} variant="outlined" color="primary" size="small" />
          )}

          {/* Search autocomplete */}
          {itemMode === "service" ? (
            <Autocomplete
              value={selectedService}
              onChange={(_event, newValue) => handleServiceSelect(newValue)}
              inputValue={serviceSearchTerm}
              onInputChange={(_event, newInputValue) => setServiceSearchTerm(newInputValue)}
              options={filteredServices}
              getOptionLabel={(option) => `${option.chargeCode} - ${option.chargeDesc}`}
              loading={loadingServices}
              sx={{ width: 400 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search and add service"
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingServices ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box>
                    <Typography variant="body1">
                      {option.chargeCode} - {option.chargeDesc}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Type: {option.chargeType} | Status: {option.chargeStatus}
                    </Typography>
                  </Box>
                </Box>
              )}
              noOptionsText="No services found"
            />
          ) : (
            <Autocomplete
              value={selectedProduct}
              onChange={(_event, newValue) => handleProductSelect(newValue)}
              inputValue={productSearchTerm}
              onInputChange={(_event, newInputValue) => setProductSearchTerm(newInputValue)}
              options={filteredProducts}
              getOptionLabel={(option) => `${option.productCode} - ${option.productName}`}
              loading={loadingProducts}
              sx={{ width: 400 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search and add product"
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingProducts ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box>
                    <Typography variant="body1">
                      {option.productCode} - {option.productName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Price: ₹{option.unitPrice}
                    </Typography>
                  </Box>
                </Box>
              )}
              noOptionsText="No products found"
            />
          )}
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ p: 0 }}>
        {itemMode === "service" ? (
          <ServiceGrid
            services={watchedBillServices}
            control={control}
            updateService={updateService}
            removeService={removeService}
            calculateDiscountFromPercent={calculateDiscountFromPercent}
            showAlert={showAlert}
            physicians={physicians}
            setValue={setValue}
          />
        ) : (
          <ProductGrid
            products={watchedBillProducts}
            control={control}
            updateProduct={updateProduct}
            removeProduct={removeProduct}
            calculateDiscountFromPercent={calculateDiscountFromPercent}
            showAlert={showAlert}
          />
        )}
      </Box>
      <BatchSelectionDialog open={isBatchSelectionDialogOpen} onClose={closeBatchDialog} onSelect={handleBatchSelect} data={availableBatches} />
    </Card>
  );
};
