// src/pages/inventoryManagement/IndentProduct/Form/IndentProductForm.tsx

import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { IndentDetailDto, IndentMastDto, IndentSaveRequestDto } from "@/interfaces/InventoryManagement/IndentProductDto";
import { ProductSearchResult } from "@/interfaces/InventoryManagement/Product/ProductSearch.interface";
import { useAlert } from "@/providers/AlertProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Cancel, ChangeCircleRounded, Delete as DeleteIcon, Edit as EditIcon, Info, Inventory, Notes, Refresh, Save, Schedule, Settings } from "@mui/icons-material";
import { Alert, Box, Card, CardContent, Chip, Divider, Grid, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ProductSearch, ProductSearchRef } from "../../CommonPage/Product/ProductSearchForm";
import { useIndentProduct } from "../hooks/useIndentProduct";

interface IndentProductFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  initialData: IndentMastDto | null;
  viewOnly?: boolean;
  selectedDepartment: { deptID: number; department: string };
  onChangeDepartment?: () => void;
}

// Validation schemas
const indentDetailSchema = z.object({
  indentDetID: z.coerce.number().default(0),
  productID: z.coerce.number().min(1, "Product is required"),
  productCode: z.string().min(1, "Product code is required"),
  productName: z.string().optional(),
  catValue: z.string().optional(),
  requiredQty: z.coerce.number().min(1, "Required quantity must be greater than 0"),
  requiredUnitQty: z.coerce.number().min(0, "Required unit quantity must be non-negative").default(0),
  pUnitName: z.string().optional(),
  manufacturerID: z.coerce.number().default(0),
  manufacturerName: z.string().optional(),
  rActiveYN: z.string().default("Y"),
  transferYN: z.string().default("N"),
  rNotes: z.string().optional(),
  unitPack: z.coerce.number().min(0, "Unit pack must be non-negative").default(1),
  deptIssualYN: z.string().default("N"),
});

const indentFormSchema = z.object({
  indentID: z.coerce.number().default(0),
  indentCode: z.string().min(1, "Indent code is required"),
  fromDeptID: z.coerce.number().min(1, "From department is required"),
  fromDeptName: z.string().optional(),
  toDeptID: z.coerce.number().min(1, "To department is required"),
  toDeptName: z.string().optional(),
  indentDate: z.date().default(() => new Date()),
  indentType: z.string().min(1, "Indent type is required"),
  indentTypeValue: z.string().optional(),
  autoIndentYN: z.string().default("N"),
  indexpiryYN: z.string().default("N"),
  pChartID: z.coerce.number().default(0),
  pChartCode: z.string().optional(),
  indentAcknowledgement: z.string().optional(),
  rActiveYN: z.string().default("Y"),
  transferYN: z.string().default("N"),
  rNotes: z.string().optional(),
  indentDetails: z.array(indentDetailSchema).min(1, "At least one product is required"),
});

type IndentFormData = z.infer<typeof indentFormSchema>;
type IndentDetailFormData = z.infer<typeof indentDetailSchema>;

const IndentProductForm: React.FC<IndentProductFormProps> = ({ open, onClose, initialData, viewOnly = false, selectedDepartment, onChangeDepartment }) => {
  const { setLoading } = useLoading();
  const { showAlert } = useAlert();
  const { saveIndent, getIndentById, getNextIndentCode, canEditIndent, canDeleteIndent } = useIndentProduct();

  // State management
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<IndentDetailFormData | null>(null);
  const [editingProductIndex, setEditingProductIndex] = useState<number>(-1);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  const productSearchRef = useRef<ProductSearchRef>(null);
  const isAddMode = !initialData;

  // Load dropdown values
  const { department, departmentIndent } = useDropdownValues(["department", "departmentIndent"]);

  // Form setup
  const defaultValues: IndentFormData = {
    indentID: 0,
    indentCode: "",
    fromDeptID: selectedDepartment.deptID,
    fromDeptName: selectedDepartment.department,
    toDeptID: 0,
    toDeptName: "",
    indentDate: new Date(),
    indentType: "",
    indentTypeValue: "",
    autoIndentYN: "N",
    indexpiryYN: "N",
    pChartID: 0,
    pChartCode: "",
    indentAcknowledgement: "",
    rActiveYN: "Y",
    transferYN: "N",
    rNotes: "",
    indentDetails: [],
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isDirty, isValid, errors },
  } = useForm<IndentFormData>({
    defaultValues,
    resolver: zodResolver(indentFormSchema),
    mode: "onChange",
  });

  const watchedIndentDetails = watch("indentDetails");
  const watchedToDeptID = watch("toDeptID");
  const watchedIndentType = watch("indentType");

  // Generate indent code for new indents
  const generateIndentCode = useCallback(async () => {
    if (!isAddMode) return;

    try {
      setIsGeneratingCode(true);
      const nextCode = await getNextIndentCode("IND", 5);
      if (nextCode) {
        setValue("indentCode", nextCode, { shouldValidate: true, shouldDirty: true });
      } else {
        showAlert("Warning", "Failed to generate indent code", "warning");
      }
    } catch (error) {
      console.error("Error generating indent code:", error);
      showAlert("Error", "Error generating indent code", "error");
    } finally {
      setIsGeneratingCode(false);
    }
  }, [isAddMode, getNextIndentCode, setValue, showAlert]); // Keep dependencies minimal and correct

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      const loadIndentDetails = async () => {
        try {
          setLoading(true);
          const fullIndentData = await getIndentById(initialData.indentID);

          if (fullIndentData) {
            const formData: IndentFormData = {
              indentID: fullIndentData.IndentMaster.indentID,
              indentCode: fullIndentData.IndentMaster.indentCode || "",
              fromDeptID: fullIndentData.IndentMaster.fromDeptID || selectedDepartment.deptID,
              fromDeptName: fullIndentData.IndentMaster.fromDeptName || selectedDepartment.department,
              toDeptID: fullIndentData.IndentMaster.toDeptID || 0,
              toDeptName: fullIndentData.IndentMaster.toDeptName || "",
              indentDate: fullIndentData.IndentMaster.indentDate ? new Date(fullIndentData.IndentMaster.indentDate) : new Date(),
              indentType: fullIndentData.IndentMaster.indentType || "",
              indentTypeValue: fullIndentData.IndentMaster.indentTypeValue || "",
              autoIndentYN: fullIndentData.IndentMaster.autoIndentYN || "N",
              indexpiryYN: fullIndentData.IndentMaster.indexpiryYN || "N",
              pChartID: fullIndentData.IndentMaster.pChartID || 0,
              pChartCode: fullIndentData.IndentMaster.pChartCode || "",
              indentAcknowledgement: fullIndentData.IndentMaster.indentAcknowledgement || "",
              rActiveYN: fullIndentData.IndentMaster.rActiveYN || "Y",
              transferYN: fullIndentData.IndentMaster.transferYN || "N",
              rNotes: fullIndentData.IndentMaster.rNotes || "",
              indentDetails: fullIndentData.IndentDetails.map((detail: IndentDetailDto) => ({
                indentDetID: detail.indentDetID,
                productID: detail.productID || 0,
                productCode: detail.productCode || "",
                productName: detail.productName || "",
                catValue: detail.catValue || "",
                requiredQty: detail.requiredQty || 1,
                requiredUnitQty: detail.requiredUnitQty || 0,
                pUnitName: detail.pUnitName || "",
                manufacturerID: detail.manufacturerID || 0,
                manufacturerName: detail.manufacturerName || "",
                rActiveYN: detail.rActiveYN || "Y",
                transferYN: detail.transferYN || "N",
                rNotes: detail.rNotes || "",
                unitPack: detail.unitPack || 1,
                deptIssualYN: detail.deptIssualYN || "N",
              })),
            };
            reset(formData);
          }
        } catch (error) {
          showAlert("Error", "Failed to load indent details", "error");
        } finally {
          setLoading(false);
        }
      };

      loadIndentDetails();
    } else {
      // For add mode, initialize and then generate code ONLY if indentCode is empty
      reset({
        ...defaultValues,
        fromDeptID: selectedDepartment.deptID,
        fromDeptName: selectedDepartment.department,
      });
      // Call generateIndentCode here directly, it already handles `isAddMode` check
      // And crucially, it's not part of the dependency array for this useEffect
      // so it won't re-trigger this effect on its own.
      // We also add a check to ensure it only runs if the code is not already present.
      if (!watch("indentCode")) {
        // Check if indentCode is empty before generating
        generateIndentCode();
      }
    }
  }, [initialData, reset, selectedDepartment, getIndentById, watch, defaultValues]); // Removed generateIndentCode from dependencies

  // Handle product selection for adding to indent
  const handleProductSelect = useCallback(
    (product: ProductSearchResult | null) => {
      if (!product || viewOnly) return;

      const newDetail: IndentDetailFormData = {
        indentDetID: 0,
        productID: product.productID,
        productCode: product.productCode || "",
        productName: product.productName || "",
        catValue: product.catValue || "",
        requiredQty: 1,
        requiredUnitQty: 0,
        pUnitName: "",
        manufacturerID: 0,
        manufacturerName: "",
        rActiveYN: "Y",
        transferYN: "N",
        rNotes: "",
        unitPack: 1,
        deptIssualYN: "N",
      };

      // Check if product already exists in the list
      const existingIndex = watchedIndentDetails.findIndex((detail) => detail.productID === product.productID);

      if (existingIndex >= 0) {
        showAlert("Warning", "This product is already added to the indent", "warning");
        return;
      }

      const updatedDetails = [...watchedIndentDetails, newDetail];
      setValue("indentDetails", updatedDetails, { shouldValidate: true, shouldDirty: true });

      // Clear the product search
      if (productSearchRef.current) {
        productSearchRef.current.clearSelection();
      }
    },
    [watchedIndentDetails, setValue, viewOnly, showAlert]
  );

  // Handle editing product details
  const handleEditProduct = useCallback(
    (index: number) => {
      if (viewOnly) return;
      setSelectedProductForEdit(watchedIndentDetails[index] || null);
      setEditingProductIndex(index);
    },
    [watchedIndentDetails, viewOnly]
  );

  // Handle updating product details
  const handleUpdateProduct = useCallback(
    (updatedProduct: IndentDetailFormData) => {
      if (editingProductIndex >= 0) {
        const updatedDetails = [...watchedIndentDetails];
        updatedDetails[editingProductIndex] = updatedProduct;
        setValue("indentDetails", updatedDetails, { shouldValidate: true, shouldDirty: true });
      }
      setSelectedProductForEdit(null);
      setEditingProductIndex(-1);
    },
    [editingProductIndex, watchedIndentDetails, setValue]
  );

  // Handle removing product from indent
  const handleRemoveProduct = useCallback(
    (index: number) => {
      if (viewOnly) return;
      const updatedDetails = watchedIndentDetails.filter((_, i) => i !== index);
      setValue("indentDetails", updatedDetails, { shouldValidate: true, shouldDirty: true });
    },
    [watchedIndentDetails, setValue, viewOnly]
  );

  // Handle form submission
  const onSubmit = async (data: IndentFormData) => {
    if (viewOnly) return;
    setFormError(null);

    try {
      setIsSaving(true);
      setLoading(true);

      const selectedToDept = department?.find((dept) => Number(dept.value) === data.toDeptID);

      const indentData: IndentSaveRequestDto = {
        IndentMaster: {
          indentID: data.indentID,
          indentCode: data.indentCode,
          fromDeptID: data.fromDeptID,
          fromDeptName: data.fromDeptName || selectedDepartment.department,
          toDeptID: data.toDeptID,
          toDeptName: selectedToDept?.label || "",
          indentDate: data.indentDate,
          indentType: data.indentType,
          indentTypeValue: data.indentTypeValue || data.indentType,
          autoIndentYN: data.autoIndentYN,
          indexpiryYN: data.indexpiryYN,
          pChartID: data.pChartID,
          pChartCode: data.pChartCode,
          indentAcknowledgement: data.indentAcknowledgement,
          rActiveYN: data.rActiveYN,
          transferYN: data.transferYN,
          rNotes: data.rNotes,
          indentApprovedYN: initialData?.indentApprovedYN || "N",
          indStatusCode: initialData?.indStatusCode || "PENDING",
          indStatus: initialData?.indStatus || "Pending",
        },
        IndentDetails: data.indentDetails.map((detail, index) => ({
          indentDetID: detail.indentDetID,
          indentID: data.indentID,
          productID: detail.productID,
          productCode: detail.productCode,
          productName: detail.productName,
          catValue: detail.catValue,
          requiredQty: detail.requiredQty,
          requiredUnitQty: detail.requiredUnitQty,
          pUnitName: detail.pUnitName,
          manufacturerID: detail.manufacturerID,
          manufacturerName: detail.manufacturerName,
          rActiveYN: detail.rActiveYN,
          transferYN: detail.transferYN,
          rNotes: detail.rNotes,
          unitPack: detail.unitPack,
          deptIssualYN: detail.deptIssualYN,
        })),
      };

      const response = await saveIndent(indentData);

      if (response.success) {
        showAlert("Success", isAddMode ? "Indent created successfully" : "Indent updated successfully", "success");
        onClose(true);
      } else {
        throw new Error(response.errorMessage || "Failed to save indent");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save indent";
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  // Reset form
  const performReset = useCallback(() => {
    if (initialData) {
      // Reload initial data
      reset(defaultValues); // Pass defaultValues to reset to ensure proper re-initialization
      // if initialData is present, useEffect above will load the data.
      // If you specifically want to re-fetch the data, you'd call loadIndentDetails again here.
      // But simply resetting to default and relying on useEffect for initialData is cleaner.
    } else {
      reset({
        ...defaultValues,
        fromDeptID: selectedDepartment.deptID,
        fromDeptName: selectedDepartment.department,
      });
      // Conditionally generate code only if it's an add mode and not already present
      if (!watch("indentCode")) {
        generateIndentCode();
      }
    }
    setFormError(null);
    setSelectedProductForEdit(null);
    setEditingProductIndex(-1);
  }, [initialData, reset, defaultValues, selectedDepartment, generateIndentCode, watch]); // Removed generateIndentCode from dependencies, added watch

  const handleReset = useCallback(() => {
    if (isDirty) {
      setShowResetConfirmation(true);
    } else {
      performReset();
    }
  }, [isDirty, performReset]);

  const handleCancel = useCallback(() => {
    if (isDirty) {
      setShowCancelConfirmation(true);
    } else {
      onClose();
    }
  }, [isDirty, onClose]);

  // Dialog configuration
  const dialogTitle = useMemo(() => {
    if (viewOnly) return "View Indent Details";
    if (isAddMode) return "Create New Indent";
    return `Edit Indent - ${initialData?.indentCode}`;
  }, [viewOnly, isAddMode, initialData]);

  const dialogActions = useMemo(() => {
    if (viewOnly) {
      return <SmartButton text="Close" onClick={() => onClose()} variant="contained" color="primary" />;
    }

    const canEdit = !initialData || canEditIndent(initialData);

    return (
      <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
        <SmartButton text="Cancel" onClick={handleCancel} variant="outlined" color="inherit" disabled={isSaving} />
        <Box sx={{ display: "flex", gap: 1 }}>
          <SmartButton text="Reset" onClick={handleReset} variant="outlined" color="error" icon={Cancel} disabled={isSaving || (!isDirty && !formError)} />
          <SmartButton
            text={isAddMode ? "Create Indent" : "Update Indent"}
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            color="primary"
            icon={Save}
            asynchronous={true}
            showLoadingIndicator={true}
            loadingText={isAddMode ? "Creating..." : "Updating..."}
            successText={isAddMode ? "Created!" : "Updated!"}
            disabled={isSaving || !isValid || !canEdit}
          />
        </Box>
      </Box>
    );
  }, [viewOnly, initialData, canEditIndent, handleCancel, handleReset, handleSubmit, onSubmit, onClose, isSaving, isDirty, isValid, formError, isAddMode]);

  // Product details grid columns
  const productColumns: Column<IndentDetailFormData>[] = [
    {
      key: "productCode",
      header: "Product Code",
      visible: true,
      width: 150,
    },
    {
      key: "productName",
      header: "Product Name",
      visible: true,
      width: 200,
    },
    {
      key: "catValue",
      header: "Category",
      visible: true,
      width: 120,
    },
    {
      key: "requiredQty",
      header: "Required Qty",
      visible: true,
      width: 100,
      align: "right",
    },
    {
      key: "pUnitName",
      header: "Unit",
      visible: true,
      width: 80,
    },
    {
      key: "manufacturerName",
      header: "Manufacturer",
      visible: true,
      width: 150,
    },
    {
      key: "rActiveYN",
      header: "Status",
      visible: true,
      width: 80,
      formatter: (value: string) => <Chip size="small" color={value === "Y" ? "success" : "error"} label={value === "Y" ? "Active" : "Inactive"} />,
    },
    {
      key: "actions",
      header: "Actions",
      visible: true,
      width: 120,
      render: (item, index) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Edit Product">
            <IconButton size="small" color="info" onClick={() => handleEditProduct(index!)} disabled={viewOnly}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remove Product">
            <IconButton size="small" color="error" onClick={() => handleRemoveProduct(index!)} disabled={viewOnly}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  // Get total quantity for display
  const totalQuantity = useMemo(() => {
    return watchedIndentDetails.reduce((sum, detail) => sum + (detail.requiredQty || 0), 0);
  }, [watchedIndentDetails]);

  // Check if form can be edited
  const canEditForm = !viewOnly && (!initialData || canEditIndent(initialData));

  return (
    <>
      <GenericDialog
        open={open}
        onClose={() => onClose()}
        title={dialogTitle}
        maxWidth="xl"
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

          {/* Status and approval alerts */}
          {initialData?.indentApprovedYN === "Y" && (
            <Alert severity="info" sx={{ mb: 2 }} icon={<Info />}>
              <Typography variant="body2">
                <strong>Approved Indent:</strong> This indent has been approved and cannot be modified.
              </Typography>
            </Alert>
          )}

          {initialData?.indStatusCode === "COMPLETED" && (
            <Alert severity="success" sx={{ mb: 2 }} icon={<Info />}>
              <Typography variant="body2">
                <strong>Completed Indent:</strong> This indent has been completed.
              </Typography>
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Status Toggle */}
            <Grid size={{ xs: 12 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    From Department: {selectedDepartment.department}
                  </Typography>
                  {onChangeDepartment && canEditForm && (
                    <SmartButton text="Change Department" onClick={onChangeDepartment} variant="outlined" icon={ChangeCircleRounded} size="small" color="warning" />
                  )}
                </Box>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="body2" color="text.secondary">
                    Status:
                  </Typography>
                  <FormField name="rActiveYN" control={control} label="Active" type="switch" disabled={!canEditForm} size="small" />
                </Box>
              </Box>
            </Grid>

            {/* Basic Information Section */}
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined" sx={{ borderLeft: "3px solid #1976d2" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                    <Schedule sx={{ mr: 1, verticalAlign: "middle" }} />
                    Basic Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <FormField name="indentCode" control={control} label="Indent Code" type="text" required disabled={!canEditForm || !isAddMode} size="small" fullWidth />
                        {isAddMode && canEditForm && (
                          <SmartButton
                            text="Generate"
                            onClick={generateIndentCode}
                            variant="outlined"
                            size="small"
                            icon={Refresh}
                            disabled={isGeneratingCode}
                            asynchronous={true}
                            showLoadingIndicator={true}
                            loadingText="..."
                          />
                        )}
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <FormField name="indentDate" control={control} label="Indent Date" type="datepicker" required disabled={!canEditForm} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <FormField
                        name="toDeptID"
                        control={control}
                        label="To Department"
                        type="select"
                        required
                        disabled={!canEditForm}
                        placeholder="Select destination department"
                        options={
                          department
                            ?.filter((dept) => Number(dept.value) !== selectedDepartment.deptID)
                            .map((dept) => ({
                              value: dept.value,
                              label: dept.label,
                            })) || []
                        }
                        size="small"
                        fullWidth
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <FormField
                        name="indentType"
                        control={control}
                        label="Indent Type"
                        type="select"
                        required
                        disabled={!canEditForm}
                        placeholder="Select indent type"
                        options={
                          departmentIndent?.map((type) => ({
                            value: type.value,
                            label: type.label,
                          })) || []
                        }
                        size="small"
                        fullWidth
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <FormField
                        name="pChartCode"
                        control={control}
                        label="Patient Chart Code"
                        type="text"
                        disabled={!canEditForm}
                        size="small"
                        fullWidth
                        placeholder="Enter patient chart code if applicable"
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box>
                        <FormField name="autoIndentYN" control={control} label="Auto Indent" type="switch" disabled={!canEditForm} size="small" />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                          Enable automatic indent generation
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Product Selection Section */}
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined" sx={{ borderLeft: "3px solid #ff9800" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="#ff9800" fontWeight="bold">
                    <Inventory sx={{ mr: 1, verticalAlign: "middle" }} />
                    Product Selection
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {canEditForm && (
                    <Grid container spacing={2} mb={2}>
                      <Grid size={{ xs: 12, md: 8 }}>
                        <ProductSearch
                          ref={productSearchRef}
                          onProductSelect={handleProductSelect}
                          label="Add Product"
                          placeholder="Search and select products to add to indent"
                          disabled={!canEditForm}
                          className="product-search-field"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Box sx={{ p: 2, bgcolor: "rgba(255, 152, 0, 0.08)", borderRadius: 1 }}>
                          <Typography variant="body2" color="#ff9800" fontWeight="medium">
                            Total Products: {watchedIndentDetails.length}
                          </Typography>
                          <Typography variant="h6" color="#ff9800" fontWeight="bold">
                            Total Quantity: {totalQuantity}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  )}

                  {watchedIndentDetails.length > 0 ? (
                    <CustomGrid
                      columns={productColumns}
                      data={watchedIndentDetails}
                      maxHeight="400px"
                      emptyStateMessage="No products added to this indent"
                      loading={false}
                      density="small"
                    />
                  ) : (
                    <Box sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
                      <Inventory sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                      <Typography variant="h6" gutterBottom>
                        No products added yet
                      </Typography>
                      <Typography variant="body2">
                        {canEditForm ? "Use the product search above to add products to this indent" : "This indent doesn't have any products"}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Settings Section */}
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined" sx={{ borderLeft: "3px solid #2196f3" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="#2196f3" fontWeight="bold">
                    <Settings sx={{ mr: 1, verticalAlign: "middle" }} />
                    Additional Settings
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormField
                        name="indentAcknowledgement"
                        control={control}
                        label="Acknowledgement"
                        type="text"
                        disabled={!canEditForm}
                        size="small"
                        fullWidth
                        placeholder="Enter acknowledgement details"
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box>
                        <FormField name="indexpiryYN" control={control} label="Track Expiry" type="switch" disabled={!canEditForm} size="small" />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                          Enable expiry tracking for this indent
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Notes Section */}
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined" sx={{ borderLeft: "3px solid #4caf50" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="#4caf50" fontWeight="bold">
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
                        disabled={!canEditForm}
                        size="small"
                        fullWidth
                        rows={4}
                        placeholder="Enter any additional information about this indent, including special instructions, urgency level, or departmental requirements"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </GenericDialog>

      {/* Reset Confirmation Dialog */}
      <ConfirmationDialog
        open={showResetConfirmation}
        onClose={() => setShowResetConfirmation(false)}
        onConfirm={() => {
          performReset();
          setShowResetConfirmation(false);
        }}
        title="Reset Form"
        message="Are you sure you want to reset the form? All unsaved changes will be lost."
        confirmText="Reset"
        cancelText="Cancel"
        type="warning"
        maxWidth="sm"
      />

      {/* Cancel Confirmation Dialog */}
      <ConfirmationDialog
        open={showCancelConfirmation}
        onClose={() => setShowCancelConfirmation(false)}
        onConfirm={() => {
          setShowCancelConfirmation(false);
          onClose();
        }}
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

export default IndentProductForm;
