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
import { PatientSearchResult } from "@/interfaces/PatientAdministration/Patient/PatientSearch.interface";
import { useAlert } from "@/providers/AlertProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Add as AddIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Business as DepartmentIcon,
  Edit as EditIcon,
  Notes as NotesIcon,
  LocalHospital as PatientIcon,
  Person as PersonIcon,
  ShoppingCart as PurchaseIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Today as TodayIcon,
} from "@mui/icons-material";
import { Alert, Box, Card, CardContent, Chip, Divider, Grid, IconButton, Paper, TextField, Tooltip, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { PatientSearch } from "../../../patientAdministration/CommonPage/Patient/PatientSearch/PatientSearch";
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

// Indent types enum
enum IndentType {
  DEPARTMENT = "DEPARTMENT",
  PATIENT = "PATIENT",
  PURCHASE = "PURCHASE",
}

// Validation schema
const indentFormSchema = z.object({
  // Master data
  indentID: z.number().default(0),
  indentCode: z.string().min(1, "Indent code is required"),
  indentDate: z.date().default(() => new Date()),
  indentType: z.nativeEnum(IndentType).default(IndentType.DEPARTMENT),
  fromDeptID: z.number().min(1, "From department is required"),
  fromDeptName: z.string().min(1, "From department name is required"),
  toDeptID: z.number().optional(),
  toDeptName: z.string().optional(),
  pChartID: z.number().optional(),
  pChartCode: z.string().optional(),
  autoIndentYN: z.string().default("N"),
  indentAcknowledgement: z.string().optional(),
  rNotes: z.string().optional(),
  rActiveYN: z.string().default("Y"),
  transferYN: z.string().default("N"),
});

type IndentFormData = z.infer<typeof indentFormSchema>;

interface IndentDetailRow extends IndentDetailDto {
  isNew?: boolean;
  isEditing?: boolean;
  tempId?: string;
}

const IndentProductForm: React.FC<IndentProductFormProps> = ({ open, onClose, initialData, viewOnly = false, selectedDepartment, onChangeDepartment }) => {
  const { setLoading } = useLoading();
  const { showAlert } = useAlert();
  const { saveIndent, getNextIndentCode } = useIndentProduct();

  // State management
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  // Product selection state
  const [selectedProduct, setSelectedProduct] = useState<ProductSearchResult | null>(null);
  const [indentDetails, setIndentDetails] = useState<IndentDetailRow[]>([]);
  const [editingDetailId, setEditingDetailId] = useState<string | null>(null);
  const [requiredQuantity, setRequiredQuantity] = useState<number>(1);

  // Patient selection state
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchResult | null>(null);
  const [clearPatientTrigger, setClearPatientTrigger] = useState(0);

  // Product search ref
  const productSearchRef = useRef<ProductSearchRef>(null);

  // Load dropdown values
  const { department: departments, departmentIndent } = useDropdownValues(["department", "departmentIndent"]);

  const isAddMode = !initialData;

  // Form setup
  const defaultValues: IndentFormData = useMemo(
    () => ({
      indentID: initialData?.indentID || 0,
      indentCode: initialData?.indentCode || "",
      indentDate: initialData?.indentDate ? new Date(initialData.indentDate) : new Date(),
      indentType: (initialData?.indentType as IndentType) || IndentType.DEPARTMENT,
      fromDeptID: selectedDepartment.deptID,
      fromDeptName: selectedDepartment.department,
      toDeptID: initialData?.toDeptID || 0,
      toDeptName: initialData?.toDeptName || "",
      pChartID: initialData?.pChartID || 0,
      pChartCode: initialData?.pChartCode || "",
      autoIndentYN: initialData?.autoIndentYN || "N",
      indentAcknowledgement: initialData?.indentAcknowledgement || "",
      rNotes: initialData?.rNotes || "",
      rActiveYN: initialData?.rActiveYN || "Y",
      transferYN: initialData?.transferYN || "N",
    }),
    [initialData, selectedDepartment]
  );

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

  // Watch form values
  const watchedIndentType = useWatch({ control, name: "indentType" });
  const watchedFromDeptID = useWatch({ control, name: "fromDeptID" });
  const watchedToDeptID = useWatch({ control, name: "toDeptID" });

  // Generate indent code based on department and year
  const generateIndentCode = useCallback(async () => {
    if (!isAddMode || !selectedDepartment.deptID) return;

    try {
      setIsGeneratingCode(true);
      const currentYear = new Date().getFullYear();
      const deptCode = selectedDepartment.department.substring(0, 4).toUpperCase();

      // Get next sequence number
      const nextCode = await getNextIndentCode("IND", 3);
      if (nextCode) {
        const generatedCode = `${deptCode}/${currentYear}/${nextCode.substring(nextCode.length - 3)}`;
        setValue("indentCode", generatedCode, { shouldValidate: true, shouldDirty: true });
      }
    } catch (error) {
      console.error("Error generating indent code:", error);
      showAlert("Warning", "Failed to generate indent code. Please enter manually.", "warning");
    } finally {
      setIsGeneratingCode(false);
    }
  }, [isAddMode, selectedDepartment, getNextIndentCode, setValue, showAlert]);

  // Initialize form
  useEffect(() => {
    if (initialData) {
      reset(defaultValues);
      // Load existing details if editing
      // This would typically come from a service call
    } else {
      reset(defaultValues);
      generateIndentCode();
    }
  }, [initialData, reset, defaultValues, generateIndentCode]);

  // Handle product selection
  const handleProductSelect = useCallback((product: ProductSearchResult | null) => {
    setSelectedProduct(product);
  }, []);

  // Handle patient selection
  const handlePatientSelect = useCallback(
    (patient: PatientSearchResult | null) => {
      setSelectedPatient(patient);
      if (patient) {
        setValue("pChartID", patient.pChartID);
        setValue("pChartCode", patient.pChartCode);
      } else {
        setValue("pChartID", 0);
        setValue("pChartCode", "");
      }
    },
    [setValue]
  );

  // Add product to indent details
  const handleAddProduct = useCallback(() => {
    if (!selectedProduct || requiredQuantity <= 0) {
      showAlert("Warning", "Please select a product and enter a valid quantity", "warning");
      return;
    }

    // Check if product already exists
    const existingProduct = indentDetails.find((detail) => detail.productID === selectedProduct.productID);
    if (existingProduct) {
      showAlert("Warning", "This product is already added to the indent", "warning");
      return;
    }

    const newDetail: IndentDetailRow = {
      indentDetID: 0,
      indentID: 0,
      productID: selectedProduct.productID,
      productCode: selectedProduct.productCode || "",
      productName: selectedProduct.productName || "",
      catValue: selectedProduct.catValue || "",
      requiredQty: requiredQuantity,
      requiredUnitQty: requiredQuantity,
      receivedQty: 0,
      deptIssualYN: "N",
      rActiveYN: "Y",
      transferYN: "N",
      rNotes: "",
      isNew: true,
      tempId: `temp-${Date.now()}`,
    };

    setIndentDetails((prev) => [...prev, newDetail]);

    // Clear selections
    setSelectedProduct(null);
    setRequiredQuantity(1);
    productSearchRef.current?.clearSelection();
  }, [selectedProduct, requiredQuantity, indentDetails, showAlert]);

  // Remove product from indent details
  const handleRemoveProduct = useCallback((tempId: string | undefined, indentDetID: number) => {
    setIndentDetails((prev) => prev.filter((detail) => (tempId ? detail.tempId !== tempId : detail.indentDetID !== indentDetID)));
  }, []);

  // Edit product quantity
  const handleEditQuantity = useCallback(
    (detail: IndentDetailRow, newQuantity: number) => {
      if (newQuantity <= 0) {
        showAlert("Warning", "Quantity must be greater than 0", "warning");
        return;
      }

      setIndentDetails((prev) =>
        prev.map((item) => (item.tempId === detail.tempId || item.indentDetID === detail.indentDetID ? { ...item, requiredQty: newQuantity, requiredUnitQty: newQuantity } : item))
      );
      setEditingDetailId(null);
    },
    [showAlert]
  );

  // Form submission
  const onSubmit = async (data: IndentFormData) => {
    if (viewOnly) return;

    if (indentDetails.length === 0) {
      showAlert("Warning", "Please add at least one product to the indent", "warning");
      return;
    }

    // Validate based on indent type
    if (data.indentType === IndentType.PATIENT && !data.pChartID) {
      showAlert("Warning", "Please select a patient for patient indent", "warning");
      return;
    }

    if (data.indentType === IndentType.DEPARTMENT && !data.toDeptID) {
      showAlert("Warning", "Please select a destination department", "warning");
      return;
    }

    setFormError(null);

    try {
      setIsSaving(true);
      setLoading(true);

      const indentMaster: IndentMastDto = {
        indentID: data.indentID,
        indentCode: data.indentCode,
        indentDate: data.indentDate,
        indentType: data.indentType,
        indentTypeValue: data.indentType,
        fromDeptID: data.fromDeptID,
        fromDeptName: data.fromDeptName,
        toDeptID: data.toDeptID || 0,
        toDeptName: data.toDeptName || "",
        pChartID: data.pChartID || 0,
        pChartCode: data.pChartCode || "",
        autoIndentYN: data.autoIndentYN,
        indentApprovedYN: "N",
        indentAcknowledgement: data.indentAcknowledgement || "",
        indStatusCode: "PENDING",
        indStatus: "Pending",
        rActiveYN: data.rActiveYN,
        transferYN: data.transferYN,
        rNotes: data.rNotes || "",
      };

      const indentDetailsData: IndentDetailDto[] = indentDetails.map((detail) => ({
        ...detail,
        indentID: data.indentID,
        isNew: undefined,
        isEditing: undefined,
        tempId: undefined,
      }));

      const saveRequest: IndentSaveRequestDto = {
        IndentMaster: indentMaster,
        IndentDetails: indentDetailsData,
      };

      const response = await saveIndent(saveRequest);

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
    reset(defaultValues);
    setIndentDetails([]);
    setSelectedProduct(null);
    setSelectedPatient(null);
    setRequiredQuantity(1);
    setFormError(null);
    setClearPatientTrigger((prev) => prev + 1);
    productSearchRef.current?.clearSelection();

    if (isAddMode) {
      generateIndentCode();
    }
  }, [reset, defaultValues, isAddMode, generateIndentCode]);

  const handleReset = useCallback(() => {
    if (isDirty || indentDetails.length > 0) {
      setShowResetConfirmation(true);
    } else {
      performReset();
    }
  }, [isDirty, indentDetails.length, performReset]);

  const handleCancel = useCallback(() => {
    if (isDirty || indentDetails.length > 0) {
      setShowCancelConfirmation(true);
    } else {
      onClose();
    }
  }, [isDirty, indentDetails.length, onClose]);

  // Get indent type icon and label
  const getIndentTypeInfo = (type: IndentType) => {
    switch (type) {
      case IndentType.DEPARTMENT:
        return { icon: DepartmentIcon, label: "Department Indent", color: "#1976d2" };
      case IndentType.PATIENT:
        return { icon: PatientIcon, label: "Patient Indent", color: "#2e7d32" };
      case IndentType.PURCHASE:
        return { icon: PurchaseIcon, label: "Purchase Indent", color: "#ed6c02" };
      default:
        return { icon: DepartmentIcon, label: "Department Indent", color: "#1976d2" };
    }
  };

  const currentTypeInfo = getIndentTypeInfo(watchedIndentType);

  // Define grid columns for indent details
  const detailColumns: Column<IndentDetailRow>[] = [
    {
      key: "productCode",
      header: "Product Code",
      visible: true,
      width: 150,
      sortable: false,
    },
    {
      key: "productName",
      header: "Product Name",
      visible: true,
      width: 250,
      sortable: false,
    },
    {
      key: "catValue",
      header: "Category",
      visible: true,
      width: 150,
      sortable: false,
    },
    {
      key: "requiredQty",
      header: "Required Qty",
      visible: true,
      width: 120,
      sortable: false,
      render: (item) => (
        <Box>
          {editingDetailId === (item.tempId || item.indentDetID.toString()) ? (
            <TextField
              type="number"
              size="small"
              defaultValue={item.requiredQty}
              inputProps={{ min: 1 }}
              onBlur={(e) => handleEditQuantity(item, parseInt(e.target.value) || 1)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleEditQuantity(item, parseInt((e.target as HTMLInputElement).value) || 1);
                }
              }}
              autoFocus
            />
          ) : (
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2">{item.requiredQty}</Typography>
              {!viewOnly && (
                <IconButton size="small" onClick={() => setEditingDetailId(item.tempId || item.indentDetID.toString())}>
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          )}
        </Box>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      visible: !viewOnly,
      width: 100,
      sortable: false,
      render: (item) => (
        <Tooltip title="Remove Product">
          <IconButton size="small" color="error" onClick={() => handleRemoveProduct(item.tempId, item.indentDetID)} disabled={viewOnly}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  // Dialog title
  const dialogTitle = useMemo(() => {
    if (viewOnly) return "View Indent Details";
    if (isAddMode) return "Create New Indent";
    return `Edit Indent - ${initialData?.indentCode}`;
  }, [viewOnly, isAddMode, initialData]);

  // Dialog actions
  const dialogActions = useMemo(() => {
    if (viewOnly) {
      return <SmartButton text="Close" onClick={() => onClose()} variant="contained" color="primary" />;
    }

    return (
      <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
        <SmartButton text="Cancel" onClick={handleCancel} variant="outlined" color="inherit" disabled={isSaving} />
        <Box sx={{ display: "flex", gap: 1 }}>
          <SmartButton text="Reset" onClick={handleReset} variant="outlined" color="error" icon={CancelIcon} disabled={isSaving || (!isDirty && indentDetails.length === 0)} />
          <SmartButton
            text={isAddMode ? "Create Indent" : "Update Indent"}
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            color="primary"
            icon={SaveIcon}
            asynchronous={true}
            showLoadingIndicator={true}
            loadingText={isAddMode ? "Creating..." : "Updating..."}
            successText={isAddMode ? "Created!" : "Updated!"}
            disabled={isSaving || !isValid || indentDetails.length === 0}
          />
        </Box>
      </Box>
    );
  }, [viewOnly, handleCancel, handleReset, handleSubmit, onSubmit, onClose, isSaving, isDirty, isValid, indentDetails.length, isAddMode]);

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
            {/* Header Section */}
            <Grid size={{ xs: 12 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={2}>
                  <currentTypeInfo.icon sx={{ color: currentTypeInfo.color, fontSize: 32 }} />
                  <Typography variant="h6" fontWeight="bold" color={currentTypeInfo.color}>
                    {currentTypeInfo.label}
                  </Typography>
                  <Chip label={selectedDepartment.department} color="primary" variant="outlined" icon={<DepartmentIcon />} />
                </Box>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="body2" color="text.secondary">
                    Status:
                  </Typography>
                  <FormField name="rActiveYN" control={control} label="Active" type="switch" disabled={viewOnly} size="small" />
                </Box>
              </Box>
            </Grid>

            {/* Basic Information Section */}
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined" sx={{ borderLeft: "3px solid #1976d2" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                    <TodayIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                    Basic Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <FormField name="indentCode" control={control} label="Indent Code" type="text" required disabled={viewOnly || !isAddMode} size="small" fullWidth />
                        {!viewOnly && isAddMode && (
                          <SmartButton
                            text="Generate"
                            onClick={generateIndentCode}
                            variant="outlined"
                            size="small"
                            icon={RefreshIcon}
                            disabled={isGeneratingCode}
                            asynchronous={true}
                            showLoadingIndicator={true}
                            loadingText="..."
                          />
                        )}
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <FormField name="indentDate" control={control} label="Indent Date" type="datepicker" required disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <FormField
                        name="indentType"
                        control={control}
                        label="Indent Type"
                        type="select"
                        required
                        disabled={viewOnly}
                        options={[
                          { value: IndentType.DEPARTMENT, label: "Department Indent" },
                          { value: IndentType.PATIENT, label: "Patient Indent" },
                          { value: IndentType.PURCHASE, label: "Purchase Indent" },
                        ]}
                        size="small"
                        fullWidth
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormField name="fromDeptName" control={control} label="From Department" type="text" required disabled={true} size="small" fullWidth />
                    </Grid>

                    {/* Conditional fields based on indent type */}
                    {watchedIndentType === IndentType.DEPARTMENT && (
                      <Grid size={{ xs: 12, md: 6 }}>
                        <FormField
                          name="toDeptID"
                          control={control}
                          label="To Department"
                          type="select"
                          required
                          disabled={viewOnly}
                          options={
                            departments
                              ?.filter((dept) => dept.value !== watchedFromDeptID.toString())
                              .map((dept) => ({
                                value: parseInt(dept.value.toString()),
                                label: dept.label,
                              })) || []
                          }
                          onChange={(value) => {
                            const selectedDept = departments?.find((dept) => parseInt(dept.value.toString()) === value);
                            if (selectedDept) {
                              setValue("toDeptName", selectedDept.label);
                            }
                          }}
                          size="small"
                          fullWidth
                        />
                      </Grid>
                    )}

                    {watchedIndentType === IndentType.PATIENT && (
                      <Grid size={{ xs: 12, md: 6 }}>
                        <PatientSearch onPatientSelect={handlePatientSelect} clearTrigger={clearPatientTrigger} label="Select Patient" disabled={viewOnly} />
                      </Grid>
                    )}

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box>
                        <FormField name="autoIndentYN" control={control} label="Auto Indent" type="switch" disabled={viewOnly} size="small" />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                          Enable automatic indent generation based on stock levels
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Product Selection Section */}
            {!viewOnly && (
              <Grid size={{ xs: 12 }}>
                <Card variant="outlined" sx={{ borderLeft: "3px solid #2e7d32" }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="#2e7d32" fontWeight="bold">
                      <AddIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                      Add Products
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <Grid container spacing={2} alignItems="end">
                      <Grid size={{ xs: 12, md: 6 }}>
                        <ProductSearch ref={productSearchRef} onProductSelect={handleProductSelect} label="Select Product" disabled={viewOnly} className="product-search-field" />
                      </Grid>

                      <Grid size={{ xs: 12, md: 3 }}>
                        <TextField
                          label="Required Quantity"
                          type="number"
                          value={requiredQuantity}
                          onChange={(e) => setRequiredQuantity(parseInt(e.target.value) || 1)}
                          size="small"
                          fullWidth
                          inputProps={{ min: 1 }}
                          disabled={viewOnly}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, md: 3 }}>
                        <SmartButton
                          text="Add Product"
                          onClick={handleAddProduct}
                          variant="contained"
                          color="success"
                          icon={AddIcon}
                          disabled={!selectedProduct || requiredQuantity <= 0}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Indent Details Grid */}
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined" sx={{ borderLeft: "3px solid #ed6c02" }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" color="#ed6c02" fontWeight="bold">
                      Indent Products ({indentDetails.length})
                    </Typography>
                    {indentDetails.length > 0 && (
                      <Chip label={`Total Items: ${indentDetails.reduce((sum, item) => sum + (item.requiredQty || 0), 0)}`} color="warning" variant="outlined" />
                    )}
                  </Box>
                  <Divider sx={{ mb: 2 }} />

                  {indentDetails.length > 0 ? (
                    <CustomGrid
                      columns={detailColumns}
                      data={indentDetails}
                      maxHeight="400px"
                      emptyStateMessage="No products added to this indent"
                      density="small"
                      loading={false}
                    />
                  ) : (
                    <Paper sx={{ p: 4, textAlign: "center", bgcolor: "grey.50" }}>
                      <PersonIcon sx={{ fontSize: 48, color: "grey.400", mb: 1 }} />
                      <Typography variant="h6" color="grey.600" gutterBottom>
                        No Products Added
                      </Typography>
                      <Typography variant="body2" color="grey.500">
                        {viewOnly ? "This indent doesn't have any products" : "Use the product search above to add products to this indent"}
                      </Typography>
                    </Paper>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Additional Information Section */}
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined" sx={{ borderLeft: "3px solid #9c27b0" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="#9c27b0" fontWeight="bold">
                    <NotesIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                    Additional Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormField
                        name="indentAcknowledgement"
                        control={control}
                        label="Acknowledgement"
                        type="textarea"
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        rows={4}
                        placeholder="Enter acknowledgement or approval notes"
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormField
                        name="rNotes"
                        control={control}
                        label="Notes"
                        type="textarea"
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        rows={4}
                        placeholder="Enter any additional notes or special instructions for this indent"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </GenericDialog>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        open={showResetConfirmation}
        onClose={() => setShowResetConfirmation(false)}
        onConfirm={() => {
          performReset();
          setShowResetConfirmation(false);
        }}
        title="Reset Form"
        message="Are you sure you want to reset the form? All unsaved changes and added products will be lost."
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
