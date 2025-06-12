import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { ProductOption, ProductSearchResult } from "@/interfaces/InventoryManagement/Product/ProductSearch.interface";
import { ProductListDto } from "@/interfaces/InventoryManagement/ProductListDto";
import { ProductOverviewDto } from "@/interfaces/InventoryManagement/ProductOverviewDto";
import { useAlert } from "@/providers/AlertProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Cancel, ChangeCircleRounded, Info, Save } from "@mui/icons-material";
import { Alert, Box, Card, CardContent, Divider, Grid, Typography } from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { ProductSearch, ProductSearchRef } from "../../CommonPage/Product/ProductSearchForm";
import { useProductOverview } from "../hooks/useProductOverview";

interface ProductOverviewFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  initialData: ProductOverviewDto | null;
  viewOnly?: boolean;
  selectedDepartment: { deptID: number; department: string };
  onChangeDepartment?: () => void;
}

const schema = z.object({
  pvID: z.coerce.number().default(0),
  productID: z.coerce.number().default(0),
  productCode: z.string().min(1, "Product code is required"),
  fsbCode: z.string().default("N"),
  rackNo: z.string().optional(),
  shelfNo: z.string().optional(),
  minLevelUnits: z.coerce.number().min(0, "Must be non-negative").default(0),
  maxLevelUnits: z.coerce.number().min(0, "Must be non-negative").default(0),
  dangerLevelUnits: z.coerce.number().min(0, "Must be non-negative").default(0),
  reOrderLevel: z.coerce.number().min(0, "Must be non-negative").default(0),
  avgDemand: z.coerce.number().min(0, "Must be non-negative").default(0),
  stockLevel: z.coerce.number().min(0, "Must be non-negative").default(0),
  supplierAllocation: z.string().default("N"),
  poStatus: z.string().default("N"),
  deptID: z.coerce.number().default(0),
  department: z.string().optional(),
  defaultYN: z.string().default("N"),
  isAutoIndentYN: z.string().default("N"),
  productLocation: z.string().optional(),
  pLocationID: z.coerce.number().default(0),
  rActiveYN: z.string().default("Y"),
  transferYN: z.string().default("N"),
  rNotes: z.string().optional(),
  productName: z.string().optional(),
  baseUnit: z.string().optional(),
  leadTime: z.coerce.number().min(0, "Must be non-negative").default(0),
  leadTimeUnit: z.string().default("days"),
  avgDemandUnit: z.string().default("days"),
  reOrderQuantity: z.coerce.number().min(0, "Must be non-negative").default(0),
});

type ProductOverviewFormData = z.infer<typeof schema>;

const ProductOverviewForm: React.FC<ProductOverviewFormProps> = ({ open, onClose, initialData, viewOnly = false, selectedDepartment, onChangeDepartment }) => {
  const { setLoading } = useLoading();
  const { showAlert } = useAlert();
  const { saveProductOverview, getProductByCode, convertLeadTimeToDays } = useProductOverview();
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [selectedProductData, setSelectedProductData] = useState<ProductListDto[]>([]);
  const [, setIsProductSelected] = useState(false);
  const [convertedLeadTime, setConvertedLeadTime] = useState<number | null>(null);

  // State for ProductSearch component synchronization
  const [searchInputValue, setSearchInputValue] = useState<string>("");
  const [selectedProductOption, setSelectedProductOption] = useState<ProductOption | null>(null);

  const productSearchRef = useRef<ProductSearchRef>(null);
  const isAddMode = !initialData;
  const { productLocation } = useDropdownValues(["productLocation"]);

  const defaultValues: ProductOverviewFormData = {
    pvID: 0,
    productID: 0,
    productCode: "",
    fsbCode: "N",
    rackNo: "",
    shelfNo: "",
    minLevelUnits: 0,
    maxLevelUnits: 0,
    dangerLevelUnits: 0,
    reOrderLevel: 0,
    avgDemand: 0,
    stockLevel: 0,
    supplierAllocation: "N",
    poStatus: "N",
    deptID: selectedDepartment.deptID,
    department: selectedDepartment.department,
    defaultYN: "N",
    isAutoIndentYN: "N",
    productLocation: "",
    pLocationID: 0,
    rActiveYN: "Y",
    transferYN: "N",
    rNotes: "",
    productName: "",
    baseUnit: "",
    leadTime: 0,
    leadTimeUnit: "days",
    avgDemandUnit: "days",
    reOrderQuantity: 0,
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty, isValid },
  } = useForm<ProductOverviewFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const isAutoIndentYN = useWatch({ control, name: "isAutoIndentYN" });
  const poStatus = useWatch({ control, name: "poStatus" });
  const watchedLeadTime = watch("leadTime");
  const watchedLeadTimeUnit = watch("leadTimeUnit");
  const watchedLocationID = watch("pLocationID");

  useEffect(() => {
    if (watchedLeadTime && watchedLeadTimeUnit) {
      const days = convertLeadTimeToDays(Number(watchedLeadTime), watchedLeadTimeUnit);
      setConvertedLeadTime(days);
    }
  }, [watchedLeadTime, watchedLeadTimeUnit, convertLeadTimeToDays]);

  useEffect(() => {
    if (watchedLocationID) {
      const selectedLocation = productLocation?.find((location) => location.id === watchedLocationID);
      if (selectedLocation) {
        setValue("productLocation", selectedLocation.label, { shouldValidate: true, shouldDirty: false });
      }
    }
  }, [watchedLocationID, productLocation, setValue]);

  useEffect(() => {
    if (initialData) {
      const formData = {
        ...defaultValues,
        ...initialData,
        pvID: Number(initialData.pvID || 0),
        productID: Number(initialData.productID || 0),
        minLevelUnits: Number(initialData.minLevelUnits || 0),
        maxLevelUnits: Number(initialData.maxLevelUnits || 0),
        dangerLevelUnits: Number(initialData.dangerLevelUnits || 0),
        reOrderLevel: Number(initialData.reOrderLevel || 0),
        avgDemand: Number(initialData.avgDemand || 0),
        stockLevel: Number(initialData.stockLevel || 0),
        leadTime: Number(initialData.leadTime || 0),
        reOrderQuantity: Number(initialData.reOrderQuantity || 0),
        pLocationID: Number(initialData.pLocationID || 0),
        deptID: selectedDepartment.deptID,
        department: selectedDepartment.department,
      };
      reset(formData);

      // Set initial product selection for ProductSearch component
      if (initialData.productCode && initialData.productName) {
        const initialProduct: ProductOption = {
          productID: Number(initialData.productID || 0),
          productCode: initialData.productCode,
          productName: initialData.productName,
          productCategory: "",
          rActiveYN: initialData.rActiveYN || "Y",
        };
        setSelectedProductOption(initialProduct);
        setSearchInputValue(initialData.productName || "");

        // Load product details if available
        if (initialData.productCode) {
          handleProductSelection(initialData.productCode);
        }
      }
    } else {
      reset({
        ...defaultValues,
        deptID: selectedDepartment.deptID,
        department: selectedDepartment.department,
      });
      // Clear product search state for new records
      setSelectedProductOption(null);
      setSearchInputValue("");
    }
  }, [initialData, reset, selectedDepartment]);

  const handleProductSelect = (product: ProductSearchResult | null) => {
    if (product) {
      // Update form values with proper triggering
      setValue("productID", product.productID, { shouldValidate: true, shouldDirty: true });
      setValue("productCode", product.productCode || "", { shouldValidate: true, shouldDirty: true });
      setValue("productName", product.productName || "", { shouldValidate: true, shouldDirty: true });
      setValue("pLocationID", product.pLocationID || 0, { shouldValidate: true, shouldDirty: true });
      setValue("rActiveYN", product.rActiveYN || "Y", { shouldValidate: true, shouldDirty: true });
      setValue("transferYN", product.transferYN || "N", { shouldValidate: true, shouldDirty: true });

      // Update ProductSearch component state
      const productOption: ProductOption = {
        productID: product.productID,
        productCode: product.productCode || "",
        productName: product.productName || "",
        productCategory: product.catValue || "",
        rActiveYN: product.rActiveYN || "Y",
      };
      setSelectedProductOption(productOption);
      setSearchInputValue(product.productName || "");

      // Load additional product details and update grid
      if (product.productCode) {
        handleProductSelection(product.productCode);
      }

      // Force form re-render to update display values
      setTimeout(() => {
        setValue("productCode", product.productCode || "", { shouldValidate: false, shouldDirty: false });
        setValue("productName", product.productName || "", { shouldValidate: false, shouldDirty: false });
      }, 0);
    } else {
      // Clear all form values
      setValue("productID", 0, { shouldValidate: true, shouldDirty: true });
      setValue("productCode", "", { shouldValidate: true, shouldDirty: true });
      setValue("productName", "", { shouldValidate: true, shouldDirty: true });
      setValue("pLocationID", 0, { shouldValidate: true, shouldDirty: true });
      setValue("rActiveYN", "Y", { shouldValidate: true, shouldDirty: true });
      setValue("transferYN", "N", { shouldValidate: true, shouldDirty: true });

      // Clear ProductSearch component state
      setSelectedProductOption(null);
      setSearchInputValue("");
      setSelectedProductData([]);
      setIsProductSelected(false);
    }
  };

  const handleProductSelection = useCallback(
    async (selectedProductString: string) => {
      const [selectedProductCode] = selectedProductString.split(" - ");
      setValue("productCode", selectedProductCode || "", { shouldValidate: true, shouldDirty: true });

      try {
        const productDetails = await getProductByCode(selectedProductCode || "");
        if (productDetails) {
          // Update all form fields with proper triggering
          setValue("productID", Number(productDetails.productID || 0), { shouldValidate: true, shouldDirty: true });
          setValue("productName", productDetails.productName || "", { shouldValidate: true, shouldDirty: true });
          setValue("baseUnit", productDetails.baseUnit ? String(productDetails.baseUnit) : "", { shouldValidate: true, shouldDirty: true });

          setSelectedProductData([productDetails]);
          setIsProductSelected(true);

          // Force form to recognize the changes
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      } catch (error) {
        showAlert("Error", "Failed to fetch product details", "error");
      }
    },
    [getProductByCode, setValue, showAlert]
  );

  const onSubmit = async (data: ProductOverviewFormData) => {
    if (viewOnly) return;
    setFormError(null);
    try {
      setIsSaving(true);
      setLoading(true);
      const formData: ProductOverviewDto = {
        pvID: Number(data.pvID),
        productID: Number(data.productID),
        productCode: data.productCode,
        fsbCode: data.fsbCode || "N",
        rackNo: data.rackNo || "",
        shelfNo: data.shelfNo || "",
        minLevelUnits: Number(data.minLevelUnits || 0),
        maxLevelUnits: Number(data.maxLevelUnits || 0),
        dangerLevelUnits: Number(data.dangerLevelUnits || 0),
        reOrderLevel: Number(data.reOrderLevel || 0),
        avgDemand: Number(data.avgDemand || 0),
        stockLevel: Number(data.stockLevel || 0),
        supplierAllocation: data.supplierAllocation || "N",
        poStatus: data.poStatus || "N",
        deptID: selectedDepartment.deptID,
        department: selectedDepartment.department,
        defaultYN: data.defaultYN || "N",
        isAutoIndentYN: data.isAutoIndentYN || "N",
        productLocation: data.productLocation || "",
        pLocationID: Number(data.pLocationID || 0),
        rActiveYN: data.rActiveYN || "Y",
        transferYN: data.transferYN || "N",
        rNotes: data.rNotes || "",
        leadTime: Number(data.leadTime || 0),
        leadTimeUnit: data.leadTimeUnit || "days",
        avgDemandUnit: data.avgDemandUnit || "days",
        reOrderQuantity: Number(data.reOrderQuantity || 0),
        productName: data.productName,
        baseUnit: data.baseUnit,
      };

      const response = await saveProductOverview(formData);
      if (response.success) {
        showAlert("Success", isAddMode ? "Product overview created successfully" : "Product overview updated successfully", "success");
        onClose(true);
      } else {
        throw new Error(response.errorMessage || "Failed to save product overview");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save product overview";
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  const performReset = () => {
    const resetData = initialData
      ? {
          ...defaultValues,
          ...initialData,
          pvID: Number(initialData.pvID || 0),
          productID: Number(initialData.productID || 0),
          minLevelUnits: Number(initialData.minLevelUnits || 0),
          maxLevelUnits: Number(initialData.maxLevelUnits || 0),
          dangerLevelUnits: Number(initialData.dangerLevelUnits || 0),
          reOrderLevel: Number(initialData.reOrderLevel || 0),
          avgDemand: Number(initialData.avgDemand || 0),
          stockLevel: Number(initialData.stockLevel || 0),
          leadTime: Number(initialData.leadTime || 0),
          reOrderQuantity: Number(initialData.reOrderQuantity || 0),
          pLocationID: Number(initialData.pLocationID || 0),
          deptID: selectedDepartment.deptID,
          department: selectedDepartment.department,
        }
      : {
          ...defaultValues,
          deptID: selectedDepartment.deptID,
          department: selectedDepartment.department,
        };

    reset(resetData);
    setFormError(null);
    setSelectedProductData([]);
    setIsProductSelected(false);
    setConvertedLeadTime(null);

    // Reset ProductSearch component state
    if (initialData && initialData.productCode && initialData.productName) {
      const initialProduct: ProductOption = {
        productID: Number(initialData.productID || 0),
        productCode: initialData.productCode,
        productName: initialData.productName,
        productCategory: "",
        rActiveYN: initialData.rActiveYN || "Y",
      };
      setSelectedProductOption(initialProduct);
      setSearchInputValue(initialData.productName || "");
    } else {
      setSelectedProductOption(null);
      setSearchInputValue("");
      // Clear using ref if available
      if (productSearchRef.current) {
        productSearchRef.current.clearSelection();
      }
    }
  };

  const handleReset = () => {
    if (isDirty) {
      setShowResetConfirmation(true);
    } else {
      performReset();
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      setShowCancelConfirmation(true);
    } else {
      onClose();
    }
  };

  const handleResetConfirm = () => {
    performReset();
    setShowResetConfirmation(false);
  };

  const handleCancelConfirm = () => {
    setShowCancelConfirmation(false);
    onClose();
  };

  const leadTimeOptions = [
    { value: "days", label: "Days" },
    { value: "weeks", label: "Weeks" },
    { value: "months", label: "Months" },
    { value: "years", label: "Years" },
  ];

  const dialogTitle = viewOnly ? "View Product Overview Details" : isAddMode ? "Create New Product Overview" : `Edit Product Overview - ${initialData?.productCode}`;

  const dialogActions = viewOnly ? (
    <SmartButton text="Close" onClick={() => onClose()} variant="contained" color="primary" />
  ) : (
    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
      <SmartButton text="Cancel" onClick={handleCancel} variant="outlined" color="inherit" disabled={isSaving} />
      <Box sx={{ display: "flex", gap: 1 }}>
        <SmartButton text="Reset" onClick={handleReset} variant="outlined" color="error" icon={Cancel} disabled={isSaving || (!isDirty && !formError)} />
        <SmartButton
          text={isAddMode ? "Create Product Overview" : "Update Product Overview"}
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          color="primary"
          icon={Save}
          asynchronous={true}
          showLoadingIndicator={true}
          loadingText={isAddMode ? "Creating..." : "Updating..."}
          successText={isAddMode ? "Created!" : "Updated!"}
          disabled={isSaving || !isValid}
        />
      </Box>
    </Box>
  );

  const productColumns: Column<ProductListDto>[] = [
    { key: "productCode", header: "Product Code", visible: true },
    { key: "productName", header: "Product Name", visible: true },
    { key: "catDescription", header: "Category", visible: true },
    { key: "mfName", header: "Form Name", visible: true },
    { key: "manufacturerGenericName", header: "Generic Name", visible: true },
    {
      key: "rActiveYN",
      header: "Status",
      visible: true,
      formatter: (value: string) => (value === "Y" ? "Active" : "Inactive"),
    },
    { key: "pLocationName", header: "Location", visible: true },
  ];

  return (
    <>
      <GenericDialog
        open={open}
        onClose={() => onClose()}
        title={dialogTitle}
        maxWidth="lg"
        fullWidth
        showCloseButton
        disableBackdropClick={!viewOnly && (isDirty || isSaving)}
        disableEscapeKeyDown={!viewOnly && (isDirty || isSaving)}
        actions={dialogActions}
      >
        <Box component="form" noValidate sx={{ p: 1 }}>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError(null)}>
              {formError}
            </Alert>
          )}

          {/* Department Information Alert */}
          {selectedDepartment.department && !viewOnly && (
            <Alert severity="info" sx={{ mb: 2 }} icon={<Info />}>
              <Typography variant="body2">
                <strong>Department:</strong> Creating product overview for {selectedDepartment.department} department.
                {onChangeDepartment && <SmartButton text="Change Department" onClick={onChangeDepartment} variant="text" icon={ChangeCircleRounded} size="small" sx={{ ml: 1 }} />}
              </Typography>
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Status Toggle - Prominent Position */}
            <Grid size={{ sm: 12 }}>
              <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2}>
                <Typography variant="body2" color="text.secondary">
                  Status:
                </Typography>
                <FormField name="rActiveYN" control={control} label="Active" type="switch" disabled={viewOnly} size="small" />
              </Box>
            </Grid>

            {/* Product Selection Section */}
            <Grid size={{ sm: 12 }}>
              <Card variant="outlined" sx={{ borderLeft: "3px solid #1976d2" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                    Product Selection
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 6 }}>
                      <ProductSearch
                        ref={productSearchRef}
                        onProductSelect={handleProductSelect}
                        label="Product Code"
                        placeholder="Search and select product..."
                        disabled={viewOnly}
                        className="product-search-field"
                        initialSelection={selectedProductOption}
                        setInputValue={setSearchInputValue}
                        setSelectedProduct={setSelectedProductOption}
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="productName" control={control} label="Product Name" type="text" disabled={true} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="baseUnit" control={control} label="Base Unit" type="text" disabled={viewOnly} size="small" fullWidth />
                    </Grid>
                  </Grid>

                  {selectedProductData.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Product Details:
                      </Typography>
                      <CustomGrid columns={productColumns} data={selectedProductData} maxHeight="200px" />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Location Information Section */}
            <Grid size={{ sm: 12 }}>
              <Card variant="outlined" sx={{ borderLeft: "3px solid #ff9800" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="#ff9800" fontWeight="bold">
                    Location Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 4 }}>
                      <FormField
                        name="pLocationID"
                        control={control}
                        label="Product Location"
                        type="select"
                        disabled={viewOnly}
                        placeholder="Select location"
                        options={
                          productLocation?.map((location) => ({
                            value: location.id,
                            label: location.label,
                          })) || []
                        }
                        size="small"
                        fullWidth
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 4 }}>
                      <FormField name="rackNo" control={control} label="Rack No" type="text" disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 4 }}>
                      <FormField name="shelfNo" control={control} label="Shelf No" type="text" disabled={viewOnly} size="small" fullWidth />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Stock Level Information Section */}
            <Grid size={{ sm: 12 }}>
              <Card variant="outlined" sx={{ borderLeft: "3px solid #4caf50" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="#4caf50" fontWeight="bold">
                    Stock Level Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 3 }}>
                      <FormField name="stockLevel" control={control} label="Current Stock" type="number" disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 3 }}>
                      <FormField name="minLevelUnits" control={control} label="Min Level" type="number" disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 3 }}>
                      <FormField name="maxLevelUnits" control={control} label="Max Level" type="number" disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 3 }}>
                      <FormField name="dangerLevelUnits" control={control} label="Danger Level" type="number" disabled={viewOnly} size="small" fullWidth />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Lead Time & Demand Information Section */}
            <Grid size={{ sm: 12 }}>
              <Card variant="outlined" sx={{ borderLeft: "3px solid #9c27b0" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="#9c27b0" fontWeight="bold">
                    Lead Time & Demand Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 3 }}>
                      <FormField name="leadTime" control={control} label="Lead Time" type="number" disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 3 }}>
                      <FormField name="leadTimeUnit" control={control} label="Lead Time Unit" type="select" options={leadTimeOptions} disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 3 }}>
                      <FormField name="avgDemand" control={control} label="Average Demand" type="number" disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 3 }}>
                      <FormField name="avgDemandUnit" control={control} label="Demand Unit" type="select" options={leadTimeOptions} disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    {convertedLeadTime && (
                      <Grid size={{ sm: 12 }}>
                        <Typography variant="body2" color="text.secondary">
                          Lead Time in Days: {convertedLeadTime} days
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Reorder Information Section */}
            <Grid size={{ sm: 12 }}>
              <Card variant="outlined" sx={{ borderLeft: "3px solid #f44336" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="#f44336" fontWeight="bold">
                    Reorder Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 4 }}>
                      <FormField name="reOrderLevel" control={control} label="Reorder Level" type="number" disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 4 }}>
                      <FormField name="reOrderQuantity" control={control} label="Reorder Quantity" type="number" disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 4 }}>
                      <Box>
                        <FormField
                          name="poStatus"
                          control={control}
                          label="PO Generation"
                          type="radio"
                          options={[
                            { value: "Y", label: "Automatic" },
                            { value: "N", label: "Manual" },
                          ]}
                          disabled={viewOnly}
                          size="small"
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                          {poStatus === "Y" ? "Purchase orders will be generated automatically" : "Purchase orders will be created manually"}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Product Settings Section */}
            <Grid size={{ sm: 12 }}>
              <Card variant="outlined" sx={{ borderLeft: "3px solid #607d8b" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="#607d8b" fontWeight="bold">
                    Product Settings
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 4 }}>
                      <Box>
                        <FormField name="defaultYN" control={control} label="Set as Default" type="switch" disabled={viewOnly} size="small" />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                          Mark this as the default product overview for the department
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid size={{ sm: 12, md: 4 }}>
                      <Box>
                        <FormField name="isAutoIndentYN" control={control} label="Auto Indent" type="switch" disabled={viewOnly} size="small" />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                          {isAutoIndentYN === "Y" ? "Automatic indenting enabled" : "Manual indenting required"}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Additional Information Section */}
            <Grid size={{ sm: 12 }}>
              <Card variant="outlined" sx={{ borderLeft: "3px solid #795548" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="#795548" fontWeight="bold">
                    Additional Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12 }}>
                      <FormField
                        name="rNotes"
                        control={control}
                        label="Notes"
                        type="textarea"
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        rows={4}
                        placeholder="Enter any additional information about this product overview, including special handling instructions, supplier details, or usage notes"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </GenericDialog>

      <ConfirmationDialog
        open={showResetConfirmation}
        onClose={() => setShowResetConfirmation(false)}
        onConfirm={handleResetConfirm}
        title="Reset Form"
        message="Are you sure you want to reset the form? All unsaved changes will be lost."
        confirmText="Reset"
        cancelText="Cancel"
        type="warning"
        maxWidth="sm"
      />

      <ConfirmationDialog
        open={showCancelConfirmation}
        onClose={() => setShowCancelConfirmation(false)}
        onConfirm={handleCancelConfirm}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to cancel?"
        confirmText="Yes, Cancel"
        cancelText="Continue Editing"
        type="warning"
        maxWidth="sm"
      />
    </>
  );
};

export default ProductOverviewForm;
