import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import {
  calculateTotalConsumedQty,
  calculateTotalItems,
  calculateTotalValue,
  ProductConsumptionCompositeDto,
  ProductConsumptionDetailDto,
  ProductConsumptionMastDto,
} from "@/interfaces/InventoryManagement/ProductConsumption";

import { useAlert } from "@/providers/AlertProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check as CheckIcon, Inventory as ConsumptionIcon, ContentCopy as ContentCopyIcon, Refresh, Save, Search as SearchIcon, Sync as SyncIcon } from "@mui/icons-material";
import { Alert, Box, Chip, CircularProgress, Grid, IconButton, InputAdornment, Paper, Tooltip, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import useDepartmentConsumption from "../hook/useProductConsumption";
import DepartmentConsumptionProductDetailsSection from "./ProductConsumptionDetailsSection";

interface DepartmentConsumptionFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  initialData: ProductConsumptionMastDto | null;
  viewOnly?: boolean;
  copyMode?: boolean;
  selectedDepartmentId?: number;
  selectedDepartmentName?: string;
}

const consumptionDetailSchema = z.object({
  deptConsDetID: z.number(),
  deptConsID: z.number(),
  psdid: z.number(),
  pisid: z.number(),
  psbid: z.number(),
  productID: z.number().min(1, "Product is required"),
  productCode: z.string().optional(),
  productName: z.string().min(1, "Product name is required"),
  catValue: z.string().optional(),
  catDesc: z.string().optional(),
  mfID: z.number().optional(),
  mfName: z.string().optional(),
  pUnitID: z.number().optional(),
  pUnitName: z.string().optional(),
  pUnitsPerPack: z.number().optional(),
  pkgID: z.number().optional(),
  pkgName: z.string().optional(),
  batchNo: z.string().optional(),
  expiryDate: z.date().optional(),
  unitPrice: z.number().optional(),
  tax: z.number().optional(),
  sellUnitPrice: z.number().optional(),
  affectedQty: z.number().min(0, "Consumed quantity must be non-negative"),
  affectedUnitQty: z.number().optional(),
  availableQty: z.number().optional(),
  prescriptionYN: z.string().optional(),
  expiryYN: z.string().optional(),
  sellableYN: z.string().optional(),
  taxableYN: z.string().optional(),
  psGrpID: z.number().optional(),
  psGrpName: z.string().optional(),
  pGrpID: z.number().optional(),
  pGrpName: z.string().optional(),
  taxID: z.number().optional(),
  taxCode: z.string().optional(),
  taxName: z.string().optional(),
  mrp: z.number().optional(),
  manufacturerID: z.number().optional(),
  manufacturerCode: z.string().optional(),
  manufacturerName: z.string().optional(),
  grnDetID: z.number(),
  grnDate: z.date(),
  auGrpID: z.number(),
  consumptionRemarks: z.string().optional(),
});

const departmentConsumptionSchema = z.object({
  deptConsID: z.number(),
  deptConsDate: z.date(),
  fromDeptID: z.number().min(1, "Department is required"),
  fromDeptName: z.string().min(1, "Department name is required"),
  auGrpID: z.number().optional(),
  catDesc: z.string().optional(),
  catValue: z.string().optional(),
  deptConsCode: z.string().min(1, "Consumption code is required"),
  rActiveYN: z.string().default("Y"),
  details: z
    .array(consumptionDetailSchema)
    .min(1, "At least one product detail is required")
    .refine((details) => details.some((detail) => detail.affectedQty > 0), "At least one product must have quantity greater than 0"),
});

type DepartmentConsumptionFormData = z.infer<typeof departmentConsumptionSchema>;

const DepartmentConsumptionForm: React.FC<DepartmentConsumptionFormProps> = ({
  open,
  onClose,
  initialData,
  viewOnly = false,
  copyMode = false,
  selectedDepartmentId,
  selectedDepartmentName,
}) => {
  const { setLoading } = useLoading();
  const { getConsumptionWithDetailsById, generateConsumptionCode, saveDepartmentConsumption } = useDepartmentConsumption();
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { showAlert } = useAlert();

  const { department } = useDropdownValues(["department"]);

  const isAddMode = !initialData || copyMode;
  const isCopyMode = copyMode && !!initialData;
  const isEditMode = !!initialData && !copyMode && !viewOnly;
  const isViewMode = viewOnly;

  const defaultValues: DepartmentConsumptionFormData = useMemo(
    () => ({
      deptConsID: 0,
      deptConsDate: new Date(),
      fromDeptID: selectedDepartmentId || 0,
      fromDeptName: selectedDepartmentName || "",
      auGrpID: 18,
      catDesc: "REVENUE",
      catValue: "MEDI",
      deptConsCode: "",
      rActiveYN: "Y",
      details: [],
    }),
    [selectedDepartmentId, selectedDepartmentName]
  );

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors, isDirty, isValid },
  } = useForm<DepartmentConsumptionFormData>({
    defaultValues,
    resolver: zodResolver(departmentConsumptionSchema),
    mode: "onChange",
  });

  const activeStatusValue = useWatch({ control, name: "rActiveYN" });
  const fromDeptID = watch("fromDeptID");
  const deptConsCode = watch("deptConsCode");
  const watchedDetails = useWatch({ control, name: "details" });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "details",
  });

  const memoizedDepartmentOptions = useMemo(() => {
    return department || [];
  }, [department]);

  const validDetailsCount = useMemo(() => {
    if (!watchedDetails) return 0;
    return watchedDetails.filter((detail) => detail && detail.productID && detail.affectedQty > 0).length;
  }, [watchedDetails]);

  const canSave = useMemo(() => {
    if (isSaving || !isDataLoaded || isViewMode) return false;

    const currentValues = getValues();
    const hasRequiredFields = currentValues.fromDeptID > 0 && currentValues.deptConsCode?.trim();

    const hasValidProducts = fields.length > 0 && validDetailsCount > 0;

    return hasRequiredFields && hasValidProducts && isValid;
  }, [isSaving, isDataLoaded, isViewMode, validDetailsCount, fields.length, isValid, getValues]);

  const createDetailMappingWithAllFields = useCallback((detail: any, isCopyMode: boolean) => {
    const mappedDetail = { ...detail };
    if (isCopyMode) {
      mappedDetail.deptConsDetID = 0;
      mappedDetail.deptConsID = 0;
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

    const numericDefaults = {
      deptConsDetID: 0,
      deptConsID: 0,
      psdid: 0,
      pisid: 0,
      psbid: 0,
      productID: 0,
      mfID: 0,
      pUnitID: 0,
      pUnitsPerPack: 1,
      pkgID: 0,
      unitPrice: 0,
      tax: 0,
      sellUnitPrice: 0,
      affectedQty: 0,
      affectedUnitQty: 0,
      availableQty: 0,
      psGrpID: 0,
      pGrpID: 0,
      taxID: 0,
      mrp: 0,
      manufacturerID: 0,
      grnDetID: 0,
      auGrpID: 18,
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
      sellableYN: "Y",
      taxableYN: "Y",
      psGrpName: "",
      pGrpName: "",
      taxCode: "",
      taxName: "",
      manufacturerCode: "",
      manufacturerName: "",
      consumptionRemarks: "",
    };

    Object.keys(stringDefaults).forEach((key) => {
      if (mappedDetail[key] === null || mappedDetail[key] === undefined) {
        mappedDetail[key] = stringDefaults[key];
      }
    });

    return mappedDetail;
  }, []);

  const generateConsumptionCodeAsync = useCallback(async () => {
    debugger;
    const deptId = getValues("fromDeptID") || selectedDepartmentId;
    if (!isAddMode || !deptId) return;

    try {
      setIsGeneratingCode(true);
      const code = await generateConsumptionCode(deptId);
      if (code) {
        setValue("deptConsCode", code, { shouldValidate: true, shouldDirty: true });
      } else {
        showAlert("Warning", "Failed to generate Department Consumption code", "warning");
      }
    } catch (error) {
      showAlert("Error", "Error generating consumption code.", "error");
    } finally {
      setIsGeneratingCode(false);
    }
  }, [isAddMode, selectedDepartmentId, getValues, setValue, generateConsumptionCode, showAlert]);

  const loadConsumptionDetails = useCallback(async () => {
    if (!initialData) return;

    try {
      setLoading(true);
      let compositeDto: ProductConsumptionCompositeDto;

      if (initialData.details && Array.isArray(initialData.details) && initialData.details.length > 0) {
        compositeDto = {
          productConsumption: initialData,
          consumptionDetails: initialData.details,
          totalItems: calculateTotalItems(initialData.details),
          totalConsumedQty: calculateTotalConsumedQty(initialData.details),
          totalValue: calculateTotalValue(initialData.details),
        };
      } else {
        const fetchedComposite = await getConsumptionWithDetailsById(initialData.deptConsID);
        if (!fetchedComposite || !fetchedComposite.productConsumption) {
          showAlert("Error", "Failed to fetch department consumption details from API", "error");
          return;
        }
        compositeDto = fetchedComposite;
      }

      const formData: DepartmentConsumptionFormData = {
        deptConsID: isCopyMode ? 0 : compositeDto.productConsumption.deptConsID,
        deptConsDate: isCopyMode ? new Date() : new Date(compositeDto.productConsumption.deptConsDate || new Date()),
        fromDeptID: compositeDto.productConsumption.fromDeptID,
        fromDeptName: compositeDto.productConsumption.fromDeptName || "",
        auGrpID: compositeDto.productConsumption.auGrpID || 18,
        catDesc: compositeDto.productConsumption.catDesc || "REVENUE",
        catValue: compositeDto.productConsumption.catValue || "MEDI",
        deptConsCode: isCopyMode ? "" : compositeDto.productConsumption.deptConsCode || "",
        rActiveYN: compositeDto.productConsumption.rActiveYN || "Y",
        details: (compositeDto.consumptionDetails || []).map((detail) => createDetailMappingWithAllFields(detail, isCopyMode)),
      };

      reset(formData);
      setIsDataLoaded(true);

      if (isCopyMode && formData.fromDeptID) {
        setTimeout(() => generateConsumptionCodeAsync(), 500);
      }

      const actionText = isViewMode ? "viewing" : isCopyMode ? "copying" : "editing";
      showAlert("Success", `Department consumption data loaded successfully for ${actionText}`, "success");
    } catch (error) {
      showAlert("Error", "Failed to load department consumption details", "error");
    } finally {
      setLoading(false);
    }
  }, [initialData, isCopyMode, isViewMode, getConsumptionWithDetailsById, reset, setLoading, showAlert, generateConsumptionCodeAsync, createDetailMappingWithAllFields]);

  useEffect(() => {
    if (open && !isDataLoaded) {
      if (initialData && (isCopyMode || isEditMode || isViewMode)) {
        loadConsumptionDetails();
      } else if (isAddMode && !initialData) {
        reset(defaultValues);
        setIsDataLoaded(true);
      }
    }
  }, [open, initialData, isAddMode, isCopyMode, isEditMode, isViewMode, isDataLoaded, loadConsumptionDetails, reset, defaultValues]);

  useEffect(() => {
    if (isAddMode && selectedDepartmentId && selectedDepartmentName && !initialData && isDataLoaded) {
      setValue("fromDeptID", selectedDepartmentId, { shouldValidate: true, shouldDirty: false });
      setValue("fromDeptName", selectedDepartmentName, { shouldValidate: true, shouldDirty: false });
    }
  }, [isAddMode, selectedDepartmentId, selectedDepartmentName, setValue, initialData, isDataLoaded]);

  useEffect(() => {
    if (isAddMode && !isCopyMode && fromDeptID > 0 && !deptConsCode && isDataLoaded) {
      generateConsumptionCodeAsync();
    }
  }, [isAddMode, isCopyMode, fromDeptID, deptConsCode, isDataLoaded, generateConsumptionCodeAsync]);

  useEffect(() => {
    if (!open) {
      setIsDataLoaded(false);
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!open || isViewMode) return;
      if (event.ctrlKey && event.key === "s") {
        event.preventDefault();
        if (canSave) handleSubmit(onSubmit)();
      }
      if (event.key === "Escape") {
        event.preventDefault();
        if (isDirty && !isViewMode) {
          setShowCancelConfirmation(true);
        } else {
          onClose();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, isViewMode, canSave, isDirty, handleSubmit, onClose]);

  const onSubmit = async (data: DepartmentConsumptionFormData) => {
    if (isViewMode) return;
    setFormError(null);

    try {
      setIsSaving(true);
      setLoading(true);

      if (!data.fromDeptID || data.fromDeptID === 0) throw new Error("Department is required.");

      const validDetails = data.details.filter((detail) => detail.affectedQty > 0);
      if (validDetails.length === 0) throw new Error("At least one product must have a consumed quantity greater than 0");

      const fromDept = memoizedDepartmentOptions?.find((d) => Number(d.value) === data.fromDeptID);

      const deptConsID = isAddMode || isCopyMode ? 0 : data.deptConsID;

      const transformedDetails: ProductConsumptionDetailDto[] = validDetails.map((detail) => ({
        deptConsDetID: isCopyMode ? 0 : detail.deptConsDetID || 0,
        deptConsID: isCopyMode ? 0 : detail.deptConsID || 0,
        psdid: detail.psdid || 0,
        pisid: detail.pisid || 0,
        psbid: detail.psbid || 0,
        pGrpID: detail.pGrpID,
        pGrpName: detail.pGrpName || "",
        productID: detail.productID || 0,
        productCode: detail.productCode || "",
        productName: detail.productName || "",
        catValue: detail.catValue || "MEDI",
        catDesc: detail.catDesc || "REVENUE",
        mfID: detail.mfID || 0,
        mfName: detail.mfName || "",
        pUnitID: detail.pUnitID || 0,
        pUnitName: detail.pUnitName || "",
        pUnitsPerPack: detail.pUnitsPerPack || 1,
        pkgID: detail.pkgID || 0,
        pkgName: detail.pkgName || "",
        batchNo: detail.batchNo || "",
        expiryDate: detail.expiryDate,
        unitPrice: detail.unitPrice || 0,
        tax: detail.tax || 0,
        sellUnitPrice: detail.sellUnitPrice || 0,
        affectedQty: detail.affectedQty || 0,
        affectedUnitQty: detail.affectedUnitQty || 0,
        availableQty: detail.availableQty,
        prescriptionYN: detail.prescriptionYN || "N",
        expiryYN: detail.expiryYN || "N",
        sellableYN: detail.sellableYN || "Y",
        taxableYN: detail.taxableYN || "Y",
        psGrpID: detail.psGrpID,
        psGrpName: detail.psGrpName,
        manufacturerID: detail.manufacturerID,
        manufacturerCode: detail.manufacturerCode,
        manufacturerName: detail.manufacturerName,
        taxID: detail.taxID,
        taxCode: detail.taxCode,
        taxName: detail.taxName,
        mrp: detail.mrp,
        grnDetID: detail.grnDetID || 0,
        grnDate: detail.grnDate || new Date(),
        auGrpID: detail.auGrpID || 18,
        consumptionRemarks: detail.consumptionRemarks || "",
        rActiveYN: "Y",
      }));

      const calculatedTotalItems = calculateTotalItems(transformedDetails);
      const calculatedTotalConsumedQty = calculateTotalConsumedQty(transformedDetails);
      const calculatedTotalValue = calculateTotalValue(transformedDetails);

      const consumptionCompositeDto: ProductConsumptionCompositeDto = {
        productConsumption: {
          deptConsID: deptConsID,
          deptConsDate: data.deptConsDate,
          fromDeptID: data.fromDeptID,
          fromDeptName: fromDept?.label || data.fromDeptName,
          auGrpID: data.auGrpID,
          catDesc: data.catDesc || "REVENUE",
          catValue: data.catValue || "MEDI",
          deptConsCode: data.deptConsCode || "",
          totalItems: calculatedTotalItems,
          totalConsumedQty: calculatedTotalConsumedQty,
          totalValue: calculatedTotalValue,
          rActiveYN: "Y",
        },
        consumptionDetails: transformedDetails,
        totalItems: calculatedTotalItems,
        totalConsumedQty: calculatedTotalConsumedQty,
        totalValue: calculatedTotalValue,
      };

      const response = await saveDepartmentConsumption(consumptionCompositeDto);
      if (response.success) {
        const actionText = isCopyMode ? "copied" : isAddMode ? "created" : "updated";
        showAlert("Success", `Department Consumption ${actionText} successfully.`, "success");
        onClose(true);
      } else {
        throw new Error(response.errorMessage || "Failed to save department consumption");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save department consumption";
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
      setTimeout(() => loadConsumptionDetails(), 100);
    }
  };

  const handleReset = () => {
    if (isDirty) {
      setShowResetConfirmation(true);
    } else {
      performReset();
    }
  };

  const handleClose = () => {
    if (isDirty && !isViewMode) {
      setShowCancelConfirmation(true);
    } else {
      onClose();
    }
  };

  const dialogTitle = isViewMode
    ? `View Department Consumption - ${initialData?.deptConsCode || "N/A"}`
    : isCopyMode
    ? `Copy Department Consumption - ${initialData?.deptConsCode || "N/A"}`
    : isAddMode
    ? "Create New Department Consumption"
    : `Edit Department Consumption - ${initialData?.deptConsCode || "N/A"}`;

  const dialogActions = isViewMode ? (
    <SmartButton text="Close" onClick={() => onClose()} variant="contained" color="primary" />
  ) : (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {fields.length > 0 && (
          <Chip label={`${validDetailsCount}/${fields.length} valid products`} size="small" color={validDetailsCount > 0 ? "success" : "default"} variant="outlined" />
        )}
      </Box>
      <Box sx={{ display: "flex", gap: 1 }}>
        <SmartButton text="Clear" onClick={handleReset} variant="outlined" color="error" disabled={isSaving} />
        <SmartButton text={isCopyMode ? "Copy & Save" : "Save"} onClick={handleSubmit(onSubmit)} variant="contained" color="success" icon={Save} disabled={!canSave} />
      </Box>
    </Box>
  );

  return (
    <>
      <GenericDialog open={open} onClose={handleClose} title={dialogTitle} maxWidth="xl" fullWidth fullScreen showCloseButton actions={dialogActions}>
        <Box component="form" noValidate sx={{ p: 1 }}>
          {isCopyMode && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <ContentCopyIcon />
                <Typography variant="body2"> Copying from "{initialData?.deptConsCode}". A new code will be generated. </Typography>
              </Box>
            </Alert>
          )}
          {!isDataLoaded && (initialData || !isAddMode) && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={20} /> <Typography variant="body2">Loading consumption data...</Typography>
              </Box>
            </Alert>
          )}
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError(null)}>
              {formError}
            </Alert>
          )}

          <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <ConsumptionIcon sx={{ color: "primary.main" }} />
              <Typography variant="h6" color="primary">
                Department Consumption Information
              </Typography>
              {isDirty && !isViewMode && <Chip label="Modified" size="small" color="warning" variant="outlined" />}
            </Box>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ sm: 12, md: 3 }}>
                <FormField
                  name="deptConsCode"
                  control={control}
                  label="Consumption Code"
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
                            <Tooltip title="Generate new code">
                              <IconButton size="small" onClick={generateConsumptionCodeAsync} aria-label="Generate new consumption code">
                                <Refresh />
                              </IconButton>
                            </Tooltip>
                          )}
                        </InputAdornment>
                      ) : null,
                  }}
                />
              </Grid>
              <Grid size={{ sm: 12, md: 4 }}>
                <FormField
                  name="fromDeptID"
                  control={control}
                  label="Department"
                  type="select"
                  required
                  disabled={isViewMode || (!isAddMode && !isCopyMode) || (isAddMode && !!selectedDepartmentId)}
                  size="small"
                  options={memoizedDepartmentOptions}
                  fullWidth
                  onChange={(value) => {
                    const selectedDept = memoizedDepartmentOptions?.find((d) => Number(d.value) === Number(value.value));
                    setValue("fromDeptName", selectedDept?.label || "");
                    if (isAddMode) {
                      setValue("deptConsCode", "", { shouldDirty: true });
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {isAddMode && selectedDepartmentId ? (
                          <Tooltip title="Auto-populated department">
                            <IconButton size="small" disabled>
                              <CheckIcon />
                            </IconButton>
                          </Tooltip>
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
              <Grid size={{ sm: 12, md: 3 }}>
                <FormField name="deptConsDate" control={control} label="Consumption Date" type="datepicker" disabled={isViewMode} size="small" fullWidth />
              </Grid>
              <Grid size={{ sm: 12, md: 2 }}>
                <FormField name="rActiveYN" control={control} type="switch" color="warning" label={activeStatusValue === "Y" ? "Active" : "Inactive"} disabled={isViewMode} />
              </Grid>
            </Grid>
          </Paper>

          <DepartmentConsumptionProductDetailsSection
            control={control}
            fields={fields}
            append={append}
            remove={remove}
            setValue={setValue}
            errors={errors}
            isViewMode={isViewMode}
            showAlert={showAlert}
          />
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
        message="All unsaved changes will be lost. Are you sure?"
        confirmText="Reset"
        type="warning"
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
      />
    </>
  );
};

export default DepartmentConsumptionForm;
