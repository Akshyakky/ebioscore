import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { ProductStockReturnCompositeDto, ProductStockReturnDto } from "@/interfaces/InventoryManagement/ProductStockReturnDto";
import { useAlert } from "@/providers/AlertProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check as CheckIcon, ContentCopy as ContentCopyIcon, Refresh, Save, Search as SearchIcon, Sync as SyncIcon } from "@mui/icons-material";
import { Alert, Box, CircularProgress, FormControl, Grid, IconButton, InputAdornment, InputLabel, MenuItem, Paper, Select, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { PhysicianReturnType, usePhysicianReturn } from "../hook/usePhysicianReturn";
import PhysicianReturnBillingSection from "./PhysicianReturnBillingSection";
import PhysicianReturnProductSection from "./PhysicianReturnProductSection";

interface PhysicianReturnFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  initialData: ProductStockReturnDto | null;
  viewOnly?: boolean;
  copyMode?: boolean;
  selectedDepartmentId?: number;
  selectedDepartmentName?: string;
}

const returnDetailSchema = z.object({
  psrdID: z.number(),
  psrID: z.number(),
  productID: z.number().min(1, "Product is required"),
  productCode: z.string().optional(),
  productName: z.string().min(1, "Product name is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be non-negative"),
  totalAmount: z.number().min(0, "Total amount must be non-negative"),
  batchNo: z.string().optional(),
  expiryDate: z.date().optional(),
  prescriptionYN: z.string().optional(),
  expiryYN: z.string().optional(),
  sellableYN: z.string().optional(),
  taxableYN: z.string().optional(),
  availableQty: z.number().optional(),
  tax: z.number().optional(),
  returnReason: z.string().optional(),
  rActiveYN: z.string().default("Y"),
});

const schema = z.object({
  psrID: z.number(),
  psrDate: z.date(),
  returnTypeCode: z.string().min(1, "Return type is required"),
  fromDeptID: z.number().min(1, "From department is required"),
  fromDeptName: z.string(),
  physicianID: z.number().optional(),
  physicianName: z.string().optional(),
  auGrpID: z.number().optional(),
  catDesc: z.string().optional(),
  catValue: z.string().optional(),
  psrCode: z.string().optional(),
  approvedYN: z.string(),
  approvedID: z.number().optional(),
  approvedBy: z.string().optional(),
  rActiveYN: z.string().default("Y"),
  productStockReturnDetails: z.array(returnDetailSchema).min(1, "At least one product detail is required"),
});

type PhysicianReturnFormData = z.infer<typeof schema>;

const PhysicianReturnForm: React.FC<PhysicianReturnFormProps> = ({
  open,
  onClose,
  initialData,
  viewOnly = false,
  copyMode = false,
  selectedDepartmentId,
  selectedDepartmentName,
}) => {
  const { setLoading } = useLoading();
  const { getReturnWithDetailsById, generatePhysicianReturnCode, generateAdjustmentReturnCode, savePhysicianReturn, saveInventoryAdjustment } = usePhysicianReturn();
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { department, attendingPhy } = useDropdownValues(["department", "attendingPhy"]);
  const { showAlert } = useAlert();
  const isAddMode = !initialData || copyMode;
  const isCopyMode = copyMode && !!initialData;
  const isEditMode = !!initialData && !copyMode && !viewOnly;
  const [isViewMode, setIsViewMode] = useState<boolean>(false);

  const defaultValues: PhysicianReturnFormData = useMemo(
    () => ({
      psrID: 0,
      psrDate: new Date(),
      returnTypeCode: PhysicianReturnType.Physician,
      fromDeptID: selectedDepartmentId || 0,
      fromDeptName: selectedDepartmentName || "",
      physicianID: 0,
      physicianName: "",
      auGrpID: 18,
      catDesc: "REVENUE",
      catValue: "MEDI",
      psrCode: "",
      approvedYN: "N",
      approvedID: 0,
      approvedBy: "",
      rActiveYN: "Y",
      productStockReturnDetails: [],
    }),
    [selectedDepartmentId, selectedDepartmentName]
  );

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors, isDirty, isValid },
  } = useForm<PhysicianReturnFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const activeStatusValue = useWatch({ control, name: "rActiveYN" });
  const approvalStatusValue = useWatch({ control, name: "approvedYN" });
  const returnTypeValue = useWatch({ control, name: "returnTypeCode" });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "productStockReturnDetails",
  });

  const createDetailMappingWithAllFields = useCallback((detail: any, isCopyMode: boolean) => {
    const mappedDetail = { ...detail };
    if (isCopyMode) {
      mappedDetail.psrdID = 0;
      mappedDetail.psrID = 0;
    }

    if (detail.expiryDate) {
      try {
        if (detail.expiryDate instanceof Date) {
          mappedDetail.expiryDate = detail.expiryDate;
        } else {
          const parsedDate = new Date(detail.expiryDate);
          mappedDetail.expiryDate = isNaN(parsedDate.getTime()) ? undefined : parsedDate;
        }
      } catch (error) {
        mappedDetail.expiryDate = undefined;
      }
    }

    if (detail.manufacturedDate) {
      try {
        if (detail.manufacturedDate instanceof Date) {
          mappedDetail.manufacturedDate = detail.manufacturedDate;
        } else {
          const parsedDate = new Date(detail.manufacturedDate);
          mappedDetail.manufacturedDate = isNaN(parsedDate.getTime()) ? undefined : parsedDate;
        }
      } catch (error) {
        mappedDetail.manufacturedDate = undefined;
      }
    }

    if (detail.grnDate) {
      try {
        if (detail.grnDate instanceof Date) {
          mappedDetail.grnDate = detail.grnDate;
        } else {
          const parsedDate = new Date(detail.grnDate);
          mappedDetail.grnDate = isNaN(parsedDate.getTime()) ? undefined : parsedDate;
        }
      } catch (error) {
        mappedDetail.grnDate = new Date();
      }
    }

    const numericDefaults = {
      psrdID: 0,
      psrID: 0,
      productID: 0,
      mfID: 0,
      pUnitID: 0,
      pUnitsPerPack: 1,
      pkgID: 0,
      unitPrice: 0,
      tax: 0,
      sellUnitPrice: 0,
      quantity: 0,
      totalAmount: 0,
      availableQty: 0,
      psGrpID: 0,
      pGrpID: 0,
      taxID: 0,
      mrp: 0,
      manufacturerID: 0,
      psbid: 0,
      psdID: 0,
      freeRetQty: 0,
      freeRetUnitQty: 0,
    };

    Object.keys(numericDefaults).forEach((key) => {
      if (mappedDetail[key] === null || mappedDetail[key] === undefined) {
        mappedDetail[key] = numericDefaults[key];
      }
    });

    const stringDefaults = {
      productCode: "",
      productName: "",
      catValue: "MEDI",
      catDesc: "REVENUE",
      mfName: "",
      pUnitName: "",
      pkgName: "",
      batchNo: "",
      prescriptionYN: "N",
      expiryYN: "N",
      sellableYN: "N",
      taxableYN: "N",
      psGrpName: "",
      pGrpName: "",
      taxCode: "",
      taxName: "",
      hsnCode: "",
      manufacturerCode: "",
      manufacturerName: "",
      returnReason: "",
      transferYN: "N",
      rActiveYN: "Y",
    };

    Object.keys(stringDefaults).forEach((key) => {
      if (mappedDetail[key] === null || mappedDetail[key] === undefined) {
        mappedDetail[key] = stringDefaults[key];
      }
    });

    return mappedDetail;
  }, []);

  const generateReturnCodeAsync = async () => {
    const deptId = getValues("fromDeptID") || selectedDepartmentId;
    const returnType = getValues("returnTypeCode");

    if (!isAddMode || !deptId || !returnType) return;

    try {
      setIsGeneratingCode(true);
      let code: string | null = null;

      switch (returnType) {
        case PhysicianReturnType.Physician:
          code = await generatePhysicianReturnCode(deptId);
          break;
        case PhysicianReturnType.InventoryAdjustment:
          code = await generateAdjustmentReturnCode(deptId);
          break;
        default:
          code = await generatePhysicianReturnCode(deptId);
      }

      if (code) {
        setValue("psrCode", code, { shouldValidate: true, shouldDirty: true });
      } else {
        showAlert("Warning", `Failed to generate ${returnType} return code`, "warning");
      }
    } catch (error) {
      showAlert("Error", "Error generating return code", "error");
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const loadReturnDetails = useCallback(async () => {
    if (!initialData) return;
    try {
      setLoading(true);
      let compositeDto: ProductStockReturnCompositeDto;
      if (initialData.details && Array.isArray(initialData.details) && initialData.details.length > 0) {
        compositeDto = {
          productStockReturn: initialData,
          productStockReturnDetails: initialData.details,
        };
      } else {
        const fetchedComposite = await getReturnWithDetailsById(initialData.psrID);
        if (!fetchedComposite || !fetchedComposite.productStockReturn) {
          showAlert("Error", "Failed to fetch Physician Return details from API", "error");
        }
        compositeDto = fetchedComposite;
      }

      const formData: PhysicianReturnFormData = {
        psrID: isCopyMode ? 0 : compositeDto.productStockReturn.psrID,
        psrDate: isCopyMode ? new Date() : new Date(compositeDto.productStockReturn.psrDate),
        returnTypeCode: compositeDto.productStockReturn.returnTypeCode || PhysicianReturnType.Physician,
        fromDeptID: compositeDto.productStockReturn.fromDeptID || 0,
        fromDeptName: compositeDto.productStockReturn.fromDeptName || "",
        physicianID: compositeDto.productStockReturn.toDeptID || 0, // Using toDeptID field for physicianID
        physicianName: compositeDto.productStockReturn.toDeptName || "", // Using toDeptName field for physicianName
        auGrpID: compositeDto.productStockReturn.auGrpID || 18,
        catDesc: compositeDto.productStockReturn.catDesc || "REVENUE",
        catValue: compositeDto.productStockReturn.catValue || "MEDI",
        psrCode: isCopyMode ? "" : compositeDto.productStockReturn.psrCode || "",
        approvedYN: isCopyMode ? "N" : compositeDto.productStockReturn.approvedYN || "N",
        approvedID: isCopyMode ? 0 : compositeDto.productStockReturn.approvedID || 0,
        approvedBy: isCopyMode ? "" : compositeDto.productStockReturn.approvedBy || "",
        rActiveYN: isCopyMode ? "Y" : compositeDto.productStockReturn.rActiveYN || "Y",
        productStockReturnDetails: (compositeDto.productStockReturnDetails || []).map((detail) => createDetailMappingWithAllFields(detail, isCopyMode)),
      };

      reset(formData);
      setIsDataLoaded(true);

      if (isCopyMode && formData.fromDeptID) {
        setTimeout(() => generateReturnCodeAsync(), 500);
      }

      const actionText = isViewMode ? "viewing" : isCopyMode ? "copying" : "editing";
      showAlert("Success", `Physician Return data loaded successfully for ${actionText} (${formData.productStockReturnDetails.length} products)`, "success");
    } catch (error) {
      showAlert("Error", "Failed to load Physician Return details", "error");
    } finally {
      setLoading(false);
    }
  }, [initialData, isCopyMode, isViewMode, getReturnWithDetailsById, reset, setLoading, showAlert, createDetailMappingWithAllFields]);

  useEffect(() => {
    if (open && !isDataLoaded) {
      if (initialData && (isCopyMode || isEditMode || isViewMode)) {
        loadReturnDetails();
      } else if (isAddMode && !initialData) {
        reset(defaultValues);
        setIsDataLoaded(true);
      }
    }
  }, [open, initialData?.psrID, isAddMode, isCopyMode, isEditMode, isViewMode, isDataLoaded, loadReturnDetails, reset, defaultValues]);

  useEffect(() => {
    if (isAddMode && selectedDepartmentId && selectedDepartmentName && !initialData && isDataLoaded) {
      setValue("fromDeptID", selectedDepartmentId, { shouldValidate: true, shouldDirty: false });
      setValue("fromDeptName", selectedDepartmentName, { shouldValidate: true, shouldDirty: false });
    }
  }, [isAddMode, selectedDepartmentId, selectedDepartmentName, setValue, initialData, isDataLoaded]);

  useEffect(() => {
    if (!open) {
      setIsDataLoaded(false);
    }
  }, [open]);

  useEffect(() => {
    const deptId = getValues("fromDeptID") || selectedDepartmentId;
    if (deptId && isAddMode && !isCopyMode && isDataLoaded) {
      generateReturnCodeAsync();
    }
  }, [getValues("fromDeptID"), selectedDepartmentId, isAddMode, isCopyMode, isDataLoaded, getValues("returnTypeCode")]);

  // Handle return type change
  useEffect(() => {
    if (isDataLoaded && (isAddMode || isCopyMode)) {
      // Regenerate return code when return type changes
      generateReturnCodeAsync();
    }
  }, [returnTypeValue]);

  const handleReturnTypeChange = (value: string) => {
    setValue("returnTypeCode", value, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = async (data: PhysicianReturnFormData) => {
    if (isViewMode) return;
    setFormError(null);
    try {
      setIsSaving(true);
      setLoading(true);

      if (!data.fromDeptID || data.fromDeptID === 0) {
        if (selectedDepartmentId) {
          setValue("fromDeptID", selectedDepartmentId);
          setValue("fromDeptName", selectedDepartmentName || "");
          data.fromDeptID = selectedDepartmentId;
          data.fromDeptName = selectedDepartmentName || "";
        } else {
          showAlert("Warning", "From department is required. Please select a department.", "warning");
          return;
        }
      }

      // Validate based on return type
      if (data.returnTypeCode === PhysicianReturnType.Physician && (!data.physicianID || data.physicianID === 0)) {
        showAlert("Warning", "Physician is required for Physician Returns. Please select a physician.", "warning");
        return;
      }

      if (data.productStockReturnDetails.length === 0) {
        showAlert("Warning", "At least one product must be added to the return", "warning");
        return;
      }

      const fromDept = department?.find((d) => Number(d.value) === data.fromDeptID);
      const selectedPhysician = attendingPhy?.find((p) => Number(p.value) === data.physicianID);

      const stockReturnCompositeDto: ProductStockReturnCompositeDto = {
        productStockReturn: {
          psrID: data.psrID,
          psrDate: data.psrDate,
          dtID: 0, // Will be set by backend based on return type
          dtCode: "",
          dtName: "",
          returnTypeCode: data.returnTypeCode,
          returnType: data.returnTypeCode === PhysicianReturnType.Physician ? "Physician Return" : "Inventory Adjustment",
          fromDeptID: data.fromDeptID,
          fromDeptName: fromDept?.label || data.fromDeptName,
          toDeptID: data.physicianID || undefined, // Using toDeptID field for physicianID
          toDeptName: selectedPhysician?.label || data.physicianName, // Using toDeptName field for physicianName
          auGrpID: data.auGrpID || 18,
          catDesc: data.catDesc || "REVENUE",
          catValue: data.catValue || "MEDI",
          psrCode: data.psrCode || "",
          approvedYN: data.approvedYN || "N",
          approvedID: data.approvedID || 0,
          approvedBy: data.approvedBy || "",
          totalItems: data.productStockReturnDetails.length,
          totalReturnedQty: data.productStockReturnDetails.reduce((sum, detail) => sum + detail.quantity, 0),
          rActiveYN: data.rActiveYN || "Y",
          returnTypeName: data.returnTypeCode === PhysicianReturnType.Physician ? "Physician Return" : "Inventory Adjustment",
        } as ProductStockReturnDto,
        productStockReturnDetails: data.productStockReturnDetails.map((detail) => ({
          // Ensure all required properties are present
          psrdID: detail.psrdID || 0,
          psrID: detail.psrID || 0,
          productID: detail.productID || 0,
          productName: detail.productName || "",
          quantity: detail.quantity || 0,
          unitPrice: detail.unitPrice || 0,
          totalAmount: detail.totalAmount || 0,
          batchNo: detail.batchNo || "",
          expiryDate: detail.expiryDate || new Date(),
          manufacturedDate: new Date(),
          grnDate: new Date(),
          prescriptionYN: detail.prescriptionYN || "N",
          expiryYN: detail.expiryYN || "N",
          sellableYN: detail.sellableYN || "N",
          taxableYN: detail.taxableYN || "N",
          availableQty: detail.availableQty || 0,
          tax: detail.tax || 0,
          returnReason: detail.returnReason || "",
          psGrpID: 0,
          pGrpID: 0,
          taxID: 0,
          mrp: 0,
          manufacturerID: 0,
          psbid: 0,
          psdID: 0,
          freeRetQty: 0,
          freeRetUnitQty: 0,
          rActiveYN: detail.rActiveYN || "Y",
        })),
      };
      let response;

      if (data.returnTypeCode === PhysicianReturnType.Physician) {
        response = await savePhysicianReturn(stockReturnCompositeDto);
      } else {
        response = await saveInventoryAdjustment(stockReturnCompositeDto);
      }

      if (response.success) {
        const actionText = isCopyMode ? "copied" : isAddMode ? "created" : "updated";
        const returnTypeText = data.returnTypeCode === PhysicianReturnType.Physician ? "Physician Return" : "Inventory Adjustment";
        showAlert("Success", `${returnTypeText} ${actionText} successfully. ${data.productStockReturnDetails.length} products processed.`, "success");
        onClose(true);
      } else {
        showAlert(
          "Error",
          response.errorMessage || `Failed to save ${data.returnTypeCode === PhysicianReturnType.Physician ? "Physician Return" : "Inventory Adjustment"}`,
          "error"
        );
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save Physician Return";
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  const performReset = () => {
    const resetData = initialData ? undefined : defaultValues;
    reset(resetData);
    setFormError(null);
    setIsDataLoaded(false);

    if (initialData) {
      setTimeout(() => loadReturnDetails(), 100);
    }
  };

  const handleReset = () => {
    if (isDirty) {
      setShowResetConfirmation(true);
    } else {
      performReset();
    }
  };

  const getDialogTitle = () => {
    const returnTypeText = returnTypeValue === PhysicianReturnType.Physician ? "Physician Return" : "Inventory Adjustment";

    if (isViewMode) {
      return `View ${returnTypeText} Details - ${initialData?.psrCode || "N/A"}`;
    } else if (isCopyMode) {
      return `Copy ${returnTypeText} - ${initialData?.psrCode || "N/A"}`;
    } else if (isAddMode) {
      return `Create New ${returnTypeText}`;
    } else {
      return `Edit ${returnTypeText} - ${initialData?.psrCode || "N/A"}`;
    }
  };

  const dialogActions = isViewMode ? (
    <SmartButton text="Close" onClick={() => onClose()} variant="contained" color="primary" />
  ) : (
    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
      <SmartButton text="Clear" onClick={handleReset} variant="outlined" color="error" disabled={isSaving} />
      <SmartButton
        text={isCopyMode ? "Copy & Save" : "Save"}
        onClick={handleSubmit(onSubmit)}
        variant="contained"
        color="success"
        icon={Save}
        asynchronous={true}
        showLoadingIndicator={true}
        loadingText="Saving..."
        successText="Saved!"
        disabled={isSaving || !isValid || fields.length === 0}
      />
    </Box>
  );

  return (
    <>
      <GenericDialog
        open={open}
        onClose={() => onClose()}
        title={getDialogTitle()}
        maxWidth="xl"
        fullWidth
        fullScreen
        showCloseButton
        disableBackdropClick={!isViewMode && (isDirty || isSaving)}
        disableEscapeKeyDown={!isViewMode && (isDirty || isSaving)}
        actions={dialogActions}
      >
        <Box component="form" noValidate sx={{ p: 1 }}>
          {isCopyMode && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <ContentCopyIcon />
                <Typography variant="body2">
                  You are copying {returnTypeValue === PhysicianReturnType.Physician ? "Physician Return" : "Inventory Adjustment"} "{initialData?.psrCode}". A new return code will
                  be generated automatically.
                  {initialData?.details && initialData.details.length > 0 && <span> {initialData.details.length} product(s) will be copied to the new return.</span>}
                </Typography>
              </Box>
            </Alert>
          )}

          {!isDataLoaded && (initialData || !isAddMode) && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body2">Loading {returnTypeValue === PhysicianReturnType.Physician ? "Physician Return" : "Inventory Adjustment"} data...</Typography>
              </Box>
            </Alert>
          )}

          {formError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError(null)}>
              {formError}
            </Alert>
          )}

          <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ sm: 12, md: 2 }}>
                <FormField
                  name="psrCode"
                  control={control}
                  label="Return Code"
                  type="text"
                  required
                  disabled={isViewMode || (!isAddMode && !isCopyMode)}
                  size="small"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment:
                      (isAddMode || isCopyMode) && !isViewMode && getValues("fromDeptID") ? (
                        <InputAdornment position="end">
                          {isGeneratingCode ? (
                            <CircularProgress size={20} />
                          ) : (
                            <IconButton size="small" onClick={generateReturnCodeAsync} title="Generate new code">
                              <Refresh />
                            </IconButton>
                          )}
                        </InputAdornment>
                      ) : null,
                  }}
                />
              </Grid>

              <Grid size={{ sm: 12, md: 2 }}>
                <FormField name="psrDate" control={control} label="Return Date" type="datepicker" required disabled={isViewMode} size="small" fullWidth />
              </Grid>

              <Grid size={{ sm: 12, md: 2 }}>
                <FormControl fullWidth size="small" required>
                  <InputLabel id="return-type-label">Return Type</InputLabel>
                  <Select
                    labelId="return-type-label"
                    value={returnTypeValue}
                    onChange={(e) => handleReturnTypeChange(e.target.value)}
                    label="Return Type"
                    disabled={isViewMode || (!isAddMode && !isCopyMode)}
                  >
                    <MenuItem value={PhysicianReturnType.Physician}>Physician Return</MenuItem>
                    <MenuItem value={PhysicianReturnType.InventoryAdjustment}>Inventory Adjustment</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ sm: 12, md: 2 }}>
                <FormField
                  name="fromDeptID"
                  control={control}
                  label="From Department"
                  type="select"
                  required
                  disabled={isViewMode || (!isAddMode && !isCopyMode && initialData?.approvedYN === "Y") || (isAddMode && !!selectedDepartmentId)}
                  size="small"
                  options={department || []}
                  fullWidth
                  onChange={(value) => {
                    const selectedDept = department?.find((d) => Number(d.value) === Number(value.value));
                    setValue("fromDeptName", selectedDept?.label || "");
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {isAddMode && selectedDepartmentId ? (
                          <IconButton size="small" disabled title="Auto-populated from selected department">
                            <CheckIcon />
                          </IconButton>
                        ) : (
                          <IconButton size="small">
                            <SyncIcon />
                          </IconButton>
                        )}
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {returnTypeValue === PhysicianReturnType.Physician && (
                <Grid size={{ sm: 12, md: 2 }}>
                  <FormField
                    name="physicianID"
                    control={control}
                    label="Physician"
                    type="select"
                    required
                    disabled={isViewMode}
                    size="small"
                    options={attendingPhy || []}
                    fullWidth
                    onChange={(value) => {
                      const selectedPhysician = attendingPhy?.find((p) => Number(p.value) === Number(value.value));
                      setValue("physicianName", selectedPhysician?.label || "");
                    }}
                  />
                </Grid>
              )}

              <Grid size={{ sm: 12, md: 2 }}>
                <FormField name="rActiveYN" control={control} type="switch" color="warning" label={activeStatusValue === "Y" ? "Visible" : "Hidden"} disabled={isViewMode} />
                <FormField
                  name="approvedYN"
                  control={control}
                  type="switch"
                  color="primary"
                  label={approvalStatusValue === "Y" ? "Approved" : "Not Approved"}
                  disabled={isViewMode}
                />
              </Grid>
            </Grid>
          </Paper>

          <PhysicianReturnProductSection
            control={control}
            fields={fields}
            append={append}
            remove={remove}
            setValue={setValue}
            errors={errors}
            isViewMode={isViewMode}
            showAlert={showAlert}
          />

          <PhysicianReturnBillingSection control={control} />
        </Box>
      </GenericDialog>

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

export default PhysicianReturnForm;
