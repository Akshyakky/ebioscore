import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { IssualType, ProductIssualCompositeDto, ProductIssualDetailDto, ProductIssualDto } from "@/interfaces/InventoryManagement/ProductIssualDto";
import { useAlert } from "@/providers/AlertProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check as CheckIcon, ContentCopy as ContentCopyIcon, Refresh, Save, Search as SearchIcon, Sync as SyncIcon } from "@mui/icons-material";
import { Alert, Box, CircularProgress, Grid, IconButton, InputAdornment, Paper, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { useProductIssual } from "../hooks/useProductIssual";
import ProductBillingSection from "./ProductBillingSection";
import ProductDetailsSection from "./ProductManagementSection";

interface ProductIssualFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  initialData: ProductIssualDto | null;
  viewOnly?: boolean;
  copyMode?: boolean;
  selectedDepartmentId?: number;
  selectedDepartmentName?: string;
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
  rActiveYN: z.string().default("Y"),
  remarks: z.string().optional(),
});

const schema = z.object({
  pisid: z.number(),
  pisDate: z.date(),
  issualType: z.nativeEnum(IssualType).default(IssualType.Department),
  fromDeptID: z.number().min(1, "From department is required"),
  fromDeptName: z.string(),
  toDeptID: z.number().min(1, "To department is required"),
  toDeptName: z.string(),
  auGrpID: z.number().optional(),
  catDesc: z.string().optional(),
  catValue: z.string().optional(),
  indentNo: z.string().optional(),
  pisCode: z.string().optional(),
  approvedYN: z.string(),
  approvedID: z.number().optional(),
  approvedBy: z.string().optional(),
  rActiveYN: z.string().default("Y"),
  details: z.array(issualDetailSchema).min(1, "At least one product detail is required"),
});

type ProductIssualFormData = z.infer<typeof schema>;

const ProductIssualForm: React.FC<ProductIssualFormProps> = ({ open, onClose, initialData, viewOnly = false, copyMode = false, selectedDepartmentId, selectedDepartmentName }) => {
  const { setLoading } = useLoading();
  const { getIssualWithDetailsById, generateDepartmentIssualCode, saveDepartmentIssual } = useProductIssual();
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { department } = useDropdownValues(["department"]);
  const { showAlert } = useAlert();
  const isAddMode = !initialData || copyMode;
  const isCopyMode = copyMode && !!initialData;
  const isEditMode = !!initialData && !copyMode && !viewOnly;

  const isViewMode = viewOnly;

  const defaultValues: ProductIssualFormData = useMemo(
    () => ({
      pisid: 0,
      pisDate: new Date(),
      issualType: IssualType.Department,
      fromDeptID: selectedDepartmentId || 0,
      fromDeptName: selectedDepartmentName || "",
      toDeptID: 0,
      toDeptName: "",
      auGrpID: 18,
      catDesc: "REVENUE",
      catValue: "MEDI",
      indentNo: "",
      pisCode: "",
      approvedYN: "N",
      approvedID: 0,
      approvedBy: "",
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
    formState: { errors, isDirty, isValid },
  } = useForm<ProductIssualFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });
  const activeStatusValue = useWatch({ control, name: "rActiveYN" });
  const approvalStatusValue = useWatch({ control, name: "approvedYN" });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "details",
  });

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
      rActiveYN: "Y",
    };

    Object.keys(stringDefaults).forEach((key) => {
      if (mappedDetail[key] === null || mappedDetail[key] === undefined) {
        mappedDetail[key] = stringDefaults[key];
      }
    });

    return mappedDetail;
  }, []);

  const generateIssualCodeAsync = async () => {
    const deptId = getValues("fromDeptID") || selectedDepartmentId;
    if (!isAddMode || !deptId) return;
    try {
      setIsGeneratingCode(true);
      const code = await generateDepartmentIssualCode(deptId);
      if (code) {
        setValue("pisCode", code, { shouldValidate: true, shouldDirty: true });
      } else {
        showAlert("Warning", "Failed to generate Department Issual code", "warning");
      }
    } catch (error) {
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const loadIssualDetails = useCallback(async () => {
    if (!initialData) return;
    try {
      setLoading(true);
      let compositeDto: ProductIssualCompositeDto;
      if (initialData.details && Array.isArray(initialData.details) && initialData.details.length > 0) {
        compositeDto = {
          productIssual: initialData,
          details: initialData.details,
        };
      } else {
        const fetchedComposite = await getIssualWithDetailsById(initialData.pisid);
        if (!fetchedComposite || !fetchedComposite.productIssual) {
          showAlert("Error", "Failed to fetch Department Issual details from API", "error");
        }
        compositeDto = fetchedComposite;
      }
      const formData: ProductIssualFormData = {
        pisid: isCopyMode ? 0 : compositeDto.productIssual.pisid,
        pisDate: isCopyMode ? new Date() : new Date(compositeDto.productIssual.pisDate),
        issualType: IssualType.Department,
        fromDeptID: compositeDto.productIssual.fromDeptID,
        fromDeptName: compositeDto.productIssual.fromDeptName,
        toDeptID: compositeDto.productIssual.toDeptID,
        toDeptName: compositeDto.productIssual.toDeptName,
        auGrpID: compositeDto.productIssual.auGrpID || 18,
        catDesc: compositeDto.productIssual.catDesc || "REVENUE",
        catValue: compositeDto.productIssual.catValue || "MEDI",
        indentNo: isCopyMode ? "" : compositeDto.productIssual.indentNo || "",
        pisCode: isCopyMode ? "" : compositeDto.productIssual.pisCode || "",

        approvedYN: isCopyMode ? "N" : compositeDto.productIssual.approvedYN,
        approvedID: isCopyMode ? 0 : compositeDto.productIssual.approvedID || 0,
        approvedBy: isCopyMode ? "" : compositeDto.productIssual.approvedBy || "",
        rActiveYN: isCopyMode ? "Y" : compositeDto.productIssual.rActiveYN || "Y",
        details: (compositeDto.details || []).map((detail) => createDetailMappingWithAllFields(detail, isCopyMode)),
      };
      reset(formData);
      setIsDataLoaded(true);
      if (isCopyMode && formData.fromDeptID) {
        setTimeout(() => generateIssualCodeAsync(), 500);
      }
      const actionText = isViewMode ? "viewing" : isCopyMode ? "copying" : "editing";
      showAlert("Success", `Department Issual data loaded successfully for ${actionText} (${formData.details.length} products)`, "success");
    } catch (error) {
      showAlert("Error", "Failed to load Department Issual details", "error");
    } finally {
      setLoading(false);
    }
  }, [initialData, isCopyMode, isViewMode, getIssualWithDetailsById, reset, setLoading, showAlert, generateIssualCodeAsync, createDetailMappingWithAllFields]);

  useEffect(() => {
    if (open && !isDataLoaded) {
      if (initialData && (isCopyMode || isEditMode || isViewMode)) {
        loadIssualDetails();
      } else if (isAddMode && !initialData) {
        reset(defaultValues);
        setIsDataLoaded(true);
      }
    }
  }, [open, initialData?.pisid, isAddMode, isCopyMode, isEditMode, isViewMode, isDataLoaded, loadIssualDetails, reset, defaultValues]);

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
    if (deptId && isAddMode && !isCopyMode && !isDataLoaded) {
      generateIssualCodeAsync();
    }
  }, [getValues("fromDeptID"), selectedDepartmentId, isAddMode, isCopyMode, isDataLoaded]);

  const onSubmit = async (data: ProductIssualFormData) => {
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

      if (!data.toDeptID || data.toDeptID === 0) {
        showAlert("Warning", "To department is required. Please select a destination department.", "warning");
        return;
      }
      if (data.fromDeptID === data.toDeptID) {
        showAlert("Warning", "From Department and To Department cannot be the same", "warning");
        return;
      }
      const validDetails = data.details.filter((detail) => detail.issuedQty > 0);
      if (validDetails.length === 0) {
        showAlert("Warning", "At least one product must have an issued quantity greater than 0", "warning");
        return;
      }

      const calculatedDetails = validDetails.map((detail) => ({
        ...detail,
        availableQty: (detail.availableQty || 0) - detail.issuedQty,
      }));

      const fromDept = department?.find((d) => Number(d.value) === data.fromDeptID);
      const toDept = department?.find((d) => Number(d.value) === data.toDeptID);
      const departmentIssualCompositeDto: ProductIssualCompositeDto = {
        productIssual: {
          pisid: data.pisid,
          pisDate: data.pisDate,
          issualType: IssualType.Department,
          fromDeptID: data.fromDeptID,
          fromDeptName: fromDept?.label || data.fromDeptName,
          toDeptID: data.toDeptID,
          toDeptName: toDept?.label || data.toDeptName,
          auGrpID: data.auGrpID || 18,
          catDesc: data.catDesc || "REVENUE",
          catValue: data.catValue || "MEDI",
          indentNo: data.indentNo || "",
          pisCode: data.pisCode || "",
          approvedYN: data.approvedYN || "N",
          approvedID: data.approvedID || 0,
          approvedBy: data.approvedBy || "",
          totalItems: calculatedDetails.length,
          totalRequestedQty: calculatedDetails.reduce((sum, detail) => sum + detail.requestedQty, 0),
          totalIssuedQty: calculatedDetails.reduce((sum, detail) => sum + detail.issuedQty, 0),
          issualTypeName: "Department Issual",
          destinationInfo: toDept?.label || data.toDeptName,
          destinationID: data.toDeptID,
          issualCodePrefix: "DIS",
        } as ProductIssualDto,
        details: calculatedDetails.map(
          (detail) =>
            ({
              pisDetID: detail.pisDetID || 0,
              pisid: detail.pisid || 0,
              productID: detail.productID,
              productCode: detail.productCode || "",
              productName: detail.productName,
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
              requestedQty: detail.requestedQty,
              issuedQty: detail.issuedQty,
              availableQty: detail.availableQty,
              expiryYN: detail.expiryYN || "N",
              psGrpID: detail.psGrpID || 0,
              psGrpName: detail.psGrpName || "",
              pGrpID: detail.pGrpID || 0,
              pGrpName: detail.pGrpName || "",
              taxID: detail.taxID || 0,
              taxCode: detail.taxCode || "",
              taxName: detail.taxName || "",
              hsnCode: detail.hsnCode || "",
              mrp: detail.mrp || 0,
              manufacturerID: detail.manufacturerID || 0,
              manufacturerCode: detail.manufacturerCode || "",
              manufacturerName: detail.manufacturerName || "",
              psbid: detail.psbid || 0,
              remarks: detail.remarks || "",
              rActiveYN: detail.rActiveYN || "Y",
            } as ProductIssualDetailDto)
        ),
      };

      const response = await saveDepartmentIssual(departmentIssualCompositeDto);
      if (response.success) {
        const actionText = isCopyMode ? "copied" : isAddMode ? "created" : "updated";
        showAlert("Success", `Department Issual ${actionText} successfully. ${calculatedDetails.length} products processed.`, "success");
        onClose(true);
      } else {
        showAlert("Error", response.errorMessage || "Failed to save Department Issual", "error");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save Department Issual";
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

  const dialogTitle = isViewMode
    ? `View Department Issual Details - ${initialData?.pisCode || "N/A"}`
    : isCopyMode
    ? `Copy Department Issual - ${initialData?.pisCode || "N/A"}`
    : isAddMode
    ? "Create New Department Issual"
    : `Edit Department Issual - ${initialData?.pisCode || "N/A"}`;

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
        title={dialogTitle}
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
                  You are copying Department Issual "{initialData?.pisCode}". A new issual code will be generated automatically.
                  {initialData?.details && initialData.details.length > 0 && <span> {initialData.details.length} product(s) will be copied to the new issual.</span>}
                </Typography>
              </Box>
            </Alert>
          )}

          {!isDataLoaded && (initialData || !isAddMode) && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body2">Loading Department Issual data...</Typography>
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
                  name="pisCode"
                  control={control}
                  label="Department Issue Code"
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
                            <IconButton size="small" onClick={generateIssualCodeAsync} title="Generate new code">
                              <Refresh />
                            </IconButton>
                          )}
                        </InputAdornment>
                      ) : null,
                  }}
                />
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

              <Grid size={{ sm: 12, md: 2 }}>
                <FormField
                  name="toDeptID"
                  control={control}
                  label="To Department"
                  type="select"
                  required
                  disabled={isViewMode}
                  size="small"
                  options={department?.filter((d) => Number(d.value) !== getValues("fromDeptID")) || []}
                  fullWidth
                  onChange={(value) => {
                    const selectedDept = department?.find((d) => Number(d.value) === Number(value.value));
                    setValue("toDeptName", selectedDept?.label || "");
                  }}
                />
              </Grid>

              <Grid size={{ sm: 12, md: 2 }}>
                <FormField name="indentNo" control={control} label="Indent No." type="text" disabled={isViewMode} size="small" fullWidth />
              </Grid>

              <Grid size={{ sm: 12, md: 4 }}>
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

          <ProductDetailsSection
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

export default ProductIssualForm;
