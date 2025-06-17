// src/pages/inventoryManagement/PurchaseOrder/Form/PurchaseOrderForm.tsx

import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import useContactMastByCategory from "@/hooks/hospitalAdministration/useContactMastByCategory";
import { ProductSearchResult } from "@/interfaces/InventoryManagement/Product/ProductSearch.interface";
import { PurchaseOrderDetailDto, PurchaseOrderMastDto, purchaseOrderSaveDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import { useAlert } from "@/providers/AlertProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Add as AddIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Business as DepartmentIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
  ShoppingCart as PurchaseIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Today as TodayIcon,
} from "@mui/icons-material";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { DataGrid, GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { ProductSearch, ProductSearchRef } from "../../CommonPage/Product/ProductSearchForm";
import { usePurchaseOrder } from "../hooks/usePurchaseOrder";

interface PurchaseOrderFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  initialData: PurchaseOrderMastDto | null;
  viewOnly?: boolean;
  selectedDepartment: { deptID: number; department: string };
  onChangeDepartment?: () => void;
}

// Validation schema
const purchaseOrderFormSchema = z.object({
  // Master data
  pOID: z.number().default(0),
  pOCode: z.string().min(1, "Purchase order code is required"),
  pODate: z.date().default(() => new Date()),
  supplierID: z.number().min(1, "Supplier is required"),
  supplierName: z.string().min(1, "Supplier name is required"),
  fromDeptID: z.number().min(1, "From department is required"),
  fromDeptName: z.string().min(1, "From department name is required"),
  pOTypeValue: z.string().default("RVPO"),
  pOType: z.string().default("Revenue Purchase Order"),
  discAmt: z.number().default(0),
  taxAmt: z.number().default(0),
  totalAmt: z.number().default(0),
  netAmt: z.number().default(0),
  netCGSTTaxAmt: z.number().default(0),
  netSGSTTaxAmt: z.number().default(0),
  totalTaxableAmt: z.number().default(0),
  rNotes: z.string().optional(),
  rActiveYN: z.string().default("Y"),
  transferYN: z.string().default("N"),
  pOApprovedYN: z.string().default("N"),
  pOStatusCode: z.string().default("PENDING"),
  pOStatus: z.string().default("Pending"),
});

type PurchaseOrderFormData = z.infer<typeof purchaseOrderFormSchema>;

interface PurchaseOrderDetailRow extends PurchaseOrderDetailDto {
  isNew?: boolean;
  tempId?: string;
  id?: string | number;
}

const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({ open, onClose, initialData, viewOnly = false, selectedDepartment, onChangeDepartment }) => {
  const { setLoading } = useLoading();
  const { showAlert } = useAlert();
  const { savePurchaseOrder, generatePurchaseOrderCode, getProductDetailsForPO } = usePurchaseOrder();

  // State management
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [hasGeneratedCode, setHasGeneratedCode] = useState(false);

  // Product selection state
  const [selectedProduct, setSelectedProduct] = useState<ProductSearchResult | null>(null);
  const [purchaseOrderDetails, setPurchaseOrderDetails] = useState<PurchaseOrderDetailRow[]>([]);
  const [loadingProduct, setLoadingProduct] = useState(false);

  // Product search ref
  const productSearchRef = useRef<ProductSearchRef>(null);

  // Load dropdown values
  const { contacts: suppliers } = useContactMastByCategory({ consValue: "SUPP" });
  const isAddMode = !initialData;

  // Form setup
  const defaultValues: PurchaseOrderFormData = useMemo(
    () => ({
      pOID: initialData?.pOID || 0,
      pOCode: initialData?.pOCode || "",
      pODate: initialData?.pODate ? new Date(initialData.pODate) : new Date(),
      supplierID: initialData?.supplierID || 0,
      supplierName: initialData?.supplierName || "",
      fromDeptID: selectedDepartment.deptID,
      fromDeptName: selectedDepartment.department,
      pOTypeValue: initialData?.pOTypeValue || "REGULAR",
      pOType: initialData?.pOType || "Regular",
      discAmt: initialData?.discAmt || 0,
      taxAmt: initialData?.taxAmt || 0,
      totalAmt: initialData?.totalAmt || 0,
      netAmt: initialData?.netAmt || 0,
      netCGSTTaxAmt: initialData?.netCGSTTaxAmt || 0,
      netSGSTTaxAmt: initialData?.netSGSTTaxAmt || 0,
      totalTaxableAmt: initialData?.totalTaxableAmt || 0,
      rNotes: initialData?.rNotes || "",
      rActiveYN: initialData?.rActiveYN || "Y",
      transferYN: initialData?.transferYN || "N",
      pOApprovedYN: initialData?.pOApprovedYN || "N",
      pOStatusCode: initialData?.pOStatusCode || "PENDING",
      pOStatus: initialData?.pOStatus || "Pending",
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
  } = useForm<PurchaseOrderFormData>({
    defaultValues,
    resolver: zodResolver(purchaseOrderFormSchema),
    mode: "onChange",
  });

  // Watch form values
  const watchedSupplierID = useWatch({ control, name: "supplierID" });

  // Generate purchase order code
  const generatePOCode = useCallback(async () => {
    if (!isAddMode || !selectedDepartment.deptID) return;

    try {
      setIsGeneratingCode(true);
      const code = await generatePurchaseOrderCode(selectedDepartment.deptID);
      if (code) {
        setValue("pOCode", code, { shouldValidate: true, shouldDirty: true });
      }
    } catch (error) {
      console.error("Error generating purchase order code:", error);
      showAlert("Warning", "Failed to generate purchase order code. Please enter manually.", "warning");
    } finally {
      setIsGeneratingCode(false);
    }
  }, [isAddMode, selectedDepartment.deptID, generatePurchaseOrderCode, setValue, showAlert]);

  // Initialize form
  useEffect(() => {
    if (initialData) {
      reset(defaultValues);
      setHasGeneratedCode(true);
      // Load existing details if editing
      // This would typically come from a service call
    } else {
      reset(defaultValues);
      setHasGeneratedCode(false);
    }
  }, [initialData, reset, defaultValues]);

  // Generate code only once for new forms
  useEffect(() => {
    if (isAddMode && selectedDepartment.deptID && !hasGeneratedCode) {
      generatePOCode().then(() => {
        setHasGeneratedCode(true);
      });
    }
  }, [isAddMode, selectedDepartment.deptID, hasGeneratedCode, generatePOCode]);

  // Handle product selection
  const handleProductSelect = useCallback(
    async (product: ProductSearchResult | null) => {
      if (!product) {
        setSelectedProduct(null);
        return;
      }

      setLoadingProduct(true);
      try {
        // Get product details for PO
        const productDetails = await getProductDetailsForPO(product.productCode || "");
        if (productDetails) {
          setSelectedProduct(product);
        } else {
          showAlert("Error", "Failed to get product details", "error");
        }
      } catch (error) {
        showAlert("Error", "Failed to get product details", "error");
      } finally {
        setLoadingProduct(false);
      }
    },
    [getProductDetailsForPO, showAlert]
  );

  // Add product to purchase order details
  const handleAddProduct = useCallback(() => {
    if (!selectedProduct) {
      showAlert("Warning", "Please select a product", "warning");
      return;
    }

    // Check if product already exists
    const existingProduct = purchaseOrderDetails.find((detail) => detail.productID === selectedProduct.productID);
    if (existingProduct) {
      showAlert("Warning", "This product is already added to the purchase order", "warning");
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const newDetail: PurchaseOrderDetailRow = {
      pODetID: 0,
      pOID: 0,
      indentID: 0,
      indentDetID: 0,
      productID: selectedProduct.productID,
      productCode: selectedProduct.productCode || "",
      productName: selectedProduct.productName || "",
      catValue: selectedProduct.catValue || "",
      pGrpID: selectedProduct.pGrpID || 0,
      pSGrpID: selectedProduct.psGrpID || 0,
      pUnitID: selectedProduct.pUnitID || 0,
      pUnitName: selectedProduct.pUnitName || "",
      pPkgID: selectedProduct.pPackageID,
      unitPack: selectedProduct.unitPack,
      requiredUnitQty: 1,
      pOYN: "Y",
      grnDetID: 0,
      receivedQty: 0,
      manufacturerID: selectedProduct.manufacturerID,
      manufacturerCode: selectedProduct.manufacturerCode,
      manufacturerName: selectedProduct.manufacturerName,
      discAmt: 0,
      discPercentageAmt: 0,
      freeQty: 0,
      isFreeItemYN: "N",
      mfID: selectedProduct.mFID,
      mrpAbdated: 0,
      netAmount: 0,
      pODetStatusCode: "PENDING",
      profitOnMrp: 0,
      taxAfterDiscOnMrp: "N",
      taxAfterDiscYN: "N",
      taxAmtOnMrp: 0,
      taxAmt: 0,
      taxModeCode: "",
      taxModeDescription: "",
      taxModeID: 0,
      taxOnFreeItemYN: "N",
      taxOnMrpYN: "N",
      taxOnUnitPrice: "N",
      totAmt: 0,
      catDesc: selectedProduct.catDescription,
      mfName: selectedProduct.MFName,
      pGrpName: selectedProduct.productGroupName,
      pPkgName: selectedProduct.productPackageName,
      pSGrpName: selectedProduct.psGroupName,
      hsnCode: selectedProduct.hsnCODE || "",
      cgstPerValue: selectedProduct.cgstPerValue,
      cgstTaxAmt: 0,
      sgstPerValue: selectedProduct.sgstPerValue,
      sgstTaxAmt: 0,
      taxableAmt: 0,
      unitPrice: selectedProduct.defaultPrice || 0,
      transferYN: "N",
      rNotes: "",
      gstPerValue: selectedProduct.gstPerValue,
      isNew: true,
      tempId: tempId,
      id: tempId,
    };

    setPurchaseOrderDetails((prev) => [...prev, newDetail]);
    calculateTotals([...purchaseOrderDetails, newDetail]);

    // Clear selections
    setSelectedProduct(null);
    productSearchRef.current?.clearSelection();
  }, [selectedProduct, purchaseOrderDetails, showAlert]);

  // Remove product from purchase order details
  const handleRemoveProduct = useCallback((id: string | number) => {
    setPurchaseOrderDetails((prev) => {
      const updated = prev.filter((detail) => detail.id !== id);
      calculateTotals(updated);
      return updated;
    });
  }, []);

  // Handle quantity change
  const handleQuantityChange = useCallback(
    (id: string | number, field: keyof PurchaseOrderDetailRow, value: any) => {
      setPurchaseOrderDetails((prev) => {
        const updated = prev.map((item) => {
          if (item.id === id) {
            const updatedItem = { ...item, [field]: value };

            // Recalculate amounts based on quantity and unit price
            if (field === "requiredUnitQty" || field === "unitPrice") {
              const qty = field === "requiredUnitQty" ? value : item.requiredUnitQty || 0;
              const price = field === "unitPrice" ? value : item.unitPrice || 0;
              const taxableAmt = qty * price;
              const cgstAmt = (taxableAmt * (item.cgstPerValue || 0)) / 100;
              const sgstAmt = (taxableAmt * (item.sgstPerValue || 0)) / 100;
              const taxAmt = cgstAmt + sgstAmt;
              const totAmt = taxableAmt + taxAmt - (item.discAmt || 0);

              updatedItem.taxableAmt = taxableAmt;
              updatedItem.cgstTaxAmt = cgstAmt;
              updatedItem.sgstTaxAmt = sgstAmt;
              updatedItem.taxAmt = taxAmt;
              updatedItem.netAmount = totAmt;
              updatedItem.totAmt = totAmt;
            }

            return updatedItem;
          }
          return item;
        });

        calculateTotals(updated);
        return updated;
      });
    },
    [showAlert]
  );

  // Calculate totals
  const calculateTotals = useCallback(
    (details: PurchaseOrderDetailRow[]) => {
      const totalTaxableAmt = details.reduce((sum, item) => sum + (item.taxableAmt || 0), 0);
      const totalCGST = details.reduce((sum, item) => sum + (item.cgstTaxAmt || 0), 0);
      const totalSGST = details.reduce((sum, item) => sum + (item.sgstTaxAmt || 0), 0);
      const totalTaxAmt = totalCGST + totalSGST;
      const totalDiscAmt = details.reduce((sum, item) => sum + (item.discAmt || 0), 0);
      const totalAmt = details.reduce((sum, item) => sum + (item.totAmt || 0), 0);

      setValue("totalTaxableAmt", totalTaxableAmt);
      setValue("netCGSTTaxAmt", totalCGST);
      setValue("netSGSTTaxAmt", totalSGST);
      setValue("taxAmt", totalTaxAmt);
      setValue("discAmt", totalDiscAmt);
      setValue("totalAmt", totalAmt);
      setValue("netAmt", totalAmt);
    },
    [setValue]
  );

  // Form submission
  const onSubmit = async (data: PurchaseOrderFormData) => {
    if (viewOnly) return;

    if (purchaseOrderDetails.length === 0) {
      showAlert("Warning", "Please add at least one product to the purchase order", "warning");
      return;
    }

    setFormError(null);

    try {
      setIsSaving(true);
      setLoading(true);

      const purchaseOrderMaster: PurchaseOrderMastDto = {
        ...data,
        pOID: data.pOID,
        pOCode: data.pOCode,
        pODate: data.pODate.toISOString(),
        supplierID: data.supplierID,
        supplierName: data.supplierName,
        fromDeptID: data.fromDeptID,
        fromDeptName: data.fromDeptName,
        pOTypeValue: data.pOTypeValue,
        pOType: data.pOType,
        discAmt: data.discAmt,
        taxAmt: data.taxAmt,
        totalAmt: data.totalAmt,
        netAmt: data.netAmt,
        netCGSTTaxAmt: data.netCGSTTaxAmt,
        netSGSTTaxAmt: data.netSGSTTaxAmt,
        totalTaxableAmt: data.totalTaxableAmt,
        rActiveYN: data.rActiveYN as "Y" | "N",
        transferYN: data.transferYN as "Y" | "N",
        pOApprovedYN: data.pOApprovedYN as "Y" | "N",
        pOStatusCode: data.pOStatusCode,
        pOStatus: data.pOStatus,
        rNotes: data.rNotes,
      };

      const purchaseOrderDetailsData: PurchaseOrderDetailDto[] = purchaseOrderDetails.map((detail) => ({
        ...detail,
        pOID: data.pOID,
        isNew: undefined,
        tempId: undefined,
        id: undefined,
      }));

      const saveRequest: purchaseOrderSaveDto = {
        purchaseOrderMastDto: purchaseOrderMaster,
        purchaseOrderDetailDto: purchaseOrderDetailsData,
      };

      const response = await savePurchaseOrder(saveRequest);

      if (response.success) {
        showAlert("Success", isAddMode ? "Purchase order created successfully" : "Purchase order updated successfully", "success");
        onClose(true);
      } else {
        throw new Error(response.errorMessage || "Failed to save purchase order");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save purchase order";
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
    setPurchaseOrderDetails([]);
    setSelectedProduct(null);
    setFormError(null);
    productSearchRef.current?.clearSelection();

    if (isAddMode) {
      generatePOCode();
    }
  }, [reset, defaultValues, isAddMode, generatePOCode]);

  const handleReset = useCallback(() => {
    if (isDirty || purchaseOrderDetails.length > 0) {
      setShowResetConfirmation(true);
    } else {
      performReset();
    }
  }, [isDirty, purchaseOrderDetails.length, performReset]);

  const handleCancel = useCallback(() => {
    if (isDirty || purchaseOrderDetails.length > 0) {
      setShowCancelConfirmation(true);
    } else {
      onClose();
    }
  }, [isDirty, purchaseOrderDetails.length, onClose]);

  // Define DataGrid columns for purchase order details
  const detailColumns: GridColDef[] = [
    {
      field: "productCode",
      headerName: "Product Code",
      width: 120,
      sortable: false,
    },
    {
      field: "productName",
      headerName: "Product Name",
      width: 200,
      sortable: false,
    },
    {
      field: "pUnitName",
      headerName: "Unit",
      width: 80,
      sortable: false,
    },
    {
      field: "requiredUnitQty",
      headerName: "Qty",
      width: 80,
      type: "number",
      editable: !viewOnly,
      sortable: false,
    },
    {
      field: "unitPrice",
      headerName: "Unit Price",
      width: 100,
      type: "number",
      editable: !viewOnly,
      sortable: false,
      valueFormatter: (params: any) => `₹${params.value?.toFixed(2) || "0.00"}`,
    },
    {
      field: "taxableAmt",
      headerName: "Taxable Amt",
      width: 110,
      type: "number",
      sortable: false,
      valueFormatter: (params: any) => `₹${params.value?.toFixed(2) || "0.00"}`,
    },
    {
      field: "cgstPerValue",
      headerName: "CGST %",
      width: 80,
      type: "number",
      sortable: false,
    },
    {
      field: "sgstPerValue",
      headerName: "SGST %",
      width: 80,
      type: "number",
      sortable: false,
    },
    {
      field: "taxAmt",
      headerName: "Tax Amt",
      width: 100,
      type: "number",
      sortable: false,
      valueFormatter: (params: any) => `₹${params.value?.toFixed(2) || "0.00"}`,
    },
    {
      field: "totAmt",
      headerName: "Total Amt",
      width: 110,
      type: "number",
      sortable: false,
      valueFormatter: (params: any) => `₹${params.value?.toFixed(2) || "0.00"}`,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 80,
      getActions: (params) => [
        <GridActionsCellItem
          icon={
            <Tooltip title="Remove Product">
              <DeleteIcon />
            </Tooltip>
          }
          label="Remove"
          onClick={() => handleRemoveProduct(params.id)}
          disabled={viewOnly}
          showInMenu={false}
        />,
      ],
    },
  ];

  // Filter columns based on viewOnly
  const visibleColumns = viewOnly ? detailColumns.filter((col) => col.field !== "actions") : detailColumns;

  // Dialog title
  const dialogTitle = useMemo(() => {
    if (viewOnly) return "View Purchase Order Details";
    if (isAddMode) return "Create New Purchase Order";
    return `Edit Purchase Order - ${initialData?.pOCode}`;
  }, [viewOnly, isAddMode, initialData]);

  // Get status chip
  const getStatusChip = () => {
    const status = watch("pOStatusCode");
    const approved = watch("pOApprovedYN");

    if (status === "COMPLETED") {
      return <Chip size="small" color="success" label="Completed" />;
    }
    if (approved === "Y") {
      return <Chip size="small" color="info" label="Approved" />;
    }
    if (status === "REJECTED") {
      return <Chip size="small" color="error" label="Rejected" />;
    }
    return <Chip size="small" color="warning" label="Pending" />;
  };

  // Dialog actions
  const dialogActions = useMemo(() => {
    if (viewOnly) {
      return <SmartButton text="Close" onClick={() => onClose()} variant="contained" color="primary" />;
    }

    return (
      <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
        <SmartButton text="Cancel" onClick={handleCancel} variant="outlined" color="inherit" disabled={isSaving} />
        <Box sx={{ display: "flex", gap: 1 }}>
          <SmartButton
            text="Reset"
            onClick={handleReset}
            variant="outlined"
            color="error"
            icon={CancelIcon}
            disabled={isSaving || (!isDirty && purchaseOrderDetails.length === 0)}
          />
          <SmartButton
            text={isAddMode ? "Create Order" : "Update Order"}
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            color="primary"
            icon={SaveIcon}
            asynchronous={true}
            showLoadingIndicator={true}
            loadingText={isAddMode ? "Creating..." : "Updating..."}
            successText={isAddMode ? "Created!" : "Updated!"}
            disabled={isSaving || !isValid || purchaseOrderDetails.length === 0}
          />
        </Box>
      </Box>
    );
  }, [viewOnly, handleCancel, handleReset, handleSubmit, onSubmit, onClose, isSaving, isDirty, isValid, purchaseOrderDetails.length, isAddMode]);

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
                  <PurchaseIcon sx={{ color: "#1976d2", fontSize: 32 }} />
                  <Typography variant="h6" fontWeight="bold" color="#1976d2">
                    Purchase Order
                  </Typography>
                  <Chip label={selectedDepartment.department} color="primary" variant="outlined" icon={<DepartmentIcon />} />
                  {!isAddMode && getStatusChip()}
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
                    <Grid size={{ xs: 12, md: 3 }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <FormField name="pOCode" control={control} label="PO Code" type="text" required disabled={viewOnly || !isAddMode} size="small" fullWidth />
                        {!viewOnly && isAddMode && (
                          <SmartButton
                            text="Generate"
                            onClick={generatePOCode}
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

                    <Grid size={{ xs: 12, md: 3 }}>
                      <FormField name="pODate" control={control} label="PO Date" type="datepicker" required disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ xs: 12, md: 3 }}>
                      <FormField
                        name="pOTypeValue"
                        control={control}
                        label="PO Type"
                        type="select"
                        required
                        disabled={viewOnly}
                        options={[{ value: "RVPO", label: "Revenue Purchase Order" }]}
                        size="small"
                        fullWidth
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 3 }}>
                      <FormField name="fromDeptName" control={control} label="Department" type="text" required disabled={true} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormField
                        name="supplierID"
                        control={control}
                        label="Supplier"
                        type="select"
                        required
                        disabled={viewOnly}
                        options={
                          suppliers?.map((supp) => ({
                            value: parseInt(supp.value.toString()),
                            label: supp.label,
                          })) || []
                        }
                        onChange={(value) => {
                          const selectedSupplier = suppliers?.find((supp) => parseInt(supp.value.toString()) === value);
                          if (selectedSupplier) {
                            setValue("supplierName", selectedSupplier.label);
                          }
                        }}
                        size="small"
                        fullWidth
                      />
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
                      <Grid size={{ xs: 12, md: 9 }}>
                        <ProductSearch
                          ref={productSearchRef}
                          onProductSelect={handleProductSelect}
                          label="Select Product"
                          disabled={viewOnly || loadingProduct}
                          className="product-search-field"
                        />
                      </Grid>

                      <Grid size={{ xs: 12, md: 3 }}>
                        <SmartButton
                          text="Add Product"
                          onClick={handleAddProduct}
                          variant="contained"
                          color="success"
                          icon={AddIcon}
                          disabled={!selectedProduct || loadingProduct}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Purchase Order Details DataGrid */}
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined" sx={{ borderLeft: "3px solid #ed6c02" }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" color="#ed6c02" fontWeight="bold">
                      Order Products ({purchaseOrderDetails.length})
                    </Typography>
                    {purchaseOrderDetails.length > 0 && (
                      <Box display="flex" gap={2}>
                        <Chip label={`Total Items: ${purchaseOrderDetails.reduce((sum, item) => sum + (item.requiredUnitQty || 0), 0)}`} color="warning" variant="outlined" />
                        <Chip label={`Total Amount: ₹${watch("totalAmt").toFixed(2)}`} color="success" variant="outlined" icon={<MoneyIcon />} />
                      </Box>
                    )}
                  </Box>
                  <Divider sx={{ mb: 2 }} />

                  {purchaseOrderDetails.length > 0 ? (
                    <Box sx={{ height: 400, width: "100%" }}>
                      <DataGrid
                        rows={purchaseOrderDetails}
                        columns={visibleColumns}
                        density="compact"
                        disableRowSelectionOnClick
                        hideFooterSelectedRowCount
                        pageSizeOptions={[5, 10, 25]}
                        initialState={{
                          pagination: {
                            paginationModel: { pageSize: 10 },
                          },
                        }}
                        processRowUpdate={(newRow, oldRow) => {
                          const changedField = Object.keys(newRow).find((key) => newRow[key] !== oldRow[key]);

                          if (changedField) {
                            handleQuantityChange(newRow.id, changedField as keyof PurchaseOrderDetailRow, newRow[changedField]);
                          }

                          return newRow;
                        }}
                        onProcessRowUpdateError={(error) => {
                          console.error("Row update error:", error);
                          showAlert("Error", "Failed to update value", "error");
                        }}
                        sx={{
                          "& .MuiDataGrid-row:hover": {
                            backgroundColor: "rgba(25, 118, 210, 0.04)",
                          },
                        }}
                      />
                    </Box>
                  ) : (
                    <Paper sx={{ p: 4, textAlign: "center", bgcolor: "grey.50" }}>
                      <PersonIcon sx={{ fontSize: 48, color: "grey.400", mb: 1 }} />
                      <Typography variant="h6" color="grey.600" gutterBottom>
                        No Products Added
                      </Typography>
                      <Typography variant="body2" color="grey.500">
                        {viewOnly ? "This purchase order doesn't have any products" : "Use the product search above to add products to this order"}
                      </Typography>
                    </Paper>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Summary Section */}
            {purchaseOrderDetails.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <Card variant="outlined" sx={{ borderLeft: "3px solid #9c27b0" }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="#9c27b0" fontWeight="bold">
                      <MoneyIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                      Order Summary
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 8 }}>
                        <FormField
                          name="rNotes"
                          control={control}
                          label="Notes"
                          type="textarea"
                          disabled={viewOnly}
                          size="small"
                          fullWidth
                          rows={4}
                          placeholder="Enter any additional notes or special instructions for this order"
                        />
                      </Grid>

                      <Grid size={{ xs: 12, md: 4 }}>
                        <Box display="flex" flexDirection="column" gap={1}>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2">Taxable Amount:</Typography>
                            <Typography variant="body2" fontWeight="bold">
                              ₹{watch("totalTaxableAmt").toFixed(2)}
                            </Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2">CGST:</Typography>
                            <Typography variant="body2">₹{watch("netCGSTTaxAmt").toFixed(2)}</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2">SGST:</Typography>
                            <Typography variant="body2">₹{watch("netSGSTTaxAmt").toFixed(2)}</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2">Total Tax:</Typography>
                            <Typography variant="body2">₹{watch("taxAmt").toFixed(2)}</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2">Discount:</Typography>
                            <Typography variant="body2">₹{watch("discAmt").toFixed(2)}</Typography>
                          </Box>
                          <Divider />
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="h6">Total Amount:</Typography>
                            <Typography variant="h6" color="primary" fontWeight="bold">
                              ₹{watch("totalAmt").toFixed(2)}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}
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

export default PurchaseOrderForm;
