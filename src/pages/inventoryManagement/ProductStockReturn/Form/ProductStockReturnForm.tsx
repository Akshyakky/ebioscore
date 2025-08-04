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
  toDeptID: z.number().optional(),
  toDeptName: z.string().optional(),
  supplierID: z.number().optional(),
  supplierName: z.string().optional(),
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
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const { department } = useDropdownValues(["department"]);
  const { showAlert } = useAlert();
  const isAddMode = !initialData || copyMode;
  const isCopyMode = copyMode && !!initialData;
  const isEditMode = !!initialData && !copyMode && !viewOnly;
  const [isViewMode] = useState<boolean>(viewOnly);

  const supplier = [
    { value: 1, label: "Suplier1" },
    { value: 2, label: "Suplier2" },
  ];

  const defaultValues: ProductStockReturnFormData = useMemo(
    () => ({
      psrID: 0,
      psrDate: new Date(),
      returnTypeCode: ReturnType.Supplier,
      fromDeptID: selectedDepartmentId || 0,
      fromDeptName: selectedDepartmentName || "",
      toDeptID: 0,
      toDeptName: "",
      supplierID: 0,
      supplierName: "",
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
  } = useForm<ProductStockReturnFormData>({
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

  // Fixed: Improved detail mapping function with comprehensive field conversion
  const createDetailMappingWithAllFields = useCallback((detail: any, isCopyMode: boolean) => {
    console.log("Mapping detail:", detail, "isCopyMode:", isCopyMode);

    const mappedDetail = { ...detail };

    // Reset IDs for copy mode
    if (isCopyMode) {
      mappedDetail.psrdID = 0;
      mappedDetail.psrID = 0;
    }

    // Handle date conversions safely
    const safeParseDate = (dateValue: any): Date | undefined => {
      if (!dateValue) return undefined;
      try {
        if (dateValue instanceof Date) {
          return dateValue;
        }
        const parsedDate = new Date(dateValue);
        return isNaN(parsedDate.getTime()) ? undefined : parsedDate;
      } catch (error) {
        console.warn("Date parsing error:", error);
        return undefined;
      }
    };

    mappedDetail.expiryDate = safeParseDate(detail.expiryDate);
    mappedDetail.manufacturedDate = safeParseDate(detail.manufacturedDate);
    mappedDetail.grnDate = safeParseDate(detail.grnDate) || new Date();

    // Set numeric defaults with proper conversion
    const setNumericDefault = (key: string, defaultValue: number) => {
      const value = detail[key];
      mappedDetail[key] = value !== null && value !== undefined && !isNaN(Number(value)) ? Number(value) : defaultValue;
    };

    // Set string defaults with proper conversion
    const setStringDefault = (key: string, defaultValue: string) => {
      mappedDetail[key] = detail[key] !== null && detail[key] !== undefined ? String(detail[key]) : defaultValue;
    };

    // Apply numeric defaults
    setNumericDefault("psrdID", isCopyMode ? 0 : detail.psrdID || 0);
    setNumericDefault("psrID", isCopyMode ? 0 : detail.psrID || 0);
    setNumericDefault("productID", detail.productID || 0);
    setNumericDefault("quantity", detail.quantity || 0);
    setNumericDefault("unitPrice", detail.unitPrice || 0);
    setNumericDefault("totalAmount", detail.totalAmount || 0);
    setNumericDefault("availableQty", detail.availableQty || 0);
    setNumericDefault("tax", detail.tax || 0);
    setNumericDefault("psGrpID", detail.psGrpID || 0);
    setNumericDefault("pGrpID", detail.pGrpID || 0);
    setNumericDefault("manufacturerID", detail.manufacturerID || 0);
    setNumericDefault("taxID", detail.taxID || 0);
    setNumericDefault("mrp", detail.mrp || 0);
    setNumericDefault("psdID", detail.psdID || 0);
    setNumericDefault("freeRetQty", detail.freeRetQty || 0);
    setNumericDefault("freeRetUnitQty", detail.freeRetUnitQty || 0);
    setNumericDefault("pUnitID", detail.pUnitID || 0);
    setNumericDefault("pUnitsPerPack", detail.pUnitsPerPack || 1);
    setNumericDefault("pkgID", detail.pkgID || 0);
    setNumericDefault("psbid", detail.psbid || 0);
    setNumericDefault("sellUnitPrice", detail.sellUnitPrice || 0);
    setNumericDefault("mfID", detail.mfID || 0);
    setNumericDefault("cgst", detail.cgst || (detail.tax || 0) / 2);
    setNumericDefault("sgst", detail.sgst || (detail.tax || 0) / 2);
    setNumericDefault("batchID", detail.batchID || 0);
    setNumericDefault("recvdQty", detail.recvdQty || 0);
    setNumericDefault("supplierID", detail.supplierID || detail.supplrID || 0);
    setNumericDefault("supplrID", detail.supplrID || 0);
    setNumericDefault("freeItems", detail.freeItems || 0);

    // Apply string defaults
    setStringDefault("productCode", detail.productCode || "");
    setStringDefault("productName", detail.productName || "");
    setStringDefault("batchNo", detail.batchNo || "");
    setStringDefault("prescriptionYN", detail.prescriptionYN || "N");
    setStringDefault("expiryYN", detail.expiryYN || "N");
    setStringDefault("sellableYN", detail.sellableYN || "N");
    setStringDefault("taxableYN", detail.taxableYN || "N");
    setStringDefault("psGrpName", detail.psGrpName || "");
    setStringDefault("pGrpName", detail.pGrpName || "");
    setStringDefault("manufacturerCode", detail.manufacturerCode || "");
    setStringDefault("manufacturerName", detail.manufacturerName || "");
    setStringDefault("taxCode", detail.taxCode || "");
    setStringDefault("taxName", detail.taxName || "");
    setStringDefault("hsnCode", detail.hsnCode || "");
    setStringDefault("pUnitName", detail.pUnitName || "");
    setStringDefault("pkgName", detail.pkgName || "");
    setStringDefault("returnReason", detail.returnReason || "");
    setStringDefault("rActiveYN", detail.rActiveYN || "Y");
    setStringDefault("mfName", detail.mfName || "");
    setStringDefault("grnCode", detail.grnCode || "");
    setStringDefault("supplierName", detail.supplierName || detail.supplrName || "");
    setStringDefault("invoiceNo", detail.invoiceNo || "");
    setStringDefault("invDate", detail.invDate || "");
    setStringDefault("supplrName", detail.supplrName || "");
    setStringDefault("dcNo", detail.dcNo || "");
    setStringDefault("poNo", detail.poNo || "");
    setStringDefault("grnType", detail.grnType || "");
    setStringDefault("grnStatus", detail.grnStatus || "");
    setStringDefault("grnApprovedYN", detail.grnApprovedYN || "");

    console.log("Mapped detail result:", mappedDetail);
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
      setIsGeneratingCode(false);
    }
  };

  // Fixed: Completely rewritten loadReturnDetails function with better error handling and data processing
  const loadReturnDetails = useCallback(async () => {
    if (!initialData) {
      console.log("No initial data provided");
      return;
    }

    try {
      setIsLoadingData(true);
      setLoading(true);
      console.log("Loading return details for:", initialData);

      let returnData: ProductStockReturnDto;
      let detailsData: any[] = [];

      // Check if we already have details in initialData
      if (initialData.details && Array.isArray(initialData.details) && initialData.details.length > 0) {
        console.log("Using existing details from initialData:", initialData.details.length, "items");
        returnData = initialData;
        detailsData = initialData.details;
      } else {
        // Fetch fresh data from API
        console.log("Fetching fresh data from API for ID:", initialData.psrID);
        const fetchedComposite = await getReturnWithDetailsById(initialData.psrID);

        if (!fetchedComposite || !fetchedComposite.productStockReturn) {
          throw new Error("Failed to fetch Product Stock Return details from API");
        }

        console.log("Fetched composite data:", fetchedComposite);
        returnData = fetchedComposite.productStockReturn;
        detailsData = fetchedComposite.productStockReturnDetails || [];
      }

      // Build form data with proper field mapping
      const formData: ProductStockReturnFormData = {
        psrID: isCopyMode ? 0 : returnData.psrID || 0,
        psrDate: returnData.psrDate ? new Date(returnData.psrDate) : new Date(),
        returnTypeCode: returnData.returnTypeCode || ReturnType.Supplier,
        fromDeptID: returnData.fromDeptID || selectedDepartmentId || 0,
        fromDeptName: returnData.fromDeptName || selectedDepartmentName || "",
        toDeptID: isCopyMode ? 0 : returnData.toDeptID || 0,
        toDeptName: isCopyMode ? "" : returnData.toDeptName || "",
        supplierID: isCopyMode ? 0 : returnData.supplierID || 0,
        supplierName: isCopyMode ? "" : returnData.supplierName || "",
        auGrpID: returnData.auGrpID || 18,
        catDesc: returnData.catDesc || "REVENUE",
        catValue: returnData.catValue || "MEDI",
        psrCode: isCopyMode ? "" : returnData.psrCode || "",
        approvedYN: isCopyMode ? "N" : returnData.approvedYN || "N",
        approvedID: isCopyMode ? 0 : returnData.approvedID || 0,
        approvedBy: isCopyMode ? "" : returnData.approvedBy || "",
        rActiveYN: returnData.rActiveYN || "Y",
        productStockReturnDetails: detailsData.map((detail) => createDetailMappingWithAllFields(detail, isCopyMode)),
      };

      console.log("Final form data to reset:", formData);
      console.log("Details count:", formData.productStockReturnDetails.length);

      // Reset form with the prepared data
      reset(formData);
      setIsDataLoaded(true);

      // Generate return code for copy mode
      if (isCopyMode && formData.fromDeptID) {
        setTimeout(() => generateReturnCodeAsync(), 500);
      }

      const actionText = isViewMode ? "viewing" : isCopyMode ? "copying" : "editing";
      showAlert("Success", `Stock Return data loaded successfully for ${actionText} (${formData.productStockReturnDetails.length} products)`, "success");
    } catch (error) {
      console.error("Error loading return details:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load Stock Return details";
      showAlert("Error", errorMessage, "error");
      setFormError(errorMessage);
    } finally {
      setIsLoadingData(false);
      setLoading(false);
    }
  }, [initialData, isCopyMode, isViewMode, getReturnWithDetailsById, reset, setLoading, showAlert, createDetailMappingWithAllFields, selectedDepartmentId, selectedDepartmentName]);

  // Fixed: Improved useEffect for data loading with better dependency management
  useEffect(() => {
    console.log("Data loading useEffect triggered", {
      open,
      isDataLoaded,
      initialData: !!initialData,
      isAddMode,
      isCopyMode,
      isEditMode,
      isViewMode,
    });

    if (!open) {
      console.log("Dialog not open, skipping data load");
      return;
    }

    if (isDataLoaded) {
      console.log("Data already loaded, skipping");
      return;
    }

    if (initialData && (isCopyMode || isEditMode || isViewMode)) {
      console.log("Loading data for existing return");
      loadReturnDetails();
    } else if (isAddMode && !initialData) {
      console.log("Setting up form for new return");
      reset(defaultValues);
      setIsDataLoaded(true);
    }
  }, [open, initialData?.psrID, isAddMode, isCopyMode, isEditMode, isViewMode, isDataLoaded, loadReturnDetails, reset, defaultValues]);

  // Set department data for add mode
  useEffect(() => {
    if (isAddMode && selectedDepartmentId && selectedDepartmentName && !initialData && isDataLoaded) {
      console.log("Setting department data for add mode:", selectedDepartmentId, selectedDepartmentName);
      setValue("fromDeptID", selectedDepartmentId, { shouldValidate: true, shouldDirty: false });
      setValue("fromDeptName", selectedDepartmentName, { shouldValidate: true, shouldDirty: false });
    }
  }, [isAddMode, selectedDepartmentId, selectedDepartmentName, setValue, initialData, isDataLoaded]);

  // Reset data loaded flag when dialog closes
  useEffect(() => {
    if (!open) {
      console.log("Dialog closed, resetting data loaded flag");
      setIsDataLoaded(false);
      setFormError(null);
      setIsLoadingData(false);
    }
  }, [open]);

  // Generate return code and handle return type changes
  useEffect(() => {
    const deptId = getValues("fromDeptID") || selectedDepartmentId;
    if (deptId && isAddMode && !isCopyMode && isDataLoaded) {
      generateReturnCodeAsync();
    }
  }, [getValues("fromDeptID"), selectedDepartmentId, isAddMode, isCopyMode, isDataLoaded, getValues("returnTypeCode")]);

  useEffect(() => {
    if (isDataLoaded && (isAddMode || isCopyMode)) {
      generateReturnCodeAsync();
      const currentReturnType = getValues("returnTypeCode");
      if (currentReturnType !== ReturnType.Internal) {
        setValue("toDeptID", 0, { shouldValidate: true });
        setValue("toDeptName", "", { shouldValidate: true });
      }

      if (currentReturnType !== ReturnType.Supplier) {
        setValue("supplierID", 0, { shouldValidate: true });
        setValue("supplierName", "", { shouldValidate: true });
      }
    }
  }, [returnTypeValue]);

  const handleReturnTypeChange = (value: string) => {
    setValue("returnTypeCode", value, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = async (data: ProductStockReturnFormData) => {
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
      if (data.returnTypeCode === ReturnType.Internal && (!data.toDeptID || data.toDeptID === 0)) {
        showAlert("Warning", "To department is required for Internal Returns. Please select a destination department.", "warning");
        return;
      }

      if ((data.returnTypeCode === ReturnType.Supplier || data.returnTypeCode === ReturnType.Physician) && (!data.supplierID || data.supplierID === 0)) {
        const entityType = data.returnTypeCode === ReturnType.Physician ? "Physician" : "Supplier";
        showAlert("Warning", `${entityType} is required for ${entityType} Returns. Please select a ${entityType.toLowerCase()}.`, "warning");
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
          dtID: 0,
          dtCode: "",
          dtName: "",
          returnTypeCode: data.returnTypeCode,
          returnType: getReturnTypeName(data.returnTypeCode),
          fromDeptID: data.fromDeptID,
          fromDeptName: fromDept?.label || data.fromDeptName,
          toDeptID: data.toDeptID || undefined,
          toDeptName: toDept?.label || data.toDeptName,
          supplierID: data.supplierID || undefined,
          supplierName: selectedSupplier?.label || data.supplierName,
          auGrpID: data.auGrpID || 18,
          catDesc: data.catDesc || "REVENUE",
          catValue: data.catValue || "MEDI",
          psrCode: data.psrCode || "",
          approvedYN: data.approvedYN || "N",
          approvedID: data.approvedID || 0,
          approvedBy: data.approvedBy || "",
          rActiveYN: data.rActiveYN || "Y",
        } as ProductStockReturnDto,
        productStockReturnDetails: data.productStockReturnDetails.map((detail) => ({
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
          psdID: detail.psrdID || 0,
          psGrpID: 0,
          pGrpID: 0,
          taxID: 0,
          mrp: 0,
          manufacturerID: 0,
          psbid: 0,
          freeRetQty: 0,
          freeRetUnitQty: 0,
          rActiveYN: detail.rActiveYN || "Y",
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
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setIsSaving(false);
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
      case ReturnType.Physician:
        return "Physician Return";
      default:
        return returnTypeCode || "Unknown";
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
                  You are copying Stock Return "{initialData?.psrCode}". A new return code will be generated automatically.
                  {initialData?.details && initialData.details.length > 0 && <span> {initialData.details.length} product(s) will be copied to the new return.</span>}
                </Typography>
              </Box>
            </Alert>
          )}

          {isLoadingData && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body2">Loading Stock Return data...</Typography>
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

export default ProductStockReturnForm;
