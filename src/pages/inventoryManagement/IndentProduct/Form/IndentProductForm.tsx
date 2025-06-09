import React, { useState, useEffect, useMemo, useRef, useCallback, memo } from "react";
import { Box, Grid, Typography, Divider, Card, CardContent, Alert, IconButton, Paper, TableContainer } from "@mui/material";
import { useForm, useWatch, useFieldArray, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Save, Cancel, Refresh, Add as AddIcon, Delete as DeleteIcon, Search as SearchIcon } from "@mui/icons-material";
import { IndentSaveRequestDto, IndentMastDto, IndentDetailDto } from "@/interfaces/InventoryManagement/IndentProductDto";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import SmartButton from "@/components/Button/SmartButton";
import CustomButton from "@/components/Button/CustomButton";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import DepartmentSelectionDialog from "@/pages/inventoryManagement/CommonPage/DepartmentSelectionDialog";
import DepartmentInfoChange from "@/pages/inventoryManagement/CommonPage/DepartmentInfoChange";
import { ProductSearch } from "@/pages/inventoryManagement/CommonPage/Product/ProductSearchForm";
import { ProductSearchRef } from "@/pages/inventoryManagement/CommonPage/Product/ProductSearchForm";
import { ProductSearchResult } from "@/interfaces/InventoryManagement/Product/ProductSearch.interface";
import { useLoading } from "@/hooks/Common/useLoading";
import { useAlert } from "@/providers/AlertProvider";
import { useIndentProduct } from "../hooks/useIndentProduct";
import { useServerDate } from "@/hooks/Common/useServerDate";
import useDepartmentSelection from "@/hooks/InventoryManagement/useDepartmentSelection";

interface IndentProductFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  initialData: IndentMastDto | null;
  viewOnly?: boolean;
}

// Performance-optimized table row component
interface OptimizedTableRowProps {
  field: any;
  index: number;
  control: Control<IndentFormData>;
  onRemove: (index: number) => void;
  viewOnly: boolean;
}

const OptimizedTableRow = memo<OptimizedTableRowProps>(({ field, index, control, onRemove, viewOnly }) => {
  const handleRemove = useCallback(() => {
    onRemove(index);
  }, [index, onRemove]);

  return (
    <tr
      style={{
        backgroundColor: index % 2 === 0 ? "#fff" : "#fafafa",
        borderBottom: "1px solid #e0e0e0",
      }}
    >
      <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
        <Typography variant="body2" fontWeight="medium">
          {field.productCode}
        </Typography>
      </td>
      <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
        <Typography variant="body2">{field.productName}</Typography>
      </td>
      <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
        <Typography variant="body2" color="text.secondary">
          {field.catValue}
        </Typography>
      </td>
      <td style={{ padding: "12px 16px", verticalAlign: "middle", width: "120px" }}>
        <FormField name={`indentDetails.${index}.requiredQty`} control={control} label="" type="number" disabled={viewOnly} size="small" min={1} />
      </td>
      <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
        <Typography variant="body2" color="text.secondary">
          {field.pUnitName || "Units"}
        </Typography>
      </td>
      {!viewOnly && (
        <td style={{ padding: "12px 16px", verticalAlign: "middle", width: "80px" }}>
          <IconButton size="small" color="error" onClick={handleRemove} sx={{ "&:hover": { backgroundColor: "error.light", color: "error.contrastText" } }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </td>
      )}
    </tr>
  );
});

OptimizedTableRow.displayName = "OptimizedTableRow";

// High-performance table component
interface HighPerformanceTableProps {
  fields: any[];
  control: Control<IndentFormData>;
  onRemove: (index: number) => void;
  viewOnly: boolean;
  maxHeight?: number;
}

const HighPerformanceTable = memo<HighPerformanceTableProps>(({ fields, control, onRemove, viewOnly, maxHeight = 400 }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Virtualization for large datasets
  const shouldVirtualize = fields.length > 50;
  const itemHeight = 65;
  const visibleCount = shouldVirtualize ? Math.ceil(maxHeight / itemHeight) : fields.length;
  const startIndex = shouldVirtualize ? Math.floor(scrollTop / itemHeight) : 0;
  const endIndex = shouldVirtualize ? Math.min(startIndex + visibleCount + 5, fields.length) : fields.length;

  const visibleFields = shouldVirtualize ? fields.slice(startIndex, endIndex) : fields;

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (shouldVirtualize) {
        setScrollTop(e.currentTarget.scrollTop);
      }
    },
    [shouldVirtualize]
  );

  const tableHeaders = useMemo(
    () => (
      <thead>
        <tr
          style={{
            backgroundColor: "#f5f5f5",
            position: "sticky",
            top: 0,
            zIndex: 2,
            borderBottom: "2px solid #e0e0e0",
          }}
        >
          <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Product Code</th>
          <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Product Name</th>
          <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Category</th>
          <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 600, width: "1200px" }}>Required Qty</th>
          <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Unit</th>
          {!viewOnly && <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 600, width: "80px" }}>Actions</th>}
        </tr>
      </thead>
    ),
    [viewOnly]
  );

  const tableRows = useMemo(() => {
    if (shouldVirtualize) {
      return (
        <tbody style={{ position: "relative", height: fields.length * itemHeight }}>
          {visibleFields.map((field, virtualIndex) => {
            const actualIndex = startIndex + virtualIndex;
            return <OptimizedTableRow key={field.id} field={field} index={actualIndex} control={control} onRemove={onRemove} viewOnly={viewOnly} />;
          })}
        </tbody>
      );
    }

    return (
      <tbody>
        {visibleFields.map((field, index) => (
          <OptimizedTableRow key={field.id} field={field} index={index} control={control} onRemove={onRemove} viewOnly={viewOnly} />
        ))}
      </tbody>
    );
  }, [visibleFields, startIndex, control, onRemove, viewOnly, shouldVirtualize, fields.length, itemHeight]);

  if (fields.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          No products added yet. Use the search above to add products to this indent.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" sx={{ overflow: "hidden" }}>
      <Box
        ref={containerRef}
        onScroll={handleScroll}
        sx={{
          maxHeight: `${maxHeight}px`,
          overflow: "auto",
          position: "relative",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed",
          }}
        >
          {tableHeaders}
          {tableRows}
        </table>
      </Box>

      {/* Performance indicator */}
      {shouldVirtualize && (
        <Box
          sx={{
            p: 1,
            backgroundColor: "info.light",
            borderTop: "1px solid #e0e0e0",
          }}
        >
          <Typography variant="caption" color="info.contrastText">
            Virtualized view: Showing {visibleFields.length} of {fields.length} items
          </Typography>
        </Box>
      )}
    </Paper>
  );
});

HighPerformanceTable.displayName = "HighPerformanceTable";

const detailSchema = z.object({
  indentDetID: z.number(),
  indentID: z.number().optional(),
  productID: z.number().min(1, "Product is required"),
  productCode: z.string().min(1, "Product code is required"),
  productName: z.string().min(1, "Product name is required"),
  catValue: z.string().optional(),
  requiredQty: z.number().min(1, "Required quantity must be greater than 0"),
  requiredUnitQty: z.number().optional(),
  pUnitID: z.number().optional(),
  pUnitName: z.string().optional(),
  deptIssualYN: z.string().min(1, "Department issuance status is required"),
  rActiveYN: z.string(),
  transferYN: z.string().optional(),
  rNotes: z.string().optional(),
});

const schema = z.object({
  indentID: z.number(),
  fromDeptID: z.number().min(1, "From department is required"),
  fromDeptName: z.string().min(1, "From department name is required"),
  toDeptID: z.number().min(1, "To department is required"),
  toDeptName: z.string().min(1, "To department name is required"),
  indentDate: z.string().min(1, "Indent date is required"),
  indentCode: z.string().optional(),
  indentType: z.string().min(1, "Indent type is required"),
  indentTypeValue: z.string().optional(),
  catDesc: z.string().optional(),
  catValue: z.string().min(1, "Category is required"),
  autoIndentYN: z.string(),
  indentApprovedYN: z.string(),
  indentAcknowledgement: z.string(),
  transferYN: z.string().optional(),
  rActiveYN: z.string(),
  rNotes: z.string().optional(),
  indentDetails: z.array(detailSchema).min(1, "At least one product must be added"),
});

type IndentFormData = z.infer<typeof schema>;

const IndentProductForm: React.FC<IndentProductFormProps> = ({ open, onClose, initialData, viewOnly = false }) => {
  const { setLoading } = useLoading();
  const { saveIndent } = useIndentProduct();
  const { showAlert } = useAlert();
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [productClearTrigger, setProductClearTrigger] = useState(0);
  const isAddMode = !initialData;
  const serverDate = useServerDate();
  const productSearchRef = useRef<ProductSearchRef>(null);

  // Department selection hooks
  const {
    deptId: fromDeptId,
    deptName: fromDeptName,
    isDialogOpen: isFromDeptDialogOpen,
    isDepartmentSelected: isFromDepartmentSelected,
    openDialog: openFromDeptDialog,
    closeDialog: closeFromDeptDialog,
    handleDepartmentSelect: handleFromDepartmentSelect,
    requireDepartmentSelection: requireFromDepartmentSelection,
  } = useDepartmentSelection();

  const {
    deptId: toDeptId,
    deptName: toDeptName,
    isDialogOpen: isToDeptDialogOpen,
    isDepartmentSelected: isToDepartmentSelected,
    openDialog: openToDeptDialog,
    closeDialog: closeToDeptDialog,
    handleDepartmentSelect: handleToDepartmentSelect,
    requireDepartmentSelection: requireToDepartmentSelection,
  } = useDepartmentSelection();

  const defaultValues: IndentFormData = useMemo(
    () => ({
      indentID: 0,
      fromDeptID: 0,
      fromDeptName: "",
      toDeptID: 0,
      toDeptName: "",
      indentDate: serverDate.toISOString(),
      indentCode: "",
      indentType: "STANDARD",
      indentTypeValue: "",
      catDesc: "",
      catValue: "GENERAL",
      autoIndentYN: "N",
      indentApprovedYN: "N",
      indentAcknowledgement: "",
      transferYN: "N",
      rActiveYN: "Y",
      rNotes: "",
      indentDetails: [],
    }),
    [serverDate]
  );

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors, isDirty, isValid },
  } = useForm<IndentFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "indentDetails",
  });

  const rActiveYN = useWatch({ control, name: "rActiveYN" });
  const indentDetails = useWatch({ control, name: "indentDetails" });

  // Memoized options to prevent unnecessary re-renders
  const categoryOptions = useMemo(
    () => [
      { value: "GENERAL", label: "General" },
      { value: "EMERGENCY", label: "Emergency" },
      { value: "CRITICAL", label: "Critical" },
      { value: "ROUTINE", label: "Routine" },
    ],
    []
  );

  const indentTypeOptions = useMemo(
    () => [
      { value: "STANDARD", label: "Standard" },
      { value: "EMERGENCY", label: "Emergency" },
      { value: "TRANSFER", label: "Transfer" },
      { value: "RETURN", label: "Return" },
    ],
    []
  );

  // Optimized remove handler
  const handleRemoveProduct = useCallback(
    (index: number) => {
      remove(index);
    },
    [remove]
  );

  // Optimized product selection handler
  const handleProductSelect = useCallback(
    (product: ProductSearchResult | null) => {
      if (!product) return;

      const newDetail: IndentDetailDto = {
        indentDetID: 0,
        indentID: getValues("indentID"),
        productID: product.productID,
        productCode: product.productCode,
        productName: product.productName || "",
        catValue: product.catValue || "",
        requiredQty: 1,
        requiredUnitQty: 1,
        pUnitID: 0,
        pUnitName: "",
        deptIssualYN: "N",
        rActiveYN: "Y",
        transferYN: "N",
        rNotes: "",
      };

      append(newDetail);
      setProductClearTrigger((prev) => prev + 1);
    },
    [append, getValues]
  );

  useEffect(() => {
    if (initialData) {
      const formData: IndentFormData = {
        indentID: initialData.indentID,
        fromDeptID: initialData.fromDeptID || 0,
        fromDeptName: initialData.fromDeptName || "",
        toDeptID: initialData.toDeptID || 0,
        toDeptName: initialData.toDeptName || "",
        indentDate: initialData.indentDate ? new Date(initialData.indentDate).toISOString() : serverDate.toISOString(),
        indentCode: initialData.indentCode || "",
        indentType: initialData.indentType || "STANDARD",
        indentTypeValue: initialData.indentTypeValue || "",
        catDesc: initialData.catDesc || "",
        catValue: initialData.catValue || "GENERAL",
        autoIndentYN: initialData.autoIndentYN || "N",
        indentApprovedYN: initialData.indentApprovedYN || "N",
        indentAcknowledgement: initialData.indentAcknowledgement || "",
        transferYN: initialData.transferYN || "N",
        rActiveYN: initialData.rActiveYN || "Y",
        rNotes: initialData.rNotes || "",
        indentDetails: [], // Would be loaded separately in real implementation
      };
      reset(formData);
    } else {
      reset(defaultValues);
    }
  }, [initialData, reset, serverDate, defaultValues]);

  // Update form when departments are selected
  useEffect(() => {
    if (isFromDepartmentSelected) {
      setValue("fromDeptID", fromDeptId, { shouldValidate: true, shouldDirty: true });
      setValue("fromDeptName", fromDeptName, { shouldValidate: true, shouldDirty: true });
    }
  }, [isFromDepartmentSelected, fromDeptId, fromDeptName, setValue]);

  useEffect(() => {
    if (isToDepartmentSelected) {
      setValue("toDeptID", toDeptId, { shouldValidate: true, shouldDirty: true });
      setValue("toDeptName", toDeptName, { shouldValidate: true, shouldDirty: true });
    }
  }, [isToDepartmentSelected, toDeptId, toDeptName, setValue]);

  const onSubmit = async (data: IndentFormData) => {
    if (viewOnly) return;

    // Validate department selections
    if (!isFromDepartmentSelected) {
      showAlert("Warning", "Please select 'From Department'", "warning");
      return;
    }

    if (!isToDepartmentSelected) {
      showAlert("Warning", "Please select 'To Department'", "warning");
      return;
    }

    if (data.fromDeptID === data.toDeptID) {
      showAlert("Warning", "From and To departments cannot be the same", "warning");
      return;
    }

    setFormError(null);

    try {
      setIsSaving(true);
      setLoading(true);

      const indentRequest: IndentSaveRequestDto = {
        IndentMaster: {
          indentID: data.indentID,
          fromDeptID: data.fromDeptID,
          fromDeptName: data.fromDeptName,
          toDeptID: data.toDeptID,
          toDeptName: data.toDeptName,
          indentDate: new Date(data.indentDate),
          indentCode: data.indentCode,
          indentType: data.indentType,
          indentTypeValue: data.indentTypeValue,
          catDesc: data.catDesc,
          catValue: data.catValue,
          autoIndentYN: data.autoIndentYN,
          indentApprovedYN: data.indentApprovedYN,
          indentAcknowledgement: data.indentAcknowledgement,
          transferYN: data.transferYN,
          rActiveYN: data.rActiveYN,
          rNotes: data.rNotes,
        },
        IndentDetails: data.indentDetails.map((detail) => ({
          ...detail,
          indentDetID: detail.indentDetID || 0,
          deptIssualYN: detail.deptIssualYN || "N",
          rActiveYN: detail.rActiveYN || "Y",
          transferYN: detail.transferYN || "N",
        })),
      };

      const success = await saveIndent(indentRequest);

      if (success) {
        showAlert("Success", isAddMode ? "Indent created successfully" : "Indent updated successfully", "success");
        onClose(true);
      } else {
        throw new Error("Failed to save indent");
      }
    } catch (error) {
      console.error("Error saving indent:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save indent";
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  const performReset = useCallback(() => {
    reset(
      initialData
        ? {
            indentID: initialData.indentID,
            fromDeptID: initialData.fromDeptID || 0,
            fromDeptName: initialData.fromDeptName || "",
            toDeptID: initialData.toDeptID || 0,
            toDeptName: initialData.toDeptName || "",
            indentDate: initialData.indentDate ? new Date(initialData.indentDate).toISOString() : serverDate.toISOString(),
            indentCode: initialData.indentCode || "",
            indentType: initialData.indentType || "STANDARD",
            indentTypeValue: initialData.indentTypeValue || "",
            catDesc: initialData.catDesc || "",
            catValue: initialData.catValue || "GENERAL",
            autoIndentYN: initialData.autoIndentYN || "N",
            indentApprovedYN: initialData.indentApprovedYN || "N",
            indentAcknowledgement: initialData.indentAcknowledgement || "",
            transferYN: initialData.transferYN || "N",
            rActiveYN: initialData.rActiveYN || "Y",
            rNotes: initialData.rNotes || "",
            indentDetails: [],
          }
        : defaultValues
    );
    setFormError(null);
  }, [initialData, reset, serverDate, defaultValues]);

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

  const dialogTitle = viewOnly ? "View Indent Details" : isAddMode ? "Create New Indent" : `Edit Indent - ${initialData?.indentCode}`;

  const dialogActions = viewOnly ? (
    <SmartButton text="Close" onClick={() => onClose()} variant="contained" color="primary" />
  ) : (
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
          disabled={isSaving || !isValid}
        />
      </Box>
    </Box>
  );

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

          <Grid container spacing={3}>
            {/* Status Toggle */}
            <Grid size={{ sm: 12 }}>
              <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2}>
                <Typography variant="body2" color="text.secondary">
                  Status:
                </Typography>
                <FormField name="rActiveYN" control={control} label="Active" type="switch" disabled={viewOnly} size="small" />
              </Box>
            </Grid>

            {/* Basic Information Section */}
            <Grid size={{ sm: 12 }}>
              <Card variant="outlined" sx={{ borderLeft: "3px solid #1976d2" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                    Indent Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField
                        name="indentCode"
                        control={control}
                        label="Indent Code"
                        type="text"
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        placeholder="Auto-generated if left empty"
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="indentDate" control={control} label="Indent Date" type="datetimepicker" required disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField
                        name="indentType"
                        control={control}
                        label="Indent Type"
                        type="select"
                        required
                        disabled={viewOnly}
                        size="small"
                        options={indentTypeOptions}
                        fullWidth
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="catValue" control={control} label="Category" type="select" required disabled={viewOnly} size="small" options={categoryOptions} fullWidth />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Department Selection Section */}
            <Grid size={{ sm: 12 }}>
              <Card variant="outlined" sx={{ borderLeft: "3px solid #ff9800" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="#ff9800" fontWeight="bold">
                    Department Selection
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 6 }}>
                      <Box>
                        <Typography variant="body2" gutterBottom>
                          From Department *
                        </Typography>
                        <DepartmentInfoChange deptName={fromDeptName || "Select From Department"} handleChangeClick={openFromDeptDialog} />
                        {!isFromDepartmentSelected && (
                          <Typography variant="caption" color="error">
                            From department is required
                          </Typography>
                        )}
                      </Box>
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <Box>
                        <Typography variant="body2" gutterBottom>
                          To Department *
                        </Typography>
                        <DepartmentInfoChange deptName={toDeptName || "Select To Department"} handleChangeClick={openToDeptDialog} />
                        {!isToDepartmentSelected && (
                          <Typography variant="caption" color="error">
                            To department is required
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Product Selection Section - Enhanced with High-Performance Table */}
            <Grid size={{ sm: 12 }}>
              <Card variant="outlined" sx={{ borderLeft: "3px solid #4caf50" }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" color="#4caf50" fontWeight="bold">
                      Product Selection
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography variant="body2" color="text.secondary">
                        Total Products: {indentDetails?.length || 0}
                      </Typography>
                      {(indentDetails?.length || 0) > 50 && (
                        <Typography
                          variant="caption"
                          color="info.main"
                          sx={{
                            backgroundColor: "info.light",
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                          }}
                        >
                          Virtualized View
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Divider sx={{ mb: 2 }} />

                  {!viewOnly && (
                    <Grid container spacing={2} mb={2}>
                      <Grid size={{ sm: 12, md: 10 }}>
                        <ProductSearch
                          ref={productSearchRef}
                          onProductSelect={handleProductSelect}
                          clearTrigger={productClearTrigger}
                          label="Search and Add Product"
                          placeholder="Search by product name or code"
                        />
                      </Grid>
                      <Grid size={{ sm: 12, md: 2 }}>
                        <CustomButton
                          variant="outlined"
                          icon={AddIcon}
                          text="Add Product"
                          size="medium"
                          onClick={() => {
                            // Focus on product search
                            //productSearchRef.current?.focus();
                          }}
                        />
                      </Grid>
                    </Grid>
                  )}

                  {/* High-Performance Product Details Table */}
                  <HighPerformanceTable fields={fields} control={control} onRemove={handleRemoveProduct} viewOnly={viewOnly} maxHeight={400} />
                </CardContent>
              </Card>
            </Grid>

            {/* Additional Settings */}
            <Grid size={{ sm: 12 }}>
              <Card variant="outlined" sx={{ borderLeft: "3px solid #9c27b0" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="#9c27b0" fontWeight="bold">
                    Additional Settings
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 4 }}>
                      <FormField name="autoIndentYN" control={control} label="Auto Indent" type="switch" disabled={viewOnly} size="small" />
                    </Grid>

                    <Grid size={{ sm: 12, md: 4 }}>
                      <FormField name="indentApprovedYN" control={control} label="Pre-Approved" type="switch" disabled={viewOnly} size="small" />
                    </Grid>

                    <Grid size={{ sm: 12, md: 4 }}>
                      <FormField name="transferYN" control={control} label="Transfer Required" type="switch" disabled={viewOnly} size="small" />
                    </Grid>

                    <Grid size={{ sm: 12 }}>
                      <FormField
                        name="rNotes"
                        control={control}
                        label="Notes"
                        type="textarea"
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        rows={3}
                        placeholder="Enter any additional notes or instructions for this indent"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </GenericDialog>

      {/* Department Selection Dialogs */}
      <DepartmentSelectionDialog open={isFromDeptDialogOpen} onClose={closeFromDeptDialog} onSelectDepartment={handleFromDepartmentSelect} dialogTitle="Select From Department" />

      <DepartmentSelectionDialog open={isToDeptDialogOpen} onClose={closeToDeptDialog} onSelectDepartment={handleToDepartmentSelect} dialogTitle="Select To Department" />

      {/* Confirmation Dialogs */}
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
