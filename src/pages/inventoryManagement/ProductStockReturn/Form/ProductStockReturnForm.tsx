import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { ProductStockReturnCompositeDto, ProductStockReturnDto, ReturnType } from "@/interfaces/InventoryManagement/ProductStockReturnDto";
import { useAlert } from "@/providers/AlertProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check as CheckIcon, ContentCopy as ContentCopyIcon, Refresh, Save, Search as SearchIcon, Sync as SyncIcon } from "@mui/icons-material";
import { Alert, Box, CircularProgress, FormControl, Grid, IconButton, InputAdornment, InputLabel, MenuItem, Paper, Select, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { useProductStockReturn } from "../hook/useProductStockReturn";
import StockReturnProductSection from "./ProductReturnDetailsSection";
import StockReturnBillingSection from "./StockReturnBillingSection";

interface ProductStockReturnFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  initialData: ProductStockReturnDto | null;
  viewOnly?: boolean;
  copyMode?: boolean;
  selectedDepartmentId?: number;
  selectedDepartmentName?: string;
}

const returnDetailSchema = z.object({
  psrdID: z.number().default(0),
  psrID: z.number().default(0),
  productID: z.number().min(1, "Product is required"),
  productCode: z.string().optional(),
  productName: z.string().min(1, "Product name is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be non-negative"),
  totalAmount: z.number().min(0, "Total amount must be non-negative"),
  sellUnitPrice: z.number().optional(),
  mrp: z.number().optional(),
  batchID: z.number().optional(),
  batchNo: z.string().optional(),
  expiryDate: z.date().optional(),
  manufacturedDate: z.date().optional(),
  grnDate: z.date().default(() => new Date()),
  prescriptionYN: z.string().default("N"),
  expiryYN: z.string().default("N"),
  sellableYN: z.string().default("Y"),
  taxableYN: z.string().default("Y"),
  rActiveYN: z.string().default("Y"),
  psGrpID: z.number().optional(),
  psGrpName: z.string().optional(),
  pGrpID: z.number().optional(),
  pGrpName: z.string().optional(),
  manufacturerID: z.number().optional(),
  manufacturerCode: z.string().optional(),
  manufacturerName: z.string().optional(),
  mfID: z.number().optional(),
  mfName: z.string().optional(),
  taxID: z.number().optional(),
  taxName: z.string().optional(),
  tax: z.number().optional(),
  cgst: z.number().optional(),
  sgst: z.number().optional(),
  pUnitID: z.number().optional(),
  pUnitName: z.string().optional(),
  pUnitsPerPack: z.number().default(1),
  pkgID: z.number().optional(),
  pkgName: z.string().optional(),
  hsnCode: z.string().optional(),
  availableQty: z.number().optional(),
  freeRetQty: z.number().default(0),
  freeRetUnitQty: z.number().default(0),
  psdID: z.number().default(1),
  psbid: z.number().optional(),
  returnReason: z.string().optional(),
});

const schema = z.object({
  psrID: z.number().default(0),
  psrDate: z.date().default(() => new Date()),
  dtID: z.number().default(0),
  dtCode: z.string().optional(),
  dtName: z.string().default(""),
  returnTypeCode: z.string().min(1, "Return type is required"),
  returnType: z.string().optional(),
  fromDeptID: z.number().min(1, "From department is required"),
  fromDeptName: z.string().default(""),
  toDeptID: z.number().optional(),
  toDeptName: z.string().optional(),
  supplierID: z.number().optional(),
  supplierName: z.string().optional(),
  auGrpID: z.number().default(18),
  authorisedBy: z.string().optional(),
  catDesc: z.string().default("REVENUE"),
  catValue: z.string().default("MEDI"),
  psrCode: z.string().optional(),
  approvedYN: z.string().default("N"),
  approvedID: z.number().optional(),
  approvedBy: z.string().optional(),
  stkrCoinAdjAmt: z.number().optional(),
  stkrGrossAmt: z.number().optional(),
  stkrRetAmt: z.number().optional(),
  stkrTaxAmt: z.number().optional(),
  rActiveYN: z.string().default("Y"),
  productStockReturnDetails: z.array(returnDetailSchema).min(1, "At least one product detail is required"),
});

type ProductStockReturnFormData = z.infer<typeof schema>;

const ProductStockReturnForm: React.FC<ProductStockReturnFormProps> = ({
  open,
  onClose,
  initialData,
  viewOnly = false,
  copyMode = false,
  selectedDepartmentId,
  selectedDepartmentName,
}) => {
  const { setLoading } = useLoading();
  const {
    getReturnWithDetailsById,
    generateReturnCode,
    generateSupplierReturnCode,
    generateInternalReturnCode,
    generateExpiredReturnCode,
    generateDamagedReturnCode,
    saveReturnWithDetails,
  } = useProductStockReturn();
  const [state, setState] = useState({
    isSaving: false,
    formError: null as string | null,
    isGeneratingCode: false,
    showResetConfirmation: false,
    showCancelConfirmation: false,
    isDataLoaded: false,
    isLoadingData: false,
  });
  const { department } = useDropdownValues(["department"]);
  const { showAlert } = useAlert();
  const isAddMode = !initialData || copyMode;
  const isCopyMode = copyMode && !!initialData;
  const isEditMode = !!initialData && !copyMode && !viewOnly;
  const [isViewMode] = useState<boolean>(viewOnly);

  const supplier = [
    { value: 1, label: "Supplier1" },
    { value: 2, label: "Supplier2" },
  ];

  const defaultValues: ProductStockReturnFormData = useMemo(
    () => ({
      psrID: 0,
      psrDate: new Date(),
      dtID: 0,
      dtCode: "",
      dtName: "",
      returnTypeCode: ReturnType.Supplier,
      returnType: "",
      fromDeptID: selectedDepartmentId || 0,
      fromDeptName: selectedDepartmentName || "",
      toDeptID: undefined,
      toDeptName: "",
      supplierID: undefined,
      supplierName: "",
      auGrpID: 18,
      authorisedBy: "",
      catDesc: "REVENUE",
      catValue: "MEDI",
      psrCode: "",
      approvedYN: "N",
      approvedID: undefined,
      approvedBy: "",
      stkrCoinAdjAmt: undefined,
      stkrGrossAmt: undefined,
      stkrRetAmt: undefined,
      stkrTaxAmt: undefined,
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
  } = useForm<ProductStockReturnFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const activeStatusValue = useWatch({ control, name: "rActiveYN" });
  const approvalStatusValue = useWatch({ control, name: "approvedYN" });
  const returnTypeValue = useWatch({ control, name: "returnTypeCode" });
  const { fields, append, remove } = useFieldArray({ control, name: "productStockReturnDetails" });

  const createDetailMappingWithAllFields = useCallback(
    (detail: any, isCopyMode: boolean) => ({
      psrdID: isCopyMode ? 0 : detail.psrdID || 0,
      psrID: isCopyMode ? 0 : detail.psrID || 0,
      productID: detail.productID || 0,
      productCode: detail.productCode || "",
      productName: detail.productName || "",
      quantity: detail.quantity || 0,
      unitPrice: detail.unitPrice || detail.sellUnitPrice || detail.defaultPrice || 0,
      totalAmount: detail.totalAmount || 0,
      sellUnitPrice: detail.sellUnitPrice || detail.unitPrice || 0,
      mrp: detail.mrp || detail.itemMrpValue || 0,
      batchID: detail.batchID,
      batchNo: detail.batchNo || "",
      expiryDate: detail.expiryDate ? new Date(detail.expiryDate) : undefined,
      manufacturedDate: detail.manufacturedDate ? new Date(detail.manufacturedDate) : undefined,
      grnDate: detail.grnDate ? new Date(detail.grnDate) : new Date(),
      prescriptionYN: detail.prescriptionYN || "N",
      expiryYN: detail.expiryYN || "N",
      sellableYN: detail.sellableYN || "Y",
      taxableYN: detail.taxableYN || "Y",
      rActiveYN: detail.rActiveYN || "Y",
      psGrpID: detail.psGrpID,
      psGrpName: detail.psGrpName || "",
      pGrpID: detail.pGrpID,
      pGrpName: detail.pGrpName || "",
      manufacturerID: detail.manufacturerID,
      manufacturerCode: detail.manufacturerCode || "",
      manufacturerName: detail.manufacturerName || detail.mfName || "",
      mfID: detail.mfID,
      mfName: detail.mfName || detail.manufacturerName || "",
      taxID: detail.taxID,
      taxCode: detail.taxCode || "",
      taxName: detail.taxName || "",
      tax: detail.tax || 0,
      cgst: detail.cgst || detail.cgstPerValue || (detail.tax ? detail.tax / 2 : 0),
      sgst: detail.sgst || detail.sgstPerValue || (detail.tax ? detail.tax / 2 : 0),
      pUnitID: detail.pUnitID,
      pUnitName: detail.pUnitName || "",
      pUnitsPerPack: detail.pUnitsPerPack || 1,
      pkgID: detail.pkgID,
      pkgName: detail.pkgName || "",
      hsnCode: detail.hsnCode || "",
      availableQty: detail.availableQty || detail.acceptQty || detail.recvdQty || 0,
      freeRetQty: detail.freeRetQty || 0,
      freeRetUnitQty: detail.freeRetUnitQty || 0,
      psdID: detail.psdID || 1,
      psbid: detail.psbid || detail.grnDetID,
      returnReason: detail.returnReason || "",
    }),
    []
  );

  const generateReturnCodeAsync = async () => {
    const deptId = getValues("fromDeptID") || selectedDepartmentId;
    const returnType = getValues("returnTypeCode");
    if (!isAddMode || !deptId || !returnType) return;
    try {
      setState((prev) => ({ ...prev, isGeneratingCode: true }));
      let code: string | null = null;
      switch (returnType) {
        case ReturnType.Supplier:
          code = await generateSupplierReturnCode(deptId);
          break;
        case ReturnType.Internal:
          code = await generateInternalReturnCode(deptId);
          break;
        case ReturnType.Expired:
          code = await generateExpiredReturnCode(deptId);
          break;
        case ReturnType.Damaged:
          code = await generateDamagedReturnCode(deptId);
          break;
        default:
          code = await generateReturnCode(deptId, returnType);
      }
      if (code) {
        setValue("psrCode", code, { shouldValidate: true, shouldDirty: true });
      } else {
        showAlert("Warning", `Failed to generate ${returnType} return code`, "warning");
      }
    } catch (error) {
      showAlert("Error", "Error generating return code", "error");
    } finally {
      setState((prev) => ({ ...prev, isGeneratingCode: false }));
    }
  };

  const loadReturnDetails = useCallback(async () => {
    if (!initialData) return;
    try {
      setState((prev) => ({ ...prev, isLoadingData: true }));
      setLoading(true);
      let returnData: ProductStockReturnDto;
      let detailsData: any[] = [];
      if (initialData.details && Array.isArray(initialData.details) && initialData.details.length > 0) {
        returnData = initialData;
        detailsData = initialData.details;
      } else {
        const fetchedComposite = await getReturnWithDetailsById(initialData.psrID);
        if (!fetchedComposite || !fetchedComposite.productStockReturn) {
          throw new Error("Failed to fetch Product Stock Return details from API");
        }
        returnData = fetchedComposite.productStockReturn;
        detailsData = fetchedComposite.productStockReturnDetails || [];
      }
      const formData: ProductStockReturnFormData = {
        psrID: isCopyMode ? 0 : returnData.psrID || 0,
        psrDate: returnData.psrDate ? new Date(returnData.psrDate) : new Date(),
        dtID: returnData.dtID || 0,
        dtCode: isCopyMode ? "" : returnData.dtCode || "",
        dtName: returnData.dtName || "",
        returnTypeCode: returnData.returnTypeCode || ReturnType.Supplier,
        returnType: returnData.returnType || "",
        fromDeptID: returnData.fromDeptID || selectedDepartmentId || 0,
        fromDeptName: returnData.fromDeptName || selectedDepartmentName || "",
        toDeptID: isCopyMode ? undefined : returnData.toDeptID,
        toDeptName: isCopyMode ? "" : returnData.toDeptName || "",
        supplierID: isCopyMode ? undefined : returnData.supplierID,
        supplierName: isCopyMode ? "" : returnData.supplierName || "",
        auGrpID: returnData.auGrpID || 18,
        authorisedBy: isCopyMode ? "" : returnData.authorisedBy || "",
        catDesc: returnData.catDesc || "REVENUE",
        catValue: returnData.catValue || "MEDI",
        psrCode: isCopyMode ? "" : returnData.psrCode || "",
        approvedYN: isCopyMode ? "N" : returnData.approvedYN || "N",
        approvedID: isCopyMode ? undefined : returnData.approvedID,
        approvedBy: isCopyMode ? "" : returnData.approvedBy || "",
        stkrCoinAdjAmt: returnData.stkrCoinAdjAmt,
        stkrGrossAmt: returnData.stkrGrossAmt,
        stkrRetAmt: returnData.stkrRetAmt,
        stkrTaxAmt: returnData.stkrTaxAmt,
        rActiveYN: returnData.rActiveYN || "Y",
        productStockReturnDetails: detailsData.map((detail) => createDetailMappingWithAllFields(detail, isCopyMode)),
      };
      reset(formData);
      setState((prev) => ({ ...prev, isDataLoaded: true }));
      if (isCopyMode && formData.fromDeptID) {
        setTimeout(() => generateReturnCodeAsync(), 500);
      }
      const actionText = isViewMode ? "viewing" : isCopyMode ? "copying" : "editing";
      showAlert("Success", `Stock Return data loaded successfully for ${actionText} (${formData.productStockReturnDetails.length} products)`, "success");
    } catch (error) {
      console.error("Error loading return details:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load Stock Return details";
      showAlert("Error", errorMessage, "error");
      setState((prev) => ({ ...prev, formError: errorMessage }));
    } finally {
      setState((prev) => ({ ...prev, isLoadingData: false }));
      setLoading(false);
    }
  }, [initialData, isCopyMode, isViewMode, getReturnWithDetailsById, reset, setLoading, showAlert, createDetailMappingWithAllFields, selectedDepartmentId, selectedDepartmentName]);

  useEffect(() => {
    if (!open) return;
    if (state.isDataLoaded) return;
    if (initialData && (isCopyMode || isEditMode || isViewMode)) {
      loadReturnDetails();
    } else if (isAddMode && !initialData) {
      reset(defaultValues);
      setState((prev) => ({ ...prev, isDataLoaded: true }));
    }
  }, [open, initialData?.psrID, isAddMode, isCopyMode, isEditMode, isViewMode, state.isDataLoaded, loadReturnDetails, reset, defaultValues]);

  useEffect(() => {
    if (isAddMode && selectedDepartmentId && selectedDepartmentName && !initialData && state.isDataLoaded) {
      setValue("fromDeptID", selectedDepartmentId, { shouldValidate: true, shouldDirty: false });
      setValue("fromDeptName", selectedDepartmentName, { shouldValidate: true, shouldDirty: false });
    }
  }, [isAddMode, selectedDepartmentId, selectedDepartmentName, setValue, initialData, state.isDataLoaded]);

  useEffect(() => {
    if (!open) {
      setState((prev) => ({ ...prev, isDataLoaded: false, formError: null, isLoadingData: false }));
    }
  }, [open]);

  useEffect(() => {
    const deptId = getValues("fromDeptID") || selectedDepartmentId;
    if (deptId && isAddMode && !isCopyMode && state.isDataLoaded) {
      generateReturnCodeAsync();
    }
  }, [getValues("fromDeptID"), selectedDepartmentId, isAddMode, isCopyMode, state.isDataLoaded, getValues("returnTypeCode")]);

  useEffect(() => {
    if (state.isDataLoaded && (isAddMode || isCopyMode)) {
      generateReturnCodeAsync();
      const currentReturnType = getValues("returnTypeCode");
      if (currentReturnType !== ReturnType.Internal) {
        setValue("toDeptID", undefined, { shouldValidate: true });
        setValue("toDeptName", "", { shouldValidate: true });
      }
      if (currentReturnType !== ReturnType.Supplier) {
        setValue("supplierID", undefined, { shouldValidate: true });
        setValue("supplierName", "", { shouldValidate: true });
      }
    }
  }, [returnTypeValue]);

  const handleReturnTypeChange = (value: string) => {
    setValue("returnTypeCode", value, { shouldValidate: true, shouldDirty: true });
    setValue("returnType", getReturnTypeName(value), { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = async (data: ProductStockReturnFormData) => {
    if (isViewMode) return;
    setState((prev) => ({ ...prev, formError: null }));
    try {
      setState((prev) => ({ ...prev, isSaving: true }));
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

      if (data.returnTypeCode === ReturnType.Internal && (!data.toDeptID || data.toDeptID === 0)) {
        showAlert("Warning", "To department is required for Internal Returns. Please select a destination department.", "warning");
        return;
      }

      if (data.returnTypeCode === ReturnType.Supplier && (!data.supplierID || data.supplierID === 0)) {
        showAlert("Warning", "Supplier is required for Supplier Returns. Please select a supplier.", "warning");
        return;
      }

      if (data.returnTypeCode === ReturnType.Internal && data.fromDeptID === data.toDeptID) {
        showAlert("Warning", "From Department and To Department cannot be the same", "warning");
        return;
      }

      if (data.productStockReturnDetails.length === 0) {
        showAlert("Warning", "At least one product must be added to the return", "warning");
        return;
      }

      const fromDept = department?.find((d) => Number(d.value) === data.fromDeptID);
      const toDept = department?.find((d) => Number(d.value) === data.toDeptID);
      const selectedSupplier = supplier?.find((s) => Number(s.value) === data.supplierID);
      const stockReturnCompositeDto: ProductStockReturnCompositeDto = {
        productStockReturn: {
          psrID: data.psrID,
          psrDate: data.psrDate,
          dtID: data.dtID,
          dtCode: data.dtCode || "",
          dtName: data.dtName,
          returnTypeCode: data.returnTypeCode,
          returnType: data.returnType || getReturnTypeName(data.returnTypeCode),
          fromDeptID: data.fromDeptID,
          fromDeptName: fromDept?.label || data.fromDeptName,
          toDeptID: data.toDeptID,
          toDeptName: toDept?.label || data.toDeptName,
          supplierID: data.supplierID,
          supplierName: selectedSupplier?.label || data.supplierName,
          auGrpID: data.auGrpID || 18,
          authorisedBy: data.authorisedBy,
          catDesc: data.catDesc || "REVENUE",
          catValue: data.catValue || "MEDI",
          psrCode: data.psrCode || "",
          approvedYN: data.approvedYN || "N",
          approvedID: data.approvedID,
          approvedBy: data.approvedBy,
          stkrCoinAdjAmt: data.stkrCoinAdjAmt,
          stkrGrossAmt: data.stkrGrossAmt,
          stkrRetAmt: data.stkrRetAmt,
          stkrTaxAmt: data.stkrTaxAmt,
          rActiveYN: data.rActiveYN || "Y",
        } as ProductStockReturnDto,
        productStockReturnDetails: data.productStockReturnDetails.map((detail) => ({
          psrdID: detail.psrdID || 0,
          psrID: detail.psrID || 0,
          productID: detail.productID,
          productCode: detail.productCode,
          productName: detail.productName,
          quantity: detail.quantity,
          unitPrice: detail.unitPrice,
          totalAmount: detail.totalAmount,
          sellUnitPrice: detail.sellUnitPrice,
          mrp: detail.mrp,
          batchID: detail.batchID,
          batchNo: detail.batchNo,
          expiryDate: detail.expiryDate,
          manufacturedDate: detail.manufacturedDate,
          grnDate: detail.grnDate,
          prescriptionYN: detail.prescriptionYN || "N",
          expiryYN: detail.expiryYN || "N",
          sellableYN: detail.sellableYN || "Y",
          taxableYN: detail.taxableYN || "Y",
          rActiveYN: detail.rActiveYN || "Y",
          psGrpID: detail.psGrpID,
          psGrpName: detail.psGrpName,
          pGrpID: detail.pGrpID,
          pGrpName: detail.pGrpName,
          manufacturerID: detail.manufacturerID,
          manufacturerCode: detail.manufacturerCode,
          manufacturerName: detail.manufacturerName,
          mfID: detail.mfID,
          mfName: detail.mfName,
          taxID: detail.taxID,
          taxName: detail.taxName,
          tax: detail.tax,
          cgst: detail.cgst,
          sgst: detail.sgst,
          pUnitID: detail.pUnitID,
          pUnitName: detail.pUnitName,
          pUnitsPerPack: detail.pUnitsPerPack || 1,
          pkgID: detail.pkgID,
          pkgName: detail.pkgName,
          hsnCode: detail.hsnCode,
          availableQty: detail.availableQty,
          freeRetQty: detail.freeRetQty || 0,
          freeRetUnitQty: detail.freeRetUnitQty || 0,
          psdID: detail.psdID || 1,
          psbid: detail.psbid,
          returnReason: detail.returnReason,
        })),
      };

      const response = await saveReturnWithDetails(stockReturnCompositeDto);
      if (response.success) {
        const actionText = isCopyMode ? "copied" : isAddMode ? "created" : "updated";
        const totalItems = data.productStockReturnDetails.length;
        showAlert("Success", `Stock Return ${actionText} successfully. ${totalItems} products processed.`, "success");
        onClose(true);
      } else {
        showAlert("Error", response.errorMessage || "Failed to save Stock Return", "error");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save Stock Return";
      setState((prev) => ({ ...prev, formError: errorMessage }));
      showAlert("Error", errorMessage, "error");
    } finally {
      setState((prev) => ({ ...prev, isSaving: false }));
      setLoading(false);
    }
  };

  const getReturnTypeName = (returnTypeCode: string): string => {
    switch (returnTypeCode) {
      case ReturnType.Supplier:
        return "Supplier Return";
      case ReturnType.Internal:
        return "Internal Transfer";
      case ReturnType.Expired:
        return "Expired Items";
      case ReturnType.Damaged:
        return "Damaged Items";
      default:
        return returnTypeCode || "Unknown";
    }
  };

  const performReset = () => {
    const resetData = initialData ? undefined : defaultValues;
    reset(resetData);
    setState((prev) => ({ ...prev, formError: null, isDataLoaded: false }));
    if (initialData) {
      setTimeout(() => loadReturnDetails(), 100);
    }
  };

  const handleReset = () => {
    if (isDirty) {
      setState((prev) => ({ ...prev, showResetConfirmation: true }));
    } else {
      performReset();
    }
  };

  const dialogTitle = isViewMode
    ? `View Stock Return Details - ${initialData?.psrCode || "N/A"}`
    : isCopyMode
    ? `Copy Stock Return - ${initialData?.psrCode || "N/A"}`
    : isAddMode
    ? "Create New Stock Return"
    : `Edit Stock Return - ${initialData?.psrCode || "N/A"}`;

  const dialogActions = isViewMode ? (
    <SmartButton text="Close" onClick={() => onClose()} variant="contained" color="primary" />
  ) : (
    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
      <SmartButton text="Clear" onClick={handleReset} variant="outlined" color="error" disabled={state.isSaving} />
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
        disabled={state.isSaving || !isValid || fields.length === 0}
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
        disableBackdropClick={!isViewMode && (isDirty || state.isSaving)}
        disableEscapeKeyDown={!isViewMode && (isDirty || state.isSaving)}
        actions={dialogActions}
      >
        <Box component="form" noValidate sx={{ p: 1 }}>
          {isCopyMode && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <ContentCopyIcon />
                <Typography variant="body2">
                  You are copying Stock Return "{initialData?.psrCode}". A new return code will be generated automatically.
                  {initialData?.details && initialData.details.length > 0 && <span> {initialData.details.length} product(s) will be copied to the new return.</span>}
                </Typography>
              </Box>
            </Alert>
          )}

          {state.isLoadingData && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body2">Loading Stock Return data...</Typography>
              </Box>
            </Alert>
          )}

          {state.formError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setState((prev) => ({ ...prev, formError: null }))}>
              {state.formError}
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
                          {state.isGeneratingCode ? (
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
                    <MenuItem value={ReturnType.Supplier}>Supplier Return</MenuItem>
                    <MenuItem value={ReturnType.Internal}>Internal Transfer</MenuItem>
                    <MenuItem value={ReturnType.Expired}>Expired Items</MenuItem>
                    <MenuItem value={ReturnType.Damaged}>Damaged Items</MenuItem>
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

              {returnTypeValue === ReturnType.Internal && (
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
              )}

              {returnTypeValue === ReturnType.Supplier && (
                <Grid size={{ sm: 12, md: 2 }}>
                  <FormField
                    name="supplierID"
                    control={control}
                    label="Supplier"
                    type="select"
                    required
                    disabled={isViewMode}
                    size="small"
                    options={supplier || []}
                    fullWidth
                    onChange={(value) => {
                      const selectedSupplier = supplier?.find((s) => Number(s.value) === Number(value.value));
                      setValue("supplierName", selectedSupplier?.label || "");
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

          <StockReturnProductSection
            control={control}
            fields={fields}
            append={append}
            remove={remove}
            setValue={setValue}
            errors={errors}
            isViewMode={isViewMode}
            showAlert={showAlert}
          />

          <StockReturnBillingSection control={control} />
        </Box>
      </GenericDialog>

      <ConfirmationDialog
        open={state.showResetConfirmation}
        onClose={() => setState((prev) => ({ ...prev, showResetConfirmation: false }))}
        onConfirm={() => {
          performReset();
          setState((prev) => ({ ...prev, showResetConfirmation: false }));
        }}
        title="Reset Form"
        message="Are you sure you want to reset the form? All unsaved changes will be lost."
        confirmText="Reset"
        cancelText="Cancel"
        type="warning"
        maxWidth="sm"
      />

      <ConfirmationDialog
        open={state.showCancelConfirmation}
        onClose={() => setState((prev) => ({ ...prev, showCancelConfirmation: false }))}
        onConfirm={() => {
          setState((prev) => ({ ...prev, showCancelConfirmation: false }));
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

export default ProductStockReturnForm;
