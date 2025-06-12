import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { ProductSearchResult } from "@/interfaces/InventoryManagement/Product/ProductSearch.interface";
import { ProductListDto } from "@/interfaces/InventoryManagement/ProductListDto";
import { ProductOverviewDto } from "@/interfaces/InventoryManagement/ProductOverviewDto";
import { useAlert } from "@/providers/AlertProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Cancel, ChangeCircleRounded, Info, Inventory, LocationOn, Notes, Refresh, Save, Settings, Timeline } from "@mui/icons-material";
import { Alert, Box, Card, CardContent, Chip, Divider, Grid, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
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
  const { saveProductOverview, getProductByCode, fetchProductSuggestions, convertLeadTimeToDays } = useProductOverview();
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [selectedProductData, setSelectedProductData] = useState<ProductListDto[]>([]);
  const [, setIsProductSelected] = useState(false);
  const [convertedLeadTime, setConvertedLeadTime] = useState<number | null>(null);
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
    formState: { isDirty, isValid, errors },
  } = useForm<ProductOverviewFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const watchedLeadTime = watch("leadTime");
  const watchedLeadTimeUnit = watch("leadTimeUnit");
  const watchedStockLevel = watch("stockLevel");
  const watchedMinLevel = watch("minLevelUnits");
  const watchedDangerLevel = watch("dangerLevelUnits");

  useEffect(() => {
    if (watchedLeadTime && watchedLeadTimeUnit) {
      const days = convertLeadTimeToDays(Number(watchedLeadTime), watchedLeadTimeUnit);
      setConvertedLeadTime(days);
    }
  }, [watchedLeadTime, watchedLeadTimeUnit, convertLeadTimeToDays]);

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

      if (initialData.productCode) {
        handleProductSelection(initialData.productCode);
      }
    } else {
      reset({
        ...defaultValues,
        deptID: selectedDepartment.deptID,
        department: selectedDepartment.department,
      });
    }
  }, [initialData, reset, selectedDepartment]);

  const handleProductSelect = (product: ProductSearchResult | null) => {
    if (product) {
      setValue("productID", product.productID);
      setValue("productCode", product.productCode || "");
      setValue("productName", product.productName || "");
      setValue("pLocationID", product.pLocationID || 0);
      setValue("rActiveYN", product.rActiveYN || "Y");
      setValue("transferYN", product.transferYN || "N");
    } else {
      setValue("productID", 0);
      setValue("productCode", "");
      setValue("productName", "");
      setValue("pLocationID", 0);
      setValue("rActiveYN", "Y");
      setValue("transferYN", "N");
    }
  };

  const handleProductSelection = useCallback(
    async (selectedProductString: string) => {
      const [selectedProductCode] = selectedProductString.split(" - ");
      setValue("productCode", selectedProductCode || "", { shouldValidate: true, shouldDirty: true });

      try {
        const productDetails = await getProductByCode(selectedProductCode || "");
        if (productDetails) {
          setValue("productID", Number(productDetails.productID || 0));
          setValue("productName", productDetails.productName || "");
          setValue("baseUnit", productDetails.baseUnit ? String(productDetails.baseUnit) : "");

          setSelectedProductData([productDetails]);
          setIsProductSelected(true);
        }
      } catch (error) {
        showAlert("Error", "Failed to fetch product details", "error");
      }
    },
    [getProductByCode, setValue]
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
        rackNo: data.rackNo,
        shelfNo: data.shelfNo,
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
        productLocation: data.productLocation,
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

  const dialogTitle = useMemo(() => {
    if (viewOnly) return "View Product Overview Details";
    if (isAddMode) return "Create New Product Overview";
    return `Edit Product Overview - ${initialData?.productCode}`;
  }, [viewOnly, isAddMode, initialData]);

  const dialogActions = useMemo(() => {
    if (viewOnly) {
      return <SmartButton text="Close" onClick={() => onClose()} variant="contained" color="primary" />;
    }

    return (
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
  }, [viewOnly, isSaving, isDirty, isValid, formError, isAddMode, handleSubmit, onSubmit, onClose, handleReset, handleCancel]);

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

  const watchedLocationID = watch("pLocationID");

  useEffect(() => {
    if (watchedLocationID) {
      const selectedLocation = productLocation?.find((location) => location.id === watchedLocationID);
      if (selectedLocation) {
        setValue("productLocation", selectedLocation.label, { shouldValidate: true, shouldDirty: false });
      }
    }
  }, [watchedLocationID, productLocation, setValue]);

  // Get stock status based on current levels
  const getStockStatus = () => {
    if (!watchedStockLevel) return "unknown";
    if (watchedDangerLevel && watchedStockLevel <= watchedDangerLevel) return "danger";
    if (watchedMinLevel && watchedStockLevel <= watchedMinLevel) return "low";
    return "normal";
  };

  const stockStatus = getStockStatus();

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

          {/* Stock Level Alert */}
          {stockStatus === "danger" && (
            <Alert severity="error" sx={{ mb: 2 }} icon={<Info />}>
              <Typography variant="body2">
                <strong>Danger Level Alert:</strong> Current stock ({watchedStockLevel}) is at or below danger level ({watchedDangerLevel}).
              </Typography>
            </Alert>
          )}

          {stockStatus === "low" && (
            <Alert severity="warning" sx={{ mb: 2 }} icon={<Info />}>
              <Typography variant="body2">
                <strong>Low Stock Alert:</strong> Current stock ({watchedStockLevel}) is at or below minimum level ({watchedMinLevel}).
              </Typography>
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Status Toggle - Prominent Position */}
            <Grid size={{ xs: 12 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    Department: {selectedDepartment.department}
                  </Typography>
                  {onChangeDepartment && (
                    <SmartButton text="Change Department" onClick={onChangeDepartment} variant="outlined" icon={ChangeCircleRounded} size="small" color="warning" />
                  )}
                </Box>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="body2" color="text.secondary">
                    Status:
                  </Typography>
                  <FormField name="rActiveYN" control={control} label="Active" type="switch" disabled={viewOnly} size="small" />
                </Box>
              </Box>
            </Grid>

            {/* Product Selection Section */}
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined" sx={{ borderLeft: "3px solid #1976d2" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                    Product Selection
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <ProductSearch
                        ref={productSearchRef}
                        onProductSelect={handleProductSelect}
                        label="Product Code"
                        placeholder="Search through product..."
                        disabled={viewOnly}
                        className="product-search-field"
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormField name="productName" control={control} label="Product Name" type="text" disabled={true} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormField name="baseUnit" control={control} label="Base Unit" type="text" disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormField
                        name="fsbCode"
                        control={control}
                        label="FSB Code"
                        type="select"
                        disabled={viewOnly}
                        placeholder="Select FSB Code"
                        options={[
                          { value: "F", label: "F - Fast Moving" },
                          { value: "S", label: "S - Slow Moving" },
                          { value: "B", label: "B - Blocking" },
                          { value: "N", label: "N - Normal" },
                        ]}
                        size="small"
                        fullWidth
                      />
                    </Grid>
                  </Grid>

                  {selectedProductData.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom color="primary">
                        Product Details:
                      </Typography>
                      <CustomGrid columns={productColumns} data={selectedProductData} maxHeight="200px" />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Location Information Section */}
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined" sx={{ borderLeft: "3px solid #ff9800" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="#ff9800" fontWeight="bold">
                    <LocationOn sx={{ mr: 1, verticalAlign: "middle" }} />
                    Location Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
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
                    <Grid size={{ xs: 12, md: 4 }}>
                      <FormField name="rackNo" control={control} label="Rack No" type="text" disabled={viewOnly} size="small" fullWidth placeholder="Enter rack number" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <FormField name="shelfNo" control={control} label="Shelf No" type="text" disabled={viewOnly} size="small" fullWidth placeholder="Enter shelf number" />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Stock Level Information Section */}
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined" sx={{ borderLeft: "3px solid #2196f3" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="#2196f3" fontWeight="bold">
                    <Inventory sx={{ mr: 1, verticalAlign: "middle" }} />
                    Stock Level Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <Box>
                        <FormField
                          name="stockLevel"
                          control={control}
                          label="Current Stock"
                          type="number"
                          disabled={viewOnly}
                          size="small"
                          fullWidth
                          placeholder="Enter current stock"
                        />
                        {stockStatus !== "unknown" && (
                          <Chip
                            size="small"
                            color={stockStatus === "danger" ? "error" : stockStatus === "low" ? "warning" : "success"}
                            label={stockStatus === "danger" ? "Danger Level" : stockStatus === "low" ? "Low Stock" : "Normal Stock"}
                            sx={{ mt: 0.5 }}
                          />
                        )}
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <Box>
                        <FormField
                          name="minLevelUnits"
                          control={control}
                          label="Min Level"
                          type="number"
                          disabled={viewOnly}
                          size="small"
                          fullWidth
                          placeholder="Enter minimum level"
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                          Reorder when stock falls below this level
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <Box>
                        <FormField
                          name="maxLevelUnits"
                          control={control}
                          label="Max Level"
                          type="number"
                          disabled={viewOnly}
                          size="small"
                          fullWidth
                          placeholder="Enter maximum level"
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                          Maximum storage capacity
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <Box>
                        <FormField
                          name="dangerLevelUnits"
                          control={control}
                          label="Danger Level"
                          type="number"
                          disabled={viewOnly}
                          size="small"
                          fullWidth
                          placeholder="Enter danger level"
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                          Critical stock level requiring immediate action
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Lead Time & Demand Information Section */}
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined" sx={{ borderLeft: "3px solid #9c27b0" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="#9c27b0" fontWeight="bold">
                    <Timeline sx={{ mr: 1, verticalAlign: "middle" }} />
                    Lead Time & Demand Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <FormField name="leadTime" control={control} label="Lead Time" type="number" disabled={viewOnly} size="small" fullWidth placeholder="Enter lead time" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <FormField name="leadTimeUnit" control={control} label="Lead Time Unit" type="select" options={leadTimeOptions} disabled={viewOnly} size="small" fullWidth />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <FormField
                        name="avgDemand"
                        control={control}
                        label="Average Demand"
                        type="number"
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        placeholder="Enter average demand"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <FormField name="avgDemandUnit" control={control} label="Demand Unit" type="select" options={leadTimeOptions} disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    {convertedLeadTime && (
                      <Grid size={{ xs: 12 }}>
                        <Box sx={{ p: 2, bgcolor: "rgba(156, 39, 176, 0.08)", borderRadius: 1, border: "1px solid rgba(156, 39, 176, 0.2)" }}>
                          <Typography variant="body2" color="#9c27b0" fontWeight="medium">
                            Lead Time Calculation
                          </Typography>
                          <Typography variant="h6" color="#9c27b0" fontWeight="bold" sx={{ mt: 0.5 }}>
                            {convertedLeadTime} days
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Converted from {watchedLeadTime} {watchedLeadTimeUnit}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Reorder Information Section */}
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined" sx={{ borderLeft: "3px solid #4caf50" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="#4caf50" fontWeight="bold">
                    <Refresh sx={{ mr: 1, verticalAlign: "middle" }} />
                    Reorder Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box>
                        <FormField
                          name="reOrderLevel"
                          control={control}
                          label="Reorder Level"
                          type="number"
                          disabled={viewOnly}
                          size="small"
                          fullWidth
                          placeholder="Enter reorder level"
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                          Trigger level for automatic reordering
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box>
                        <FormField
                          name="reOrderQuantity"
                          control={control}
                          label="Reorder Quantity"
                          type="number"
                          disabled={viewOnly}
                          size="small"
                          fullWidth
                          placeholder="Enter reorder quantity"
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                          Quantity to order when reorder level is reached
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
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
                          How purchase orders should be generated
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Settings Section */}
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined" sx={{ borderLeft: "3px solid #607d8b" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="#607d8b" fontWeight="bold">
                    <Settings sx={{ mr: 1, verticalAlign: "middle" }} />
                    Settings & Configuration
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box>
                        <FormField name="defaultYN" control={control} label="Set as Default" type="switch" disabled={viewOnly} size="small" />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                          Use this as the default configuration for the department
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box>
                        <FormField name="isAutoIndentYN" control={control} label="Auto Indent" type="switch" disabled={viewOnly} size="small" />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                          Automatically create indent requests when stock is low
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Additional Information Section */}
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined" sx={{ borderLeft: "3px solid #795548" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="#795548" fontWeight="bold">
                    <Notes sx={{ mr: 1, verticalAlign: "middle" }} />
                    Additional Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                      <FormField
                        name="rNotes"
                        control={control}
                        label="Notes"
                        type="textarea"
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        rows={4}
                        placeholder="Enter any additional information about this product overview, including special handling instructions, storage requirements, or departmental policies"
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
