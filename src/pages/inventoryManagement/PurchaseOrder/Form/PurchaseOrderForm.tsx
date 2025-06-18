import { zodResolver } from "@hookform/resolvers/zod";
import { Cancel as CancelIcon, Business as DepartmentIcon, ShoppingCart as PurchaseIcon, Save as SaveIcon } from "@mui/icons-material";
import { Alert, Box, Chip, Grid, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import { ProductSearchResult } from "@/interfaces/InventoryManagement/Product/ProductSearch.interface";
import { PurchaseOrderDetailDto, PurchaseOrderMastDto, purchaseOrderSaveDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import { useAlert } from "@/providers/AlertProvider";
import { usePurchaseOrder } from "../hooks/usePurchaseOrder";
import PurchaseOrderFooter from "./PurchaseOrderFooter";
import PurchaseOrderGrid from "./PurchaseOrderGrid";
import PurchaseOrderHeader from "./PurchaseOrderHeader";

interface PurchaseOrderFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  initialData: PurchaseOrderMastDto | null;
  viewOnly?: boolean;
  selectedDepartment: { deptID: number; department: string };
  onChangeDepartment?: () => void;
}

// Form validation schema
const purchaseOrderFormSchema = z.object({
  pOID: z.number().default(0),
  pOCode: z.string().min(1, "Purchase order code is required"),
  pODate: z.string().min(1, "Date is required"),
  supplierID: z.number().min(1, "Supplier is required"),
  supplierName: z.string().min(1, "Supplier name is required"),
  conID: z.string().min(1, "Supplier is required"),
  fromDeptID: z.number().min(1, "Department is required"),
  fromDeptName: z.string().min(1, "Department name is required"),
  pOTypeValue: z.string().default("RVPO"),
  pOType: z.string().default("Revenue Purchase Order"),
  discAmt: z.number().default(0),
  taxAmt: z.number().default(0),
  totalAmt: z.number().default(0),
  netAmt: z.number().default(0),
  netCGSTTaxAmt: z.number().default(0),
  netSGSTTaxAmt: z.number().default(0),
  totalTaxableAmt: z.number().default(0),
  coinAdjAmt: z.number().default(0),
  rNotes: z.string().optional(),
  rActiveYN: z.string().default("Y"),
  transferYN: z.string().default("N"),
  pOApprovedYN: z.string().default("N"),
  pOApprovedID: z.number().optional(),
  pOApprovedBy: z.string().optional(),
  pOApprovedNo: z.string().optional(),
  pOSActionNo: z.string().optional(),
  pOStatusCode: z.string().default("PENDING"),
  pOStatus: z.string().default("Pending"),
  discountFooter: z
    .object({
      totDiscAmtPer: z.number().optional(),
      isDiscPercentage: z.boolean().default(false),
    })
    .optional(),
});

type PurchaseOrderFormData = z.infer<typeof purchaseOrderFormSchema>;

const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({ open, onClose, initialData, viewOnly = false, selectedDepartment, onChangeDepartment }) => {
  const { setLoading } = useLoading();
  const { showAlert } = useAlert();
  const { savePurchaseOrder, generatePurchaseOrderCode, getProductDetailsForPO, getPurchaseOrderById } = usePurchaseOrder();

  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [purchaseOrderDetails, setPurchaseOrderDetails] = useState<PurchaseOrderDetailDto[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductSearchResult | null>(null);
  const [disableApprovedFields, setDisableApprovedFields] = useState(false);

  const isAddMode = !initialData;

  // Form setup
  const defaultValues = useMemo(
    (): PurchaseOrderFormData => ({
      pOID: initialData?.pOID || 0,
      pOCode: initialData?.pOCode || "",
      pODate: initialData?.pODate ? new Date(initialData.pODate).toLocaleDateString("en-GB") : new Date().toLocaleDateString("en-GB"),
      supplierID: initialData?.supplierID || 0,
      supplierName: initialData?.supplierName || "",
      fromDeptID: selectedDepartment.deptID,
      fromDeptName: selectedDepartment.department,
      pOTypeValue: initialData?.pOTypeValue || "RVPO",
      pOType: initialData?.pOType || "Revenue Purchase Order",
      discAmt: initialData?.discAmt || 0,
      taxAmt: initialData?.taxAmt || 0,
      totalAmt: initialData?.totalAmt || 0,
      netAmt: initialData?.netAmt || 0,
      netCGSTTaxAmt: initialData?.netCGSTTaxAmt || 0,
      netSGSTTaxAmt: initialData?.netSGSTTaxAmt || 0,
      totalTaxableAmt: initialData?.totalTaxableAmt || 0,
      coinAdjAmt: initialData?.coinAdjAmt || 0,
      rNotes: initialData?.rNotes || "",
      rActiveYN: initialData?.rActiveYN || "Y",
      transferYN: initialData?.transferYN || "Y",
      pOApprovedYN: initialData?.pOApprovedYN || "N",
      pOApprovedID: initialData?.pOApprovedID,
      pOApprovedBy: initialData?.pOApprovedBy || "",
      pOApprovedNo: initialData?.pOApprovedNo || "",
      pOSActionNo: initialData?.pOSActionNo || "",
      pOStatusCode: initialData?.pOStatusCode || "PND",
      pOStatus: initialData?.pOStatus || "Pending",
      discountFooter: {
        totDiscAmtPer: 0,
        isDiscPercentage: false,
      },
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

  // Initialize form data
  useEffect(() => {
    const loadFormData = async () => {
      if (initialData && initialData.pOID > 0) {
        setLoading(true);
        try {
          const poData = await getPurchaseOrderById(initialData.pOID);
          if (poData) {
            reset({
              ...defaultValues,
              ...poData.purchaseOrderMastDto,
              pODate: new Date(poData.purchaseOrderMastDto.pODate).toLocaleDateString("en-GB"),
            });
            setPurchaseOrderDetails(poData.purchaseOrderDetailDto || []);

            // Check if approved and disable fields
            if (poData.purchaseOrderMastDto.pOApprovedYN === "Y") {
              setDisableApprovedFields(true);
            }
          }
        } catch (error) {
          showAlert("Error", "Failed to load purchase order details", "error");
        } finally {
          setLoading(false);
        }
      } else if (isAddMode) {
        // Generate PO code for new orders
        generatePOCode();
      }
    };

    loadFormData();
  }, [initialData, isAddMode]);

  // Generate PO code
  const generatePOCode = useCallback(async () => {
    if (!selectedDepartment.deptID) return;

    try {
      const code = await generatePurchaseOrderCode(selectedDepartment.deptID);
      if (code) {
        setValue("pOCode", code, { shouldValidate: true });
      }
    } catch (error) {
      showAlert("Warning", "Failed to generate PO code", "warning");
    }
  }, [selectedDepartment.deptID, generatePurchaseOrderCode, setValue, showAlert]);

  // Format date for API
  const formatDateForAPI = (dateString: string): string => {
    const [day, month, year] = dateString.split("/");
    return new Date(`${year}-${month}-${day}T00:00:00Z`).toISOString();
  };

  // Handle form submission
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

      const purchaseOrderData: purchaseOrderSaveDto = {
        purchaseOrderMastDto: {
          ...data,
          pODate: formatDateForAPI(data.pODate),
          pOStatusCode: data.pOApprovedYN === "Y" ? "CMP" : "PND",
          pOStatus: data.pOApprovedYN === "Y" ? "Completed" : "Pending",
          auGrpID: 18,
          catDesc: "REVENUE",
          catValue: "MEDI",
        } as PurchaseOrderMastDto,
        purchaseOrderDetailDto: purchaseOrderDetails
          .filter((d) => d.rActiveYN === "Y")
          .map((detail) => ({
            ...detail,
            pOID: data.pOID,
            pOYN: data.pOApprovedYN,
            pODetStatusCode: data.pOApprovedYN === "Y" ? "CMP" : "PND",
            taxOnUnitPrice: "Y",
            transferYN: "Y",
          })),
      };

      const response = await savePurchaseOrder(purchaseOrderData);

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

  // Handle product selection
  const handleProductSelect = useCallback((product: ProductSearchResult | null) => {
    setSelectedProduct(product);
  }, []);

  // Handle product details update
  const handleProductDetailsUpdate = useCallback((details: PurchaseOrderDetailDto[]) => {
    setPurchaseOrderDetails(details);
  }, []);

  // Reset form
  const performReset = useCallback(() => {
    reset(defaultValues);
    setPurchaseOrderDetails([]);
    setSelectedProduct(null);
    setFormError(null);
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

    if (status === "COMPLETED" || status === "CMP") {
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
        onClose={() => handleCancel()}
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
                  <FormField name="rActiveYN" control={control} label="Active" type="switch" disabled={viewOnly || disableApprovedFields} size="small" />
                </Box>
              </Box>
            </Grid>

            {/* Purchase Order Header */}
            <Grid size={{ xs: 12 }}>
              <PurchaseOrderHeader
                control={control}
                setValue={setValue}
                onProductSelect={handleProductSelect}
                selectedProduct={selectedProduct}
                approvedDisable={viewOnly || disableApprovedFields}
              />
            </Grid>

            {/* Purchase Order Grid */}
            <Grid size={{ xs: 12 }}>
              <PurchaseOrderGrid
                control={control}
                purchaseOrderDetails={purchaseOrderDetails}
                onDetailsUpdate={handleProductDetailsUpdate}
                selectedProduct={selectedProduct}
                approvedDisable={viewOnly || disableApprovedFields}
                setValue={setValue}
                pOID={watch("pOID")}
              />
            </Grid>

            {/* Purchase Order Footer */}
            <Grid size={{ xs: 12 }}>
              <PurchaseOrderFooter
                control={control}
                setValue={setValue}
                watch={watch}
                purchaseOrderDetails={purchaseOrderDetails}
                onDetailsUpdate={handleProductDetailsUpdate}
                approvedDisable={viewOnly || disableApprovedFields}
              />
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

export default PurchaseOrderForm;
