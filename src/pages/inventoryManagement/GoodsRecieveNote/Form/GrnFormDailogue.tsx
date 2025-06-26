import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { GRNDetailDto, GRNHelpers, GRNWithAllDetailsDto } from "@/interfaces/InventoryManagement/GRNDto";
import { PurchaseOrderDetailDto, PurchaseOrderMastDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import { useAlert } from "@/providers/AlertProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle as ApproveIcon,
  Clear as ClearIcon,
  Business as DeptIcon,
  ExpandMore as ExpandMoreIcon,
  Receipt as InvoiceIcon,
  Save as SaveIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Chip, FormControlLabel, Grid, Stack, Switch, Typography } from "@mui/material";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import useGRN from "../hooks/useGrnhooks";
import GrnDetailsComponent from "./GrnDetailsComponent";
import GRNTotalsAndActionsSection from "./GRNTotalsAndActionsSection"; // <-- IMPORT THE NEW COMPONENT
import PurchaseOrderSection from "./purchaseOrderSection";

// --- Schema and Types ---
const grnSchema = z.object({
  grnID: z.number().default(0),
  grnCode: z.string().optional(),
  deptID: z.number().min(1, "Department is required"),
  deptName: z.string().min(1, "Department name is required"),
  supplrID: z.number().min(1, "Supplier is required"),
  supplrName: z.string().min(1, "Supplier name is required"),
  grnDate: z.union([z.date(), z.any()]).refine((date) => (date ? dayjs(date).isValid() : false), { message: "Valid GRN date is required" }),
  invoiceNo: z.string().min(1, "Invoice number is required"),
  invDate: z.union([z.date(), z.any()]).refine((date) => (date ? dayjs(date).isValid() : false), { message: "Valid invoice date is required" }),
  grnType: z.string().default("Invoice"),
  grnStatus: z.string().default("Pending"),
  grnStatusCode: z.string().default("PEND"),
  grnApprovedYN: z.string().default("N"),
  grnApprovedBy: z.string().optional(),
  grnApprovedID: z.number().optional(),
  hideYN: z.string().default("N"),
  poNo: z.string().optional(),
  poID: z.number().optional(),
  poDate: z.union([z.date(), z.any()]).optional().nullable(),
  poTotalAmt: z.number().optional().default(0),
  poDiscAmt: z.number().optional().default(0),
  poCoinAdjAmt: z.number().optional().default(0),
  dcNo: z.string().optional(),
  expectedDeliveryDate: z.union([z.date(), z.any()]).optional().nullable(),
  actualDeliveryDate: z.union([z.date(), z.any()]).optional().nullable(),
  tot: z.number().optional().default(0),
  disc: z.number().optional().default(0),
  discountType: z.enum(["AMOUNT", "PERCENTAGE"]).default("AMOUNT"),
  netTot: z.number().optional().default(0),
  taxAmt: z.number().optional().default(0),
  totalTaxableAmt: z.number().optional().default(0),
  netCGSTTaxAmt: z.number().optional().default(0),
  netSGSTTaxAmt: z.number().optional().default(0),
  balanceAmt: z.number().optional().default(0),
  otherAmt: z.number().optional().default(0),
  coinAdj: z.number().optional().default(0),
  roundingAdjustment: z.number().optional().default(0),
  transDeptID: z.number().optional(),
  transDeptName: z.string().optional(),
  issueDeptID: z.number().optional(),
  issueDeptName: z.string().optional(),
  catValue: z.string().default("MEDI"),
  catDesc: z.string().default("REVENUE"),
  auGrpID: z.number().default(18),
  discPercentageYN: z.string().default("N"),
  taxAfterDiscountYN: z.string().default("N"),
  qualityCheckYN: z.string().default("N"),
  qualityCheckBy: z.string().optional(),
  qualityCheckDate: z.union([z.date(), z.any()]).optional().nullable(),
  approvalDate: z.union([z.date(), z.any()]).optional().nullable(),
  grnDetails: z.array(z.any()).default([]),
  poGrnDetails: z.array(z.any()).default([]), // Separate array for PO-based GRN details
  rActiveYN: z.string().default("Y"),
  transferYN: z.string().default("N"),
  rNotes: z.string().optional().nullable(),
  poCode: z.string().optional(),
});

type GrnFormData = z.infer<typeof grnSchema>;

interface ComprehensiveGrnFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (grn: GRNWithAllDetailsDto) => Promise<void>;
  grn: GRNWithAllDetailsDto | null;
  departments: { value: string; label: string }[];
  suppliers: { value: string; label: string }[];
  products: { value: string; label: string }[];
}

const ComprehensiveGrnFormDialog: React.FC<ComprehensiveGrnFormDialogProps> = ({ open, onClose, onSubmit, grn, departments, suppliers, products }) => {
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [grnDetails, setGrnDetails] = useState<GRNDetailDto[]>([]); // For manually added products
  const [poGrnDetails, setPOGrnDetails] = useState<GRNDetailDto[]>([]); // For PO-based products
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    invoice: true,
    po: false,
    manual: true,
    financial: false, // Set to false since totals section replaces this
    configuration: false,
  });

  const isEditMode = !!grn && grn.grnID > 0;
  const isApproved = grn?.grnApprovedYN === "Y";
  const { generateGrnCode } = useGRN();
  const { showAlert } = useAlert();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    trigger,
    getValues,
    formState: { isSubmitting },
  } = useForm<GrnFormData>({
    resolver: zodResolver(grnSchema),
    mode: "onChange",
  });

  const watchedDeptID = watch("deptID");
  const watchedSupplierID = watch("supplrID");
  const watchedGrnCode = watch("grnCode");
  const watchedInvoiceNo = watch("invoiceNo");
  const watchedDiscount = watch("disc");
  const watchedDeptName = watch("deptName");

  const isMandatoryFieldsFilled = !!(watchedDeptID && watchedSupplierID && watchedGrnCode && watchedInvoiceNo);

  // Combine both arrays for total calculations
  const allGrnDetails = useMemo(() => [...poGrnDetails, ...grnDetails], [poGrnDetails, grnDetails]);

  useEffect(() => {
    if (open) {
      if (grn) {
        const formData: GrnFormData = {
          grnID: grn.grnID || 0,
          grnCode: grn.grnCode || "",
          deptID: grn.deptID || 0,
          deptName: grn.deptName || "",
          supplrID: grn.supplrID || 0,
          supplrName: grn.supplrName || "",
          grnDate: grn.grnDate ? new Date(grn.grnDate) : new Date(),
          invoiceNo: grn.invoiceNo || "",
          invDate: grn.invDate ? new Date(grn.invDate) : new Date(),
          grnType: grn.grnType || "Invoice",
          grnStatus: grn.grnStatus || "Pending",
          grnStatusCode: grn.grnStatusCode || "PEND",
          grnApprovedYN: grn.grnApprovedYN || "N",
          grnApprovedBy: grn.grnApprovedBy || "",
          grnApprovedID: grn.grnApprovedID || 0,
          hideYN: grn.hideYN || "N",
          poCode: grn.poNo || "",
          poNo: grn.poNo || "",
          poID: grn.poID || 0,
          poDate: grn.poDate ? new Date(grn.poDate) : null,
          poTotalAmt: grn.poTotalAmt || 0,
          poDiscAmt: grn.poDiscAmt || 0,
          poCoinAdjAmt: grn.poCoinAdjAmt || 0,
          dcNo: grn.dcNo || "",
          expectedDeliveryDate: grn.expectedDeliveryDate ? new Date(grn.expectedDeliveryDate) : null,
          actualDeliveryDate: grn.actualDeliveryDate ? new Date(grn.actualDeliveryDate) : null,
          tot: grn.tot || 0,
          disc: grn.disc || 0,
          discountType: (grn.discountType as "AMOUNT" | "PERCENTAGE") || "AMOUNT",
          netTot: grn.netTot || 0,
          taxAmt: grn.taxAmt || 0,
          totalTaxableAmt: grn.totalTaxableAmt || 0,
          netCGSTTaxAmt: grn.netCGSTTaxAmt || 0,
          netSGSTTaxAmt: grn.netSGSTTaxAmt || 0,
          balanceAmt: grn.balanceAmt || 0,
          otherAmt: grn.otherAmt || 0,
          coinAdj: grn.coinAdj || 0,
          roundingAdjustment: grn.roundingAdjustment || 0,
          transDeptID: grn.transDeptID || 0,
          transDeptName: grn.transDeptName || "",
          issueDeptID: grn.issueDeptID || 0,
          issueDeptName: grn.issueDeptName || "",
          catValue: grn.catValue || "MEDI",
          catDesc: grn.catDesc || "REVENUE",
          auGrpID: grn.auGrpID || 18,
          discPercentageYN: grn.discPercentageYN || "N",
          taxAfterDiscountYN: grn.taxAfterDiscountYN || "N",
          qualityCheckYN: grn.qualityCheckYN || "N",
          qualityCheckBy: grn.qualityCheckBy || "",
          qualityCheckDate: grn.qualityCheckDate ? new Date(grn.qualityCheckDate) : null,
          approvalDate: grn.approvalDate ? new Date(grn.approvalDate) : null,
          grnDetails: grn.grnDetails || [],
          poGrnDetails: [],
          rActiveYN: grn.rActiveYN || "Y",
          transferYN: grn.transferYN || "N",
          rNotes: grn.rNotes || "",
        };

        reset(formData);
        // Separate PO-based and manually added details
        const poBasedDetails = (grn.grnDetails || []).filter((detail) => detail.poDetID && detail.poDetID > 0);
        const manualDetails = (grn.grnDetails || []).filter((detail) => !detail.poDetID || detail.poDetID === 0);

        setPOGrnDetails(poBasedDetails);
        setGrnDetails(manualDetails);
      } else {
        reset();
        setGrnDetails([]);
        setPOGrnDetails([]);
      }
    }
  }, [open, grn, reset]);

  const handleGenerateCode = useCallback(async () => {
    if (!watchedDeptID) {
      showAlert("Warning", "Please select a department first", "warning");
      return;
    }
    try {
      setIsGeneratingCode(true);
      const newCode = await generateGrnCode(watchedDeptID);
      setValue("grnCode", newCode, { shouldValidate: true, shouldDirty: true });
      trigger();
    } catch (error) {
      showAlert("Error", "Failed to generate GRN code", "error");
    } finally {
      setIsGeneratingCode(false);
    }
  }, [watchedDeptID, generateGrnCode, setValue, trigger, showAlert]);

  useEffect(() => {
    if (!isEditMode && watchedDeptID && !watchedGrnCode) {
      handleGenerateCode();
    }
  }, [watchedDeptID, isEditMode, watchedGrnCode, handleGenerateCode]);

  const handleDepartmentChange = useCallback(
    (value: any) => {
      const selectedDept = departments.find((dept) => dept.value === value.toString());
      if (selectedDept) {
        setValue("deptID", Number(selectedDept.value), { shouldValidate: true, shouldDirty: true });
        setValue("deptName", selectedDept.label, { shouldValidate: true, shouldDirty: true });
        trigger();
      }
    },
    [departments, setValue, trigger]
  );

  const handleSupplierChange = useCallback(
    (newValue: any) => {
      let selectedSupplier = null;
      if (newValue && typeof newValue === "object" && newValue.value) {
        selectedSupplier = suppliers.find((s) => s.value == newValue.value);
      } else if (newValue) {
        selectedSupplier = suppliers.find((s) => s.value == newValue);
      }
      if (selectedSupplier) {
        setValue("supplrID", Number(selectedSupplier.value), { shouldValidate: true, shouldDirty: true });
        setValue("supplrName", selectedSupplier.label, { shouldValidate: true, shouldDirty: true });
      } else {
        setValue("supplrID", 0, { shouldValidate: true, shouldDirty: true });
        setValue("supplrName", "", { shouldValidate: true, shouldDirty: true });
      }
      trigger("supplrID");
    },
    [suppliers, setValue, trigger]
  );

  const calculateTotals = useCallback(
    (allDetails: GRNDetailDto[]) => {
      const itemsTotal = allDetails.reduce((sum, detail) => {
        const receivedPack = detail.recvdPack || 0;
        const packPrice = detail.packPrice || 0;
        return sum + receivedPack * packPrice;
      }, 0);
      setValue("tot", parseFloat(itemsTotal.toFixed(2)), { shouldDirty: true });
      const discountValue = watchedDiscount || 0;
      const otherCharges = getValues("otherAmt") || 0;
      const coinAdjustment = getValues("coinAdj") || 0;
      const totals = GRNHelpers.calculateGRNTotals(allDetails, discountValue, otherCharges, coinAdjustment);
      setValue("netTot", totals.netTotal);
      setValue("totalTaxableAmt", totals.totalTaxable);
      setValue("netCGSTTaxAmt", totals.totalCGST);
      setValue("netSGSTTaxAmt", totals.totalSGST);
      setValue("taxAmt", totals.totalTax);
      setValue("balanceAmt", totals.grandTotal);
      trigger();
    },
    [setValue, trigger, watchedDiscount, getValues]
  );

  const handleManualGrnDetailsChange = useCallback(
    (details: GRNDetailDto[]) => {
      setGrnDetails(details);
      calculateTotals([...poGrnDetails, ...details]);
    },
    [poGrnDetails, calculateTotals]
  );

  const handlePOGrnDetailsChange = useCallback(
    (details: GRNDetailDto[]) => {
      setPOGrnDetails(details);
      calculateTotals([...details, ...grnDetails]);
    },
    [grnDetails, calculateTotals]
  );

  const handlePoDataFetched = useCallback(
    (mast: PurchaseOrderMastDto | null, details: PurchaseOrderDetailDto[]) => {
      if (mast && details.length > 0) {
        showAlert("Success", `PO ${mast.pOCode} selected with ${details.length} items.`, "success");

        if (!watchedSupplierID && mast.supplierID) {
          handleSupplierChange(mast.supplierID);
        }
      } else if (mast) {
        showAlert("Info", `PO ${mast.pOCode} selected, but it has no item details.`, "info");
        setPOGrnDetails([]);
      } else {
        setPOGrnDetails([]);
        showAlert("Info", "PO selection cleared.", "info");
      }
    },
    [showAlert, watchedSupplierID, handleSupplierChange]
  );

  const handleDeleteAll = useCallback(() => {
    setGrnDetails([]);
    setPOGrnDetails([]);
    calculateTotals([]);
    showAlert("Success", "All products removed from GRN", "success");
  }, [calculateTotals, showAlert]);

  const handleShowHistory = useCallback(() => {
    showAlert("Info", "History functionality to be implemented", "info");
  }, [showAlert]);

  const handleNewIssueDepartment = useCallback(() => {
    showAlert("Info", "New Issue Department functionality to be implemented", "info");
  }, [showAlert]);

  const handleApplyDiscount = useCallback(() => {
    calculateTotals(allGrnDetails);
    showAlert("Success", "Discount applied and totals recalculated", "success");
  }, [allGrnDetails, calculateTotals, showAlert]);

  const onFormSubmit = async (data: GrnFormData) => {
    if (!allGrnDetails || allGrnDetails.length === 0) {
      showAlert("Validation Error", "Please add at least one product to the GRN", "warning");
      return;
    }

    const validationResult = GRNHelpers.validateCompleteGRN({ ...data, grnDetails: allGrnDetails });
    if (!validationResult.isValid) {
      showAlert("Validation Error", validationResult.errors.join(", "), "error");
      return;
    }

    const formattedData: GRNWithAllDetailsDto = {
      grnDetails: allGrnDetails, // Combine both arrays
      grnID: data.grnID,
      deptID: data.deptID,
      deptName: data.deptName,
      supplrID: data.supplrID,
      supplrName: data.supplrName,
      grnCode: data.grnCode || "",
      grnDate: data.grnDate,
      invoiceNo: data.invoiceNo,
      invDate: data.invDate,
      grnType: data.grnType,
      grnStatus: data.grnStatus,
      grnStatusCode: data.grnStatusCode,
      grnApprovedYN: data.grnApprovedYN,
      grnApprovedBy: data.grnApprovedBy,
      grnApprovedID: data.grnApprovedID,
      hideYN: data.hideYN,
      poNo: data.poNo,
      poID: data.poID,
      poDate: data.poDate,
      poTotalAmt: data.poTotalAmt,
      poDiscAmt: data.poDiscAmt,
      poCoinAdjAmt: data.poCoinAdjAmt,
      dcNo: data.dcNo,
      expectedDeliveryDate: data.expectedDeliveryDate,
      actualDeliveryDate: data.actualDeliveryDate,
      tot: data.tot,
      disc: data.disc,
      discountType: data.discountType,
      netTot: data.netTot,
      taxAmt: data.taxAmt,
      totalTaxableAmt: data.totalTaxableAmt,
      netCGSTTaxAmt: data.netCGSTTaxAmt,
      netSGSTTaxAmt: data.netSGSTTaxAmt,
      balanceAmt: data.balanceAmt,
      otherAmt: data.otherAmt,
      coinAdj: data.coinAdj,
      roundingAdjustment: data.roundingAdjustment,
      transDeptID: data.transDeptID,
      transDeptName: data.transDeptName,
      issueDeptID: data.issueDeptID,
      issueDeptName: data.issueDeptName,
      catValue: data.catValue,
      catDesc: data.catDesc,
      auGrpID: data.auGrpID,
      discPercentageYN: data.discPercentageYN,
      taxAfterDiscountYN: data.taxAfterDiscountYN,
      qualityCheckYN: data.qualityCheckYN,
      qualityCheckBy: data.qualityCheckBy,
      qualityCheckDate: data.qualityCheckDate,
      approvalDate: data.approvalDate,
      rActiveYN: data.rActiveYN,
      transferYN: data.transferYN,
      rNotes: data.rNotes,
      poCode: data.poCode,
    };

    await onSubmit(formattedData);
  };

  const handleClear = () => {
    reset();
    setGrnDetails([]);
    setPOGrnDetails([]);
  };

  const handleSectionToggle = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const dialogActions = (
    <>
      <CustomButton variant="outlined" text={isEditMode ? "Reset" : "Clear"} icon={ClearIcon} onClick={handleClear} disabled={isSubmitting || isApproved} color="inherit" />
      <CustomButton variant="outlined" text="Cancel" onClick={onClose} disabled={isSubmitting} />
      {isEditMode && !isApproved && (
        <FormControlLabel control={<Switch checked={getValues("hideYN") === "Y"} onChange={(e) => setValue("hideYN", e.target.checked ? "Y" : "N")} />} label="Hide" />
      )}
      <SmartButton
        variant="contained"
        text={isEditMode ? "Update GRN" : "Create GRN"}
        icon={SaveIcon}
        onAsyncClick={handleSubmit(onFormSubmit)}
        asynchronous
        disabled={isSubmitting || !isMandatoryFieldsFilled || isApproved}
        color="primary"
        loadingText={isEditMode ? "Updating..." : "Creating..."}
        successText={isEditMode ? "Updated!" : "Created!"}
      />
    </>
  );

  return (
    <GenericDialog
      open={open}
      onClose={onClose}
      title="Goods Receive Note (GRN)"
      maxWidth="xl"
      fullWidth
      disableBackdropClick={isSubmitting}
      disableEscapeKeyDown={isSubmitting}
      actions={dialogActions}
    >
      <Box sx={{ width: "100%" }}>
        <form onSubmit={handleSubmit(onFormSubmit)}>
          {isApproved && (
            <Alert severity="info" sx={{ mb: 2 }} icon={<ApproveIcon />}>
              This GRN has been approved and cannot be modified. Stock has been updated.
            </Alert>
          )}

          {/* Basic Information Section */}
          <Accordion expanded={expandedSections.basic} onChange={() => handleSectionToggle("basic")}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1}>
                <DeptIcon color="primary" />
                <Typography variant="h6" color="primary">
                  Basic GRN Information
                </Typography>
                <Chip label="Required" size="small" color="error" variant="outlined" />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <EnhancedFormField
                    name="grnCode"
                    control={control}
                    type="text"
                    label="GRN Code"
                    required
                    disabled={isEditMode || isApproved}
                    size="small"
                    helperText={isEditMode ? "Code cannot be changed" : isGeneratingCode ? "Generating..." : "Auto-generated"}
                    adornment={
                      !isEditMode &&
                      !isApproved && <CustomButton size="small" variant="outlined" text="Generate" onClick={handleGenerateCode} disabled={!watchedDeptID || isGeneratingCode} />
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <EnhancedFormField
                    name="deptID"
                    control={control}
                    type="select"
                    label="Department"
                    required
                    size="small"
                    options={departments}
                    onChange={handleDepartmentChange}
                    disabled={isEditMode || isApproved}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <EnhancedFormField
                    name="supplrID"
                    control={control}
                    type="select"
                    label="Supplier"
                    required
                    size="small"
                    options={suppliers}
                    onChange={handleSupplierChange}
                    disabled={isApproved}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <EnhancedFormField name="grnDate" control={control} type="datepicker" label="GRN Date" required size="small" disabled={isApproved} />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <EnhancedFormField
                    name="grnType"
                    control={control}
                    type="select"
                    label="GRN Type"
                    size="small"
                    disabled={isApproved}
                    options={[{ value: "Invoice", label: "Invoice" }]}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <EnhancedFormField name="dcNo" control={control} type="text" label="DC Number" size="small" disabled={isApproved} />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Invoice Information Section */}
          <Accordion expanded={expandedSections.invoice} onChange={() => handleSectionToggle("invoice")}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1}>
                <InvoiceIcon color="primary" />
                <Typography variant="h6" color="primary">
                  Invoice Information
                </Typography>
                <Chip label="Required" size="small" color="error" variant="outlined" />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <EnhancedFormField name="invoiceNo" control={control} type="text" label="Invoice Number" required size="small" disabled={isApproved} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <EnhancedFormField name="invDate" control={control} type="datepicker" label="Invoice Date" required size="small" disabled={isApproved} />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Purchase Order Section - This affects poGrnDetails */}
          <PurchaseOrderSection
            expanded={expandedSections.po}
            onChange={() => handleSectionToggle("po")}
            isApproved={isApproved}
            watchedDeptID={watchedDeptID}
            watchedDeptName={watchedDeptName}
            onPoDataFetched={handlePoDataFetched}
            onGRNDataFetched={handlePOGrnDetailsChange}
          />

          {/* Manual Product Addition Section - This affects grnDetails */}
          <GrnDetailsComponent
            grnDetails={grnDetails}
            onGrnDetailsChange={handleManualGrnDetailsChange}
            disabled={isSubmitting}
            grnApproved={isApproved}
            expanded={expandedSections.manual}
            onToggle={() => handleSectionToggle("manual")}
          />

          {/* =============================================== */}
          {/* ===  START OF THE NEWLY ADDED COMPONENT   === */}
          {/* =============================================== */}

          <GRNTotalsAndActionsSection
            grnDetails={allGrnDetails}
            control={control}
            setValue={setValue}
            watch={watch}
            onDeleteAll={handleDeleteAll}
            onShowHistory={handleShowHistory}
            onNewIssueDepartment={handleNewIssueDepartment}
            onApplyDiscount={handleApplyDiscount}
            disabled={isSubmitting}
            isApproved={isApproved}
          />

          {/* =============================================== */}
          {/* ===   END OF THE NEWLY ADDED COMPONENT    === */}
          {/* =============================================== */}

          {/* Advanced Configuration Section */}
          <Accordion expanded={expandedSections.configuration} onChange={() => handleSectionToggle("configuration")}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1}>
                <WarningIcon color="primary" />
                <Typography variant="h6" color="primary">
                  Advanced Configuration
                </Typography>
                <Chip label="Optional" size="small" color="default" variant="outlined" />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack spacing={2}>
                    <FormControlLabel
                      control={
                        <Switch checked={getValues("qualityCheckYN") === "Y"} onChange={(e) => setValue("qualityCheckYN", e.target.checked ? "Y" : "N")} disabled={isApproved} />
                      }
                      label="Quality Check Required"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={getValues("taxAfterDiscountYN") === "Y"}
                          onChange={(e) => setValue("taxAfterDiscountYN", e.target.checked ? "Y" : "N")}
                          disabled={isApproved}
                        />
                      }
                      label="Tax After Discount"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={getValues("discPercentageYN") === "Y"}
                          onChange={(e) => setValue("discPercentageYN", e.target.checked ? "Y" : "N")}
                          disabled={isApproved}
                        />
                      }
                      label="Discount as Percentage"
                    />
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Additional configuration options for quality control and tax calculations.
                  </Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </form>
      </Box>
    </GenericDialog>
  );
};

export default ComprehensiveGrnFormDialog;
