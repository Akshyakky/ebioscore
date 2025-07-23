import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import {
  IssualType,
  ProductIssualCompositeDto,
  ProductIssualDetailDto,
  ProductIssualDto,
  calculateTotalIssuedQty,
  calculateTotalItems,
  calculateTotalRequestedQty,
  getIssualCodePrefix,
  getIssualTypeName,
} from "@/interfaces/InventoryManagement/ProductIssualDto";
import { useAlert } from "@/providers/AlertProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check as CheckIcon, ContentCopy as ContentCopyIcon, LocalHospital as PhysicianIcon, Refresh, Save, Search as SearchIcon, Sync as SyncIcon } from "@mui/icons-material";
import { Alert, Box, Chip, CircularProgress, Grid, IconButton, InputAdornment, Paper, Tooltip, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import ProductBillingSection from "../../ProductIssual/Form/ProductBillingSection";
import { useProductIssual } from "../../ProductIssual/hooks/useProductIssual";
import PhysicianProductDetailsSection from "./PhysicianProductDetailsSection";
interface PhysicianIssualFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  initialData: ProductIssualDto | null;
  viewOnly?: boolean;
  copyMode?: boolean;
  selectedDepartmentId?: number;
  selectedDepartmentName?: string;
  issualType?: IssualType;
}

const issualDetailSchema = z.object({
  pisDetID: z.number(),
  pisid: z.number(),
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
  requestedQty: z.number().min(0, "Requested quantity must be non-negative"),
  issuedQty: z.number().min(0, "Issued quantity must be non-negative"),
  availableQty: z.number().optional(),
  expiryYN: z.string().optional(),
  psGrpID: z.number().optional(),
  psGrpName: z.string().optional(),
  pGrpID: z.number().optional(),
  pGrpName: z.string().optional(),
  taxID: z.number().optional(),
  taxCode: z.string().optional(),
  taxName: z.string().optional(),
  hsnCode: z.string().optional(),
  mrp: z.number().optional(),
  manufacturerID: z.number().optional(),
  manufacturerCode: z.string().optional(),
  manufacturerName: z.string().optional(),
  psbid: z.number().optional(),
  remarks: z.string().optional(),
});

const physicianIssualSchema = z.object({
  pisid: z.number(),
  pisDate: z.date(),
  issualType: z.nativeEnum(IssualType).default(IssualType.Physician),
  fromDeptID: z.number().min(1, "From department is required"),
  fromDeptName: z.string().min(1, "From department name is required"),
  toDeptID: z.number().optional(),
  toDeptName: z.string().optional(),
  recConID: z.number().min(1, "Physician is required"),
  recConName: z.string().min(1, "Physician name is required"),
  auGrpID: z.number().optional(),
  catDesc: z.string().optional(),
  catValue: z.string().optional(),
  indentNo: z.string().optional(),
  pisCode: z.string().min(1, "Issual code is required"),
  approvedYN: z.string(),
  approvedID: z.number().optional(),
  approvedBy: z.string().optional(),
  rActiveYN: z.string().default("Y"),
  details: z
    .array(issualDetailSchema)
    .min(1, "At least one product detail is required")
    .refine((details) => details.some((detail) => detail.issuedQty > 0 || detail.requestedQty > 0), "At least one product must have quantity greater than 0"),
});

type PhysicianIssualFormData = z.infer<typeof physicianIssualSchema>;
const PhysicianIssualForm: React.FC<PhysicianIssualFormProps> = ({
  open,
  onClose,
  initialData,
  viewOnly = false,
  copyMode = false,
  selectedDepartmentId,
  selectedDepartmentName,
  issualType = IssualType.Physician,
}) => {
  const { setLoading } = useLoading();
  const { getIssualWithDetailsById, generatePhysicianIssualCode, savePhysicianIssual } = useProductIssual();
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { showAlert } = useAlert();

  const { department, attendingPhy } = useDropdownValues(["department", "attendingPhy"]);

  const isAddMode = !initialData || copyMode;
  const isCopyMode = copyMode && !!initialData;
  const isEditMode = !!initialData && !copyMode && !viewOnly;
  const isViewMode = viewOnly;

  const defaultValues: PhysicianIssualFormData = useMemo(
    () => ({
      pisid: 0,
      pisDate: new Date(),
      issualType: issualType,
      fromDeptID: selectedDepartmentId || 0,
      fromDeptName: selectedDepartmentName || "",
      toDeptID: 0,
      toDeptName: "",
      recConID: 0,
      recConName: "",
      auGrpID: 18,
      catDesc: "REVENUE",
      catValue: "MEDI",
      indentNo: "",
      pisCode: "",
      approvedYN: "N",
      rActiveYN: "Y",
      approvedID: 0,
      approvedBy: "",
      details: [],
    }),
    [selectedDepartmentId, selectedDepartmentName, issualType]
  );

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors, isDirty, isValid },
  } = useForm<PhysicianIssualFormData>({
    defaultValues,
    resolver: zodResolver(physicianIssualSchema),
    mode: "onChange",
  });
  const activeStatusValue = useWatch({ control, name: "rActiveYN" });
  const approvalStatusValue = useWatch({ control, name: "approvedYN" });

  const fromDeptID = watch("fromDeptID");
  const pisCode = watch("pisCode");
  const watchedDetails = useWatch({ control, name: "details" });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "details",
  });

  const memoizedPhysicianOptions = useMemo(() => {
    return attendingPhy || [];
  }, [attendingPhy]);

  const memoizedDepartmentOptions = useMemo(() => {
    return department || [];
  }, [department]);

  const validDetailsCount = useMemo(() => {
    if (!watchedDetails) return 0;
    return watchedDetails.filter((detail) => detail && detail.productID && (detail.issuedQty > 0 || detail.requestedQty > 0)).length;
  }, [watchedDetails]);

  const canSave = useMemo(() => {
    if (isSaving || !isDataLoaded || isViewMode) return false;

    const currentValues = getValues();
    const hasRequiredFields = currentValues.fromDeptID > 0 && currentValues.recConID > 0 && currentValues.pisCode?.trim();

    const hasValidProducts = fields.length > 0 && validDetailsCount > 0;

    return hasRequiredFields && hasValidProducts && isValid;
  }, [isSaving, isDataLoaded, isViewMode, validDetailsCount, fields.length, isValid, getValues]);

  const createDetailMappingWithAllFields = useCallback((detail: any, isCopyMode: boolean) => {
    const mappedDetail = { ...detail };
    if (isCopyMode) {
      mappedDetail.pisDetID = 0;
      mappedDetail.pisid = 0;
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
      pisDetID: 0,
      pisid: 0,
      productID: 0,
      mfID: 0,
      pUnitID: 0,
      pUnitsPerPack: 1,
      pkgID: 0,
      unitPrice: 0,
      tax: 0,
      sellUnitPrice: 0,
      requestedQty: 0,
      issuedQty: 0,
      availableQty: 0,
      psGrpID: 0,
      pGrpID: 0,
      taxID: 0,
      mrp: 0,
      manufacturerID: 0,
      psbid: 0,
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
      expiryYN: "N",
      psGrpName: "",
      pGrpName: "",
      taxCode: "",
      taxName: "",
      hsnCode: "",
      manufacturerCode: "",
      manufacturerName: "",
      remarks: "",
    };
    Object.keys(stringDefaults).forEach((key) => {
      if (mappedDetail[key] === null || mappedDetail[key] === undefined) {
        mappedDetail[key] = stringDefaults[key];
      }
    });
    return mappedDetail;
  }, []);

  const generateIssualCodeAsync = useCallback(async () => {
    const deptId = getValues("fromDeptID") || selectedDepartmentId;
    if (!isAddMode || !deptId) return;
    try {
      setIsGeneratingCode(true);
      const code = await generatePhysicianIssualCode(deptId);
      if (code) {
        setValue("pisCode", code, { shouldValidate: true, shouldDirty: true });
      } else {
        showAlert("Warning", "Failed to generate Physician Issual code", "warning");
      }
    } catch (error) {
      showAlert("Error", "Error generating issual code.", "error");
    } finally {
      setIsGeneratingCode(false);
    }
  }, [isAddMode, selectedDepartmentId, getValues, setValue, generatePhysicianIssualCode, showAlert]);

  const loadIssualDetails = useCallback(async () => {
    if (!initialData) return;
    try {
      setLoading(true);
      let compositeDto: ProductIssualCompositeDto;
      if (initialData.details && Array.isArray(initialData.details) && initialData.details.length > 0) {
        compositeDto = { productIssual: initialData, details: initialData.details };
      } else {
        const fetchedComposite = await getIssualWithDetailsById(initialData.pisid);
        if (!fetchedComposite || !fetchedComposite.productIssual) {
          showAlert("Error", "Failed to fetch physician issual details from API", "error");
          return;
        }
        compositeDto = fetchedComposite;
      }
      const formData: PhysicianIssualFormData = {
        pisid: isCopyMode ? 0 : compositeDto.productIssual.pisid,
        pisDate: isCopyMode ? new Date() : new Date(compositeDto.productIssual.pisDate),
        issualType: issualType,
        fromDeptID: compositeDto.productIssual.fromDeptID,
        fromDeptName: compositeDto.productIssual.fromDeptName,
        toDeptID: compositeDto.productIssual.toDeptID || 0,
        toDeptName: compositeDto.productIssual.toDeptName || "",
        recConID: compositeDto.productIssual.recConID || 0,
        recConName: compositeDto.productIssual.recConName || "",
        auGrpID: compositeDto.productIssual.auGrpID || 18,
        catDesc: compositeDto.productIssual.catDesc || "REVENUE",
        catValue: compositeDto.productIssual.catValue || "MEDI",
        indentNo: isCopyMode ? "" : compositeDto.productIssual.indentNo || "",
        pisCode: isCopyMode ? "" : compositeDto.productIssual.pisCode || "",
        approvedYN: isCopyMode ? "N" : compositeDto.productIssual.approvedYN,
        approvedID: isCopyMode ? 0 : compositeDto.productIssual.approvedID || 0,
        approvedBy: isCopyMode ? "" : compositeDto.productIssual.approvedBy || "",
        details: (compositeDto.details || []).map((detail) => createDetailMappingWithAllFields(detail, isCopyMode)),
      };
      reset(formData);
      setIsDataLoaded(true);
      if (isCopyMode && formData.fromDeptID) {
        setTimeout(() => generateIssualCodeAsync(), 500);
      }
      const actionText = isViewMode ? "viewing" : isCopyMode ? "copying" : "editing";
      showAlert("Success", `Physician issual data loaded successfully for ${actionText}`, "success");
    } catch (error) {
      showAlert("Error", "Failed to load physician issual details", "error");
    } finally {
      setLoading(false);
    }
  }, [initialData, isCopyMode, isViewMode, getIssualWithDetailsById, reset, setLoading, showAlert, generateIssualCodeAsync, createDetailMappingWithAllFields, issualType]);

  const handleAttendingPhysicianChange = useCallback(
    (value: any) => {
      const selectedOption = attendingPhy.find((option) => option.value === value.value);
      if (selectedOption) {
        setValue("recConID", Number(value.value.split("-")[0]), { shouldValidate: true });
        setValue("recConName", selectedOption.label, { shouldValidate: true });
      }
    },
    [attendingPhy, setValue]
  );

  useEffect(() => {
    if (open && !isDataLoaded) {
      if (initialData && (isCopyMode || isEditMode || isViewMode)) {
        loadIssualDetails();
      } else if (isAddMode && !initialData) {
        reset(defaultValues);
        setIsDataLoaded(true);
      }
    }
  }, [open, initialData, isAddMode, isCopyMode, isEditMode, isViewMode, isDataLoaded, loadIssualDetails, reset, defaultValues]);

  useEffect(() => {
    if (isAddMode && selectedDepartmentId && selectedDepartmentName && !initialData && isDataLoaded) {
      setValue("fromDeptID", selectedDepartmentId, { shouldValidate: true, shouldDirty: false });
      setValue("fromDeptName", selectedDepartmentName, { shouldValidate: true, shouldDirty: false });
    }
  }, [isAddMode, selectedDepartmentId, selectedDepartmentName, setValue, initialData, isDataLoaded]);

  useEffect(() => {
    if (isAddMode && !isCopyMode && fromDeptID > 0 && !pisCode && isDataLoaded) {
      generateIssualCodeAsync();
    }
  }, [isAddMode, isCopyMode, fromDeptID, pisCode, isDataLoaded, generateIssualCodeAsync]);

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

  const onSubmit = async (data: PhysicianIssualFormData) => {
    debugger;
    if (isViewMode) return;
    setFormError(null);
    try {
      setIsSaving(true);
      setLoading(true);
      if (!data.fromDeptID || data.fromDeptID === 0) throw new Error("From department is required.");
      if (!data.recConID || data.recConID === 0) throw new Error("Physician is required.");
      const validDetails = data.details.filter((detail) => detail.issuedQty > 0);
      if (validDetails.length === 0) throw new Error("At least one product must have an issued quantity greater than 0");
      const fromDept = memoizedDepartmentOptions?.find((d) => Number(d.value) === data.fromDeptID);
      const selectedPhysician = memoizedPhysicianOptions?.find((p) => Number(p.value) === data.recConID);
      const transformedDetails: ProductIssualDetailDto[] = validDetails.map((detail) => ({
        pisDetID: detail.pisDetID || 0,
        pisid: detail.pisid || 0,
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
        requestedQty: detail.requestedQty || 0,
        issuedQty: detail.issuedQty || 0,
        availableQty: detail.availableQty,
        expiryYN: detail.expiryYN || "N",
        psGrpID: detail.psGrpID,
        psGrpName: detail.psGrpName,
        pGrpID: detail.pGrpID,
        pGrpName: detail.pGrpName,
        taxID: detail.taxID,
        taxCode: detail.taxCode,
        taxName: detail.taxName,
        hsnCode: detail.hsnCode,
        mrp: detail.mrp,
        manufacturerID: detail.manufacturerID,
        manufacturerCode: detail.manufacturerCode,
        manufacturerName: detail.manufacturerName,
        psbid: detail.psbid,
        remarks: detail.remarks || "",
      }));

      const issualCompositeDto: ProductIssualCompositeDto = {
        productIssual: {
          ...data,
          fromDeptName: fromDept?.label || data.fromDeptName,
          recConName: selectedPhysician?.label || data.recConName,
          totalItems: calculateTotalItems(transformedDetails),
          totalRequestedQty: calculateTotalRequestedQty(transformedDetails),
          totalIssuedQty: calculateTotalIssuedQty(transformedDetails),
          issualTypeName: getIssualTypeName(issualType),
          issualCodePrefix: getIssualCodePrefix(issualType),
        } as ProductIssualDto,
        details: transformedDetails,
      };

      const response = await savePhysicianIssual(issualCompositeDto);
      if (response.success) {
        const actionText = isCopyMode ? "copied" : isAddMode ? "created" : "updated";
        showAlert("Success", `Physician Issual ${actionText} successfully.`, "success");
        onClose(true);
      } else {
        throw new Error(response.errorMessage || "Failed to save physician issual");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save physician issual";
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
      setTimeout(() => loadIssualDetails(), 100);
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
    ? `View Physician Issual - ${initialData?.pisCode || "N/A"}`
    : isCopyMode
    ? `Copy Physician Issual - ${initialData?.pisCode || "N/A"}`
    : isAddMode
    ? "Create New Physician Issual"
    : `Edit Physician Issual - ${initialData?.pisCode || "N/A"}`;

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
                <Typography variant="body2"> Copying from "{initialData?.pisCode}". A new code will be generated. </Typography>
              </Box>
            </Alert>
          )}
          {!isDataLoaded && (initialData || !isAddMode) && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={20} /> <Typography variant="body2">Loading issual data...</Typography>
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
              <PhysicianIcon sx={{ color: "primary.main" }} />
              <Typography variant="h6" color="primary">
                Physician Issual Information
              </Typography>
              {isDirty && !isViewMode && <Chip label="Modified" size="small" color="warning" variant="outlined" />}
            </Box>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ sm: 12, md: 2 }}>
                <FormField
                  name="pisCode"
                  control={control}
                  label="Issual Code"
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
                              <IconButton size="small" onClick={generateIssualCodeAsync} aria-label="Generate new issual code">
                                <Refresh />
                              </IconButton>
                            </Tooltip>
                          )}
                        </InputAdornment>
                      ) : null,
                  }}
                />
              </Grid>
              <Grid size={{ sm: 12, md: 2.25 }}>
                <FormField
                  name="fromDeptID"
                  control={control}
                  label="From Department"
                  type="select"
                  required
                  disabled={isViewMode || (!isAddMode && !isCopyMode && initialData?.approvedYN === "Y") || (isAddMode && !!selectedDepartmentId)}
                  size="small"
                  options={memoizedDepartmentOptions}
                  fullWidth
                  onChange={(value) => {
                    const selectedDept = memoizedDepartmentOptions?.find((d) => Number(d.value) === Number(value.value));
                    setValue("fromDeptName", selectedDept?.label || "");
                    setValue("recConID", 0);
                    setValue("recConName", "");
                    if (isAddMode) {
                      setValue("pisCode", "", { shouldDirty: true });
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

              <Grid size={{ xs: 12, md: 2.75 }}>
                <FormField
                  name="recConName"
                  control={control}
                  type="select"
                  label="Physician"
                  required
                  size="small"
                  options={attendingPhy}
                  onChange={handleAttendingPhysicianChange}
                />
              </Grid>
              <Grid size={{ sm: 12, md: 2.75 }}>
                <FormField name="indentNo" control={control} label="Indent No." type="text" disabled={isViewMode} size="small" fullWidth />
              </Grid>
              <Grid size={{ sm: 12, md: 1.5 }}>
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

          <PhysicianProductDetailsSection
            control={control}
            fields={fields}
            append={append}
            remove={remove}
            setValue={setValue}
            errors={errors}
            isViewMode={isViewMode}
            showAlert={showAlert}
          />
          <ProductBillingSection control={control} />
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

export default PhysicianIssualForm;
