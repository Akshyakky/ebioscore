// src/pages/inventoryManagement/IndentProduct/Form/IndentProductForm.tsx

import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import { useServerDate } from "@/hooks/Common/useServerDate";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { IndentDetailDto, IndentMastDto, IndentSaveRequestDto } from "@/interfaces/InventoryManagement/IndentProductDto";
import { ProductSearchResult } from "@/interfaces/InventoryManagement/Product/ProductSearch.interface";
import { useAlert } from "@/providers/AlertProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Assignment, Cancel, ChangeCircleRounded, Inventory, Notes, RemoveCircle, Save } from "@mui/icons-material";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
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

const indentDetailSchema = z.object({
  indentDetID: z.number().default(0),
  productID: z.number().min(1, "Product is required"),
  productCode: z.string().min(1, "Product code is required"),
  productName: z.string().optional(),
  requiredQty: z.number().min(0.01, "Quantity must be greater than 0"),
  requiredUnitQty: z.number().min(0, "Unit quantity must be non-negative").default(0),
  unitPack: z.number().min(0, "Unit pack must be non-negative").default(1),
  pUnitName: z.string().optional(),
  manufacturerName: z.string().optional(),
  rNotes: z.string().optional(),
  rActiveYN: z.string().default("Y"),
  transferYN: z.string().default("N"),
  deptIssualYN: z.string().default("N"),
});

const schema = z.object({
  indentID: z.number().default(0),
  indentCode: z.string().min(1, "Indent code is required"),
  fromDeptID: z.number().min(1, "From department is required"),
  fromDeptName: z.string().optional(),
  toDeptID: z.number().min(1, "To department is required"),
  toDeptName: z.string().optional(),
  indentDate: z.date().default(() => new Date()),
  indentType: z.string().min(1, "Indent type is required"),
  indentTypeValue: z.string().optional(),
  pChartID: z.number().optional(),
  pChartCode: z.string().optional(),
  autoIndentYN: z.string().default("N"),
  indentApprovedYN: z.string().default("N"),
  indentAcknowledgement: z.string().optional(),
  indStatusCode: z.string().default("PENDING"),
  indStatus: z.string().optional(),
  rActiveYN: z.string().default("Y"),
  transferYN: z.string().default("N"),
  rNotes: z.string().optional(),
  indentDetails: z.array(indentDetailSchema).min(1, "At least one product is required"),
});

type IndentFormData = z.infer<typeof schema>;
type IndentDetailFormData = z.infer<typeof indentDetailSchema>;

const IndentProductForm: React.FC<IndentProductFormProps> = ({ open, onClose, initialData, viewOnly = false, selectedDepartment, onChangeDepartment }) => {
  const { setLoading } = useLoading();
  const { showAlert } = useAlert();
  const serverDate = useServerDate();
  const { saveIndent, getNextIndentCode } = useIndentProduct();
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const productSearchRef = useRef<ProductSearchRef>(null);
  const isAddMode = !initialData;

  const { department, departmentIndent } = useDropdownValues(["department", "departmentIndent"]);

  const defaultValues: IndentFormData = {
    indentID: 0,
    indentCode: "",
    fromDeptID: selectedDepartment.deptID,
    fromDeptName: selectedDepartment.department,
    toDeptID: 0,
    toDeptName: "",
    indentDate: serverDate,
    indentType: "",
    indentTypeValue: "",
    pChartID: 0,
    pChartCode: "",
    autoIndentYN: "N",
    indentApprovedYN: "N",
    indentAcknowledgement: "",
    indStatusCode: "PENDING",
    indStatus: "Pending",
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
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "indentDetails",
  });

  const watchedToDeptID = useWatch({ control, name: "toDeptID" });
  const watchedIndentDetails = useWatch({ control, name: "indentDetails" });

  // Update to department name when department ID changes
  useEffect(() => {
    if (watchedToDeptID) {
      const selectedDept = department?.find((dept) => Number(dept.value) === watchedToDeptID);
      if (selectedDept) {
        setValue("toDeptName", selectedDept.label, { shouldValidate: true });
      }
    }
  }, [watchedToDeptID, department, setValue]);

  // Generate indent code on mount for new indents
  useEffect(() => {
    if (isAddMode && open && !watch("indentCode")) {
      generateIndentCode();
    }
  }, [isAddMode, open]);

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      const formData: IndentFormData = {
        indentID: initialData.indentID,
        indentCode: initialData.indentCode || "",
        fromDeptID: selectedDepartment.deptID,
        fromDeptName: selectedDepartment.department,
        toDeptID: initialData.toDeptID || 0,
        toDeptName: initialData.toDeptName || "",
        indentDate: initialData.indentDate ? new Date(initialData.indentDate) : serverDate,
        indentType: initialData.indentType || "",
        indentTypeValue: initialData.indentTypeValue || "",
        pChartID: initialData.pChartID || 0,
        pChartCode: initialData.pChartCode || "",
        autoIndentYN: initialData.autoIndentYN || "N",
        indentApprovedYN: initialData.indentApprovedYN || "N",
        indentAcknowledgement: initialData.indentAcknowledgement || "",
        indStatusCode: initialData.indStatusCode || "PENDING",
        indStatus: initialData.indStatus || "Pending",
        rActiveYN: initialData.rActiveYN || "Y",
        transferYN: initialData.transferYN || "N",
        rNotes: initialData.rNotes || "",
        indentDetails: [], // Will be loaded separately if needed
      };
      reset(formData);
    } else {
      reset({
        ...defaultValues,
        fromDeptID: selectedDepartment.deptID,
        fromDeptName: selectedDepartment.department,
        indentDate: serverDate,
      });
    }
  }, [initialData, reset, selectedDepartment, serverDate]);

  const generateIndentCode = async () => {
    try {
      setIsGeneratingCode(true);
      const nextCode = await getNextIndentCode("IND", 5);
      if (nextCode) {
        setValue("indentCode", nextCode, { shouldValidate: true, shouldDirty: true });
      }
    } catch (error) {
      showAlert("Warning", "Failed to generate indent code", "warning");
    } finally {
      setIsGeneratingCode(false);
    }
  };

  // Helper function to convert IndentDetailDto to form data type
  const convertToFormDetail = (detail: IndentDetailDto): IndentDetailFormData => {
    return {
      indentDetID: detail.indentDetID || 0,
      productID: detail.productID || 0,
      productCode: detail.productCode || "",
      productName: detail.productName || "",
      requiredQty: detail.requiredQty || 1,
      requiredUnitQty: detail.requiredUnitQty || 0,
      unitPack: detail.unitPack || 1,
      pUnitName: detail.pUnitName || "",
      manufacturerName: detail.manufacturerName || "",
      rNotes: detail.rNotes || "",
      rActiveYN: detail.rActiveYN || "Y",
      transferYN: detail.transferYN || "N",
      deptIssualYN: detail.deptIssualYN || "N",
    };
  };

  // Helper function to convert form data to IndentDetailDto
  const convertToDetailDto = (formDetail: IndentDetailFormData): IndentDetailDto => {
    return {
      indentDetID: formDetail.indentDetID,
      indentID: 0,
      productID: formDetail.productID,
      productCode: formDetail.productCode,
      productName: formDetail.productName,
      requiredQty: formDetail.requiredQty,
      requiredUnitQty: formDetail.requiredUnitQty,
      unitPack: formDetail.unitPack,
      pUnitName: formDetail.pUnitName,
      manufacturerName: formDetail.manufacturerName,
      rNotes: formDetail.rNotes,
      rActiveYN: formDetail.rActiveYN,
      transferYN: formDetail.transferYN,
      deptIssualYN: formDetail.deptIssualYN,
      // Include all other optional properties with default values
      catValue: "",
      pGrpID: 0,
      rOL: 0,
      expiryYN: "",
      ppkgID: 0,
      psGrpID: 0,
      pUnitID: 0,
      poNo: 0,
      receivedQty: 0,
      manufacturerID: 0,
      manufacturerCode: "",
      deptIssualID: 0,
      grnDetID: 0,
      imrMedID: 0,
      indentDetStatusCode: "",
      indGrnDetStatusCode: "",
      supplierID: 0,
      supplierName: "",
      catDesc: "",
      mfName: "",
      pGrpName: "",
      ppkgName: "",
      psGrpName: "",
      hsnCode: "",
      tax: 0,
      cgstPerValue: 0,
      sgstPerValue: 0,
      qoh: 0,
      average: 0,
      reOrderLevel: 0,
      minLevelUnits: 0,
      maxLevelUnits: 0,
      netValue: 0,
      unitsPackage: 0,
      units: "",
      package: "",
      groupName: "",
      baseUnit: 0,
      leadTime: 0,
      averageDemand: 0,
      StockLevel: 0,
      Roq: 0,
      Location: "",
    };
  };

  const handleProductSelect = (product: ProductSearchResult | null) => {
    if (product && !viewOnly) {
      // Check if product already exists in the list
      const existingIndex = watchedIndentDetails.findIndex((detail) => detail.productID === product.productID);

      if (existingIndex >= 0) {
        showAlert("Warning", "Product already added to the indent", "warning");
        return;
      }

      const newDetail: IndentDetailFormData = {
        indentDetID: 0,
        productID: product.productID,
        productCode: product.productCode || "",
        productName: product.productName || "",
        requiredQty: 1,
        requiredUnitQty: 0,
        unitPack: 1,
        pUnitName: "",
        manufacturerName: "",
        rNotes: "",
        rActiveYN: "Y",
        transferYN: "N",
        deptIssualYN: "N",
      };

      append(newDetail);

      // Clear the product search
      if (productSearchRef.current) {
        productSearchRef.current.clearSelection();
      }
    }
  };

  const handleRemoveProduct = (index: number) => {
    if (!viewOnly) {
      remove(index);
    }
  };

  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (!viewOnly && newQuantity >= 0) {
      const currentDetail = watchedIndentDetails[index];
      const updatedDetail: IndentDetailFormData = {
        indentDetID: currentDetail?.indentDetID ?? 0,
        productID: currentDetail?.productID ?? 0,
        productCode: currentDetail?.productCode ?? "",
        requiredQty: newQuantity,
        requiredUnitQty: newQuantity * (currentDetail?.unitPack ?? 1),
        unitPack: currentDetail?.unitPack ?? 1,
        rActiveYN: currentDetail?.rActiveYN ?? "Y",
        transferYN: currentDetail?.transferYN ?? "N",
        deptIssualYN: currentDetail?.deptIssualYN ?? "N",
        productName: currentDetail?.productName,
        pUnitName: currentDetail?.pUnitName,
        manufacturerName: currentDetail?.manufacturerName,
        rNotes: currentDetail?.rNotes,
      };
      update(index, updatedDetail);
    }
  };

  const handleNotesChange = (index: number, newNotes: string) => {
    if (!viewOnly) {
      const currentDetail = watchedIndentDetails[index];
      const updatedDetail: IndentDetailFormData = {
        indentDetID: currentDetail?.indentDetID ?? 0,
        productID: currentDetail?.productID ?? 0,
        productCode: currentDetail?.productCode ?? "",
        requiredQty: currentDetail?.requiredQty ?? 0,
        requiredUnitQty: currentDetail?.requiredUnitQty ?? 0,
        unitPack: currentDetail?.unitPack ?? 1,
        rActiveYN: currentDetail?.rActiveYN ?? "Y",
        transferYN: currentDetail?.transferYN ?? "N",
        deptIssualYN: currentDetail?.deptIssualYN ?? "N",
        productName: currentDetail?.productName,
        pUnitName: currentDetail?.pUnitName,
        manufacturerName: currentDetail?.manufacturerName,
        rNotes: newNotes,
      };
      update(index, updatedDetail);
    }
  };

  const onSubmit = async (data: IndentFormData) => {
    if (viewOnly) return;

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
          indentDate: data.indentDate,
          indentCode: data.indentCode,
          indentType: data.indentType,
          indentTypeValue: data.indentTypeValue,
          pChartID: data.pChartID,
          pChartCode: data.pChartCode,
          autoIndentYN: data.autoIndentYN,
          indentApprovedYN: data.indentApprovedYN,
          indentAcknowledgement: data.indentAcknowledgement,
          indStatusCode: data.indStatusCode,
          indStatus: data.indStatus,
          rActiveYN: data.rActiveYN,
          transferYN: data.transferYN,
          rNotes: data.rNotes,
          auGrpID: 0,
          catDesc: "",
          catValue: "",
          indexpiryYN: "",
          indGrnStatusCode: "",
          indGrnStatus: "",
          oldPChartID: 0,
        },
        IndentDetails: data.indentDetails.map(convertToDetailDto),
      };

      const response = await saveIndent(indentRequest);

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

  const performReset = () => {
    const resetData = initialData
      ? {
          indentID: initialData.indentID,
          indentCode: initialData.indentCode || "",
          fromDeptID: selectedDepartment.deptID,
          fromDeptName: selectedDepartment.department,
          toDeptID: initialData.toDeptID || 0,
          toDeptName: initialData.toDeptName || "",
          indentDate: initialData.indentDate ? new Date(initialData.indentDate) : serverDate,
          indentType: initialData.indentType || "",
          indentTypeValue: initialData.indentTypeValue || "",
          pChartID: initialData.pChartID || 0,
          pChartCode: initialData.pChartCode || "",
          autoIndentYN: initialData.autoIndentYN || "N",
          indentApprovedYN: initialData.indentApprovedYN || "N",
          indentAcknowledgement: initialData.indentAcknowledgement || "",
          indStatusCode: initialData.indStatusCode || "PENDING",
          indStatus: initialData.indStatus || "Pending",
          rActiveYN: initialData.rActiveYN || "Y",
          transferYN: initialData.transferYN || "N",
          rNotes: initialData.rNotes || "",
          indentDetails: [],
        }
      : {
          ...defaultValues,
          fromDeptID: selectedDepartment.deptID,
          fromDeptName: selectedDepartment.department,
          indentDate: serverDate,
        };

    reset(resetData);
    setFormError(null);
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

  const dialogTitle = useMemo(() => {
    if (viewOnly) return "View Indent Details";
    if (isAddMode) return "Create New Indent";
    return `Edit Indent - ${initialData?.indentCode}`;
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
  }, [viewOnly, isSaving, isDirty, isValid, formError, isAddMode, handleSubmit, onSubmit, onClose, handleReset, handleCancel]);

  // Calculate totals
  const totalItems = watchedIndentDetails.length;
  const totalQuantity = watchedIndentDetails.reduce((sum, detail) => sum + (detail.requiredQty || 0), 0);

  // Render empty state
  const renderEmptyState = () => (
    <Box sx={{ textAlign: "center", py: 4 }}>
      <Inventory sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        No products added to the indent
      </Typography>
      <Typography variant="body2" color="text.disabled">
        Use the search field above to find and add products to this indent.
      </Typography>
    </Box>
  );

  // Render product table
  const renderProductTable = () => (
    <TableContainer sx={{ maxHeight: 400 }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 150, fontWeight: "bold" }}>Product Code</TableCell>
            <TableCell sx={{ width: 250, fontWeight: "bold" }}>Product Name</TableCell>
            <TableCell sx={{ width: 120, fontWeight: "bold" }}>Quantity</TableCell>
            <TableCell sx={{ width: 80, fontWeight: "bold" }}>Unit</TableCell>
            <TableCell sx={{ width: 150, fontWeight: "bold" }}>Manufacturer</TableCell>
            <TableCell sx={{ width: 200, fontWeight: "bold" }}>Notes</TableCell>
            {!viewOnly && <TableCell sx={{ width: 80, fontWeight: "bold" }}>Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {watchedIndentDetails.map((item, index) => (
            <TableRow key={`${item.productID}-${index}`} hover>
              <TableCell>{item.productCode}</TableCell>
              <TableCell>{item.productName}</TableCell>
              <TableCell>
                <TextField
                  type="number"
                  size="small"
                  value={item.requiredQty || 0}
                  onChange={(e) => handleQuantityChange(index, Number(e.target.value))}
                  disabled={viewOnly}
                  inputProps={{ min: 0, step: 0.01 }}
                  sx={{ width: 100 }}
                />
              </TableCell>
              <TableCell>{item.pUnitName}</TableCell>
              <TableCell>{item.manufacturerName}</TableCell>
              <TableCell>
                <TextField
                  size="small"
                  value={item.rNotes || ""}
                  onChange={(e) => handleNotesChange(index, e.target.value)}
                  disabled={viewOnly}
                  placeholder="Enter notes"
                  sx={{ width: 180 }}
                />
              </TableCell>
              {!viewOnly && (
                <TableCell>
                  <IconButton size="small" color="error" onClick={() => handleRemoveProduct(index)} disabled={viewOnly}>
                    <RemoveCircle fontSize="small" />
                  </IconButton>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
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
            <Grid size={{ xs: 12 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    <Assignment sx={{ mr: 1, verticalAlign: "middle" }} />
                    From Department: {selectedDepartment.department}
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

            {/* Basic Information Section */}
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined" sx={{ borderLeft: "3px solid #1976d2" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                    Basic Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormField name="indentCode" control={control} label="Indent Code" type="text" required disabled={viewOnly || !isAddMode} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormField name="indentDate" control={control} label="Indent Date" type="datepicker" required disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormField
                        name="toDeptID"
                        control={control}
                        label="To Department"
                        type="select"
                        required
                        disabled={viewOnly}
                        placeholder="Select destination department"
                        options={
                          department
                            ?.filter((dept) => Number(dept.value) !== selectedDepartment.deptID)
                            .map((dept) => ({
                              value: Number(dept.value),
                              label: dept.label,
                            })) || []
                        }
                        size="small"
                        fullWidth
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormField
                        name="indentType"
                        control={control}
                        label="Indent Type"
                        type="select"
                        required
                        disabled={viewOnly}
                        placeholder="Select indent type"
                        options={
                          departmentIndent?.map((option) => ({
                            value: option.value,
                            label: option.label,
                          })) || []
                        }
                        size="small"
                        fullWidth
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormField
                        name="pChartCode"
                        control={control}
                        label="Patient Chart Code"
                        type="text"
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        placeholder="Enter patient chart code (if applicable)"
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box>
                        <FormField name="autoIndentYN" control={control} label="Auto Indent" type="switch" disabled={viewOnly} size="small" />
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

                  {!viewOnly && (
                    <Box sx={{ mb: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, md: 8 }}>
                          <ProductSearch
                            ref={productSearchRef}
                            onProductSelect={handleProductSelect}
                            label="Search and Add Products"
                            placeholder="Search by product name or code"
                            disabled={viewOnly}
                            className="product-search-field"
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Paper sx={{ p: 1, bgcolor: "rgba(255, 152, 0, 0.08)" }}>
                            <Typography variant="body2" color="#ff9800" fontWeight="medium">
                              Total Items: {totalItems} | Total Qty: {totalQuantity}
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {/* Product Details Table */}
                  <Box sx={{ mt: 2 }}>
                    <Paper variant="outlined" sx={{ borderRadius: 1 }}>
                      {watchedIndentDetails.length === 0 ? renderEmptyState() : renderProductTable()}
                    </Paper>
                  </Box>

                  {/* Summary Information */}
                  {watchedIndentDetails.length > 0 && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: "rgba(255, 152, 0, 0.08)", borderRadius: 1 }}>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 6, md: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            Total Items
                          </Typography>
                          <Typography variant="h6" color="#ff9800" fontWeight="bold">
                            {totalItems}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            Total Quantity
                          </Typography>
                          <Typography variant="h6" color="#ff9800" fontWeight="bold">
                            {totalQuantity}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            Status
                          </Typography>
                          <Chip size="small" color={watch("indentApprovedYN") === "Y" ? "success" : "warning"} label={watch("indentApprovedYN") === "Y" ? "Approved" : "Pending"} />
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            Auto Indent
                          </Typography>
                          <Chip size="small" color={watch("autoIndentYN") === "Y" ? "info" : "default"} label={watch("autoIndentYN") === "Y" ? "Enabled" : "Disabled"} />
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Additional Information Section */}
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
                        label="Indent Notes"
                        type="textarea"
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        rows={4}
                        placeholder="Enter any additional notes about this indent, including special instructions or requirements"
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

export default IndentProductForm;
