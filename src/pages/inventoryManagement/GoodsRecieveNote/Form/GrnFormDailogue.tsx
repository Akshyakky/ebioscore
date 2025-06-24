import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { GRNDetailDto, GRNHelpers, GRNWithAllDetailsDto } from "@/interfaces/InventoryManagement/GRNDto";
import { useAlert } from "@/providers/AlertProvider";
import { formatCurrency } from "@/utils/Common/formatUtils";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle as ApproveIcon,
  Calculate as CalculateIcon,
  Clear as ClearIcon,
  Business as DeptIcon,
  Receipt as InvoiceIcon,
  Description as POIcon,
  Save as SaveIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Card, CardContent, Chip, Divider, FormControlLabel, Grid, Stack, Switch, Typography } from "@mui/material";
import { GridExpandMoreIcon } from "@mui/x-data-grid";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import useGRN from "../hooks/useGrnhooks";
import GrnDetailsComponent from "./GrnDetailsComponent";

const grnSchema = z.object({
  grnID: z.number().default(0),
  grnCode: z.string().optional(),
  deptID: z.number().min(1, "Department is required"),
  deptName: z.string().min(1, "Department name is required"),
  supplrID: z.number().min(1, "Supplier is required"),
  supplrName: z.string().min(1, "Supplier name is required"),
  grnDate: z.union([z.date(), z.any()]).refine(
    (date) => {
      if (!date) return false;
      const dateObj = dayjs.isDayjs(date) ? date.toDate() : date;
      return dateObj instanceof Date && !isNaN(dateObj.getTime());
    },
    { message: "Valid GRN date is required" }
  ),

  invoiceNo: z.string().min(1, "Invoice number is required"),
  invDate: z.union([z.date(), z.any()]).refine(
    (date) => {
      if (!date) return false;
      const dateObj = dayjs.isDayjs(date) ? date.toDate() : date;
      return dateObj instanceof Date && !isNaN(dateObj.getTime());
    },
    { message: "Valid invoice date is required" }
  ),

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
  rActiveYN: z.string().default("Y"),
  transferYN: z.string().default("N"),
  rNotes: z.string().optional().nullable(),
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
  const [grnDetails, setGrnDetails] = useState<GRNDetailDto[]>([]);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    invoice: true,
    po: false,
    financial: true,
    configuration: false,
  });

  const isEditMode = !!grn && grn.grnMastDto.grnID > 0;
  const isApproved = grn?.grnMastDto.grnApprovedYN === "Y";
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
    defaultValues: {
      grnID: 0,
      grnCode: "",
      deptID: 0,
      deptName: "",
      supplrID: 0,
      supplrName: "",
      grnDate: new Date(),
      invoiceNo: "",
      invDate: new Date(),
      grnType: "Invoice",
      grnStatus: "Pending",
      grnStatusCode: "PEND",
      grnApprovedYN: "N",
      hideYN: "N",
      poNo: "",
      poID: 0,
      poDate: null,
      poTotalAmt: 0,
      poDiscAmt: 0,
      poCoinAdjAmt: 0,
      dcNo: "",
      expectedDeliveryDate: null,
      actualDeliveryDate: null,
      tot: 0,
      disc: 0,
      discountType: "AMOUNT",
      netTot: 0,
      taxAmt: 0,
      totalTaxableAmt: 0,
      netCGSTTaxAmt: 0,
      netSGSTTaxAmt: 0,
      balanceAmt: 0,
      otherAmt: 0,
      coinAdj: 0,
      roundingAdjustment: 0,
      transDeptID: 0,
      transDeptName: "",
      issueDeptID: 0,
      issueDeptName: "",
      catValue: "MEDI",
      catDesc: "REVENUE",
      auGrpID: 18,
      discPercentageYN: "N",
      taxAfterDiscountYN: "N",
      qualityCheckYN: "N",
      qualityCheckBy: "",
      qualityCheckDate: null,
      approvalDate: null,
      grnDetails: [],
      rActiveYN: "Y",
      transferYN: "N",
      rNotes: "",
    },
  });

  const watchedDeptID = watch("deptID");
  const watchedSupplierID = watch("supplrID");
  const watchedGrnCode = watch("grnCode");
  const watchedInvoiceNo = watch("invoiceNo");
  const watchedDiscountType = watch("discountType");
  const watchedDiscount = watch("disc");

  const isMandatoryFieldsFilled = !!(watchedDeptID && watchedSupplierID && watchedGrnCode && watchedInvoiceNo);
  useEffect(() => {
    if (open) {
      if (grn) {
        const formData: GrnFormData = {
          grnID: grn.grnMastDto.grnID || 0,
          grnCode: grn.grnMastDto.grnCode || "",
          deptID: grn.grnMastDto.deptID || 0,
          deptName: grn.grnMastDto.deptName || "",
          supplrID: grn.grnMastDto.supplrID || 0,
          supplrName: grn.grnMastDto.supplrName || "",
          grnDate: grn.grnMastDto.grnDate ? new Date() : new Date(),
          invoiceNo: grn.grnMastDto.invoiceNo || "",
          invDate: grn.grnMastDto.invDate ? new Date() : new Date(),
          grnType: grn.grnMastDto.grnType || "Invoice",
          grnStatus: grn.grnMastDto.grnStatus || "Pending",
          grnStatusCode: grn.grnMastDto.grnStatusCode || "PEND",
          grnApprovedYN: grn.grnMastDto.grnApprovedYN || "N",
          grnApprovedBy: grn.grnMastDto.grnApprovedBy || "",
          grnApprovedID: grn.grnMastDto.grnApprovedID || 0,
          hideYN: grn.grnMastDto.hideYN || "N",
          poNo: grn.grnMastDto.poNo || "",
          poID: grn.grnMastDto.poID || 0,
          poDate: grn.grnMastDto.poDate ? new Date() : null,
          poTotalAmt: grn.grnMastDto.poTotalAmt || 0,
          poDiscAmt: grn.grnMastDto.poDiscAmt || 0,
          poCoinAdjAmt: grn.grnMastDto.poCoinAdjAmt || 0,
          dcNo: grn.grnMastDto.dcNo || "",
          expectedDeliveryDate: grn.grnMastDto.expectedDeliveryDate ? new Date(grn.expectedDeliveryDate) : null,
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
          rActiveYN: grn.rActiveYN || "Y",
          transferYN: grn.transferYN || "N",
          rNotes: grn.rNotes || "",
        };

        reset(formData);
        setGrnDetails(grn.grnDetails || []);
      } else {
        // New mode - reset to default values
        reset();
        setGrnDetails([]);
      }
    }
  }, [open, grn, reset]);

  // Generate GRN code when department changes (only for new GRNs)
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
      // Error handling is done in the hook
    } finally {
      setIsGeneratingCode(false);
    }
  }, [watchedDeptID, generateGrnCode, setValue, trigger, showAlert]);

  // Auto-generate code when department changes (only for new GRNs)
  useEffect(() => {
    if (!isEditMode && watchedDeptID && !watchedGrnCode) {
      handleGenerateCode();
    }
  }, [watchedDeptID, isEditMode, watchedGrnCode, handleGenerateCode]);

  // Handle department change
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

  // Handle supplier change
  const handleSupplierChange = useCallback(
    (value: any) => {
      const selectedSupplier = suppliers.find((supplier) => supplier.value);
      if (selectedSupplier) {
        setValue("supplrID", Number(selectedSupplier.value), { shouldValidate: true, shouldDirty: true });
        setValue("supplrName", selectedSupplier.label, { shouldValidate: true, shouldDirty: true });
        trigger();
      }
    },
    [suppliers, setValue, trigger]
  );

  // Calculate totals based on GRN details
  const calculateTotals = useCallback(
    (details: GRNDetailDto[]) => {
      const discountValue = watchedDiscount || 0;
      const otherCharges = getValues("otherAmt") || 0;
      const coinAdjustment = getValues("coinAdj") || 0;

      const totals = GRNHelpers.calculateGRNTotals(details, discountValue, otherCharges, coinAdjustment);

      setValue("tot", totals.total);
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

  // Handle GRN details change
  const handleGrnDetailsChange = useCallback(
    (details: GRNDetailDto[]) => {
      setGrnDetails(details);
      setValue("grnDetails", details);
      calculateTotals(details);
    },
    [setValue, calculateTotals]
  );

  // Financial summary calculations
  const financialSummary = useMemo(() => {
    const totals = GRNHelpers.calculateGRNTotals(grnDetails, watchedDiscount || 0, getValues("otherAmt") || 0, getValues("coinAdj") || 0);
    return totals;
  }, [grnDetails, watchedDiscount, getValues]);

  // Form submission
  const onFormSubmit = async (data: GrnFormData) => {
    try {
      // Validate that we have at least one detail
      if (!grnDetails || grnDetails.length === 0) {
        showAlert("Validation Error", "Please add at least one product to the GRN", "warning");
        return;
      }

      // Validate using helper functions
      const validationResult = GRNHelpers.validateCompleteGRN({
        ...data,
        grnDetails,
      });

      if (!validationResult.isValid) {
        showAlert("Validation Error", validationResult.errors.join(", "), "error");
        return;
      }

      // Format dates and prepare data
      const formattedData: GRNWithAllDetailsDto = {
        grnID: data.grnID,
        deptID: data.deptID,
        deptName: data.deptName,
        supplrID: data.supplrID,
        supplrName: data.supplrName,
        grnDate: dayjs(data.grnDate).toISOString(),
        invoiceNo: data.invoiceNo,
        invDate: dayjs(data.invDate).toISOString(),
        grnType: data.grnType,
        grnStatus: data.grnStatus,
        grnStatusCode: data.grnStatusCode,
        grnApprovedYN: data.grnApprovedYN,
        poNo: data.poNo,
        poID: data.poID,
        poDate: data.poDate ? dayjs(data.poDate).toISOString() : null,
        poTotalAmt: data.poTotalAmt,
        poDiscAmt: data.poDiscAmt,
        poCoinAdjAmt: data.poCoinAdjAmt,
        dcNo: data.dcNo,
        expectedDeliveryDate: data.expectedDeliveryDate ? dayjs(data.expectedDeliveryDate).toISOString() : null,
        actualDeliveryDate: data.actualDeliveryDate ? dayjs(data.actualDeliveryDate).toISOString() : null,
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
        qualityCheckDate: data.qualityCheckDate ? dayjs(data.qualityCheckDate).toISOString() : null,
        approvalDate: data.approvalDate ? dayjs(data.approvalDate).toISOString() : null,
        grnCode: data.grnCode,
        grnApprovedBy: data.grnApprovedBy,
        grnApprovedID: data.grnApprovedID,
        hideYN: data.hideYN,
        rActiveYN: data.rActiveYN,
        transferYN: data.transferYN,
        rNotes: data.rNotes,
        grnDetails: grnDetails.map((detail, index) => ({
          ...detail,
          grnID: data.grnID,
          grnDetID: detail.grnDetID || 0,
          serialNo: index + 1,
        })),
      };

      await onSubmit(formattedData);
    } catch (error) {}
  };

  const handleClear = () => {
    reset();
    setGrnDetails([]);
  };

  const handleSectionToggle = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
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
      title="GRN "
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
          <Accordion expanded={expandedSections.basic} onChange={() => handleSectionToggle("basic")}>
            <AccordionSummary expandIcon={<GridExpandMoreIcon />}>
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
                    options={[
                      { value: "Invoice", label: "Invoice" },
                      { value: "DC", label: "Delivery Challan" },
                      { value: "PO", label: "Purchase Order" },
                      { value: "Return", label: "Return" },
                    ]}
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
            <AccordionSummary expandIcon={<GridExpandMoreIcon />}>
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

          <Accordion expanded={expandedSections.po} onChange={() => handleSectionToggle("po")}>
            <AccordionSummary expandIcon={<GridExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1}>
                <POIcon color="primary" />
                <Typography variant="h6" color="primary">
                  Purchase Order Information
                </Typography>
                <Chip label="Optional" size="small" color="info" variant="outlined" />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <EnhancedFormField name="poCode" control={control} type="text" label="PO Code" size="small" disabled={isApproved} />
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <EnhancedFormField name="poNo" control={control} type="text" label="PO Number" size="small" disabled={isApproved} />
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <EnhancedFormField name="poDate" control={control} type="datepicker" label="PO Date" size="small" disabled={isApproved} />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <GrnDetailsComponent grnDetails={grnDetails} onGrnDetailsChange={handleGrnDetailsChange} disabled={isSubmitting} grnApproved={isApproved} />

          <Accordion expanded={expandedSections.financial} onChange={() => handleSectionToggle("financial")}>
            <AccordionSummary expandIcon={<GridExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1}>
                <CalculateIcon color="primary" />
                <Typography variant="h6" color="primary">
                  Financial Summary
                </Typography>
                <Chip label={`Total: ${formatCurrency(financialSummary.grandTotal, "INR", "en-IN")}`} size="small" color="success" variant="filled" />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <EnhancedFormField name="tot" control={control} type="number" label="Items Total" size="small" disabled />
                    </Grid>

                    <Grid size={{ xs: 12, md: 3 }}>
                      <EnhancedFormField name="totalTaxableAmt" control={control} type="number" label="Taxable Amount" size="small" disabled />
                    </Grid>

                    <Grid size={{ xs: 12, md: 3 }}>
                      <EnhancedFormField name="taxAmt" control={control} type="number" label="Tax Amount" size="small" disabled />
                    </Grid>

                    <Grid size={{ xs: 12, md: 3 }}>
                      <EnhancedFormField
                        name="discountType"
                        control={control}
                        type="select"
                        label="Discount Type"
                        size="small"
                        disabled={isApproved}
                        options={[
                          { value: "AMOUNT", label: "Amount" },
                          { value: "PERCENTAGE", label: "Percentage" },
                        ]}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 3 }}>
                      <EnhancedFormField
                        name="disc"
                        control={control}
                        type="number"
                        label={watchedDiscountType === "PERCENTAGE" ? "Discount %" : "PO Disc Amt"}
                        size="small"
                        disabled={isApproved}
                        onChange={(value) => {
                          setValue("disc", Number(value) || 0);
                          calculateTotals(grnDetails);
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 3 }}>
                      <EnhancedFormField
                        name="otherAmt"
                        control={control}
                        type="number"
                        label="Others"
                        size="small"
                        disabled={isApproved}
                        onChange={(value) => {
                          setValue("otherAmt", Number(value) || 0);
                          calculateTotals(grnDetails);
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 3 }}>
                      <EnhancedFormField
                        name="coinAdj"
                        control={control}
                        type="number"
                        label="Coin Adjustment"
                        size="small"
                        disabled={isApproved}
                        onChange={(value) => {
                          setValue("coinAdj", Number(value) || 0);
                          calculateTotals(grnDetails);
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 3 }}>
                      <EnhancedFormField name="netTot" control={control} type="number" label="Net Total" size="small" disabled />
                    </Grid>

                    <Grid size={{ xs: 12, md: 3 }}>
                      <EnhancedFormField name="balanceAmt" control={control} type="number" label="Balance" size="small" disabled />
                    </Grid>

                    <Grid size={{ xs: 12, md: 3 }}>
                      <EnhancedFormField name="netCGSTTaxAmt" control={control} type="number" label="CGST Amount" size="small" disabled />
                    </Grid>

                    <Grid size={{ xs: 12, md: 3 }}>
                      <EnhancedFormField name="netSGSTTaxAmt" control={control} type="number" label="SGST Amount" size="small" disabled />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Card sx={{ backgroundColor: "success.light", color: "success.contrastText" }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Summary
                      </Typography>
                      <Stack spacing={1}>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Items:</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {financialSummary.totalItems}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Quantity:</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {financialSummary.totalQty}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Subtotal:</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {formatCurrency(financialSummary.total, "INR", "en-IN")}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Tax:</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {formatCurrency(financialSummary.totalTax, "INR", "en-IN")}
                          </Typography>
                        </Box>
                        <Divider />
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="h6">Grand Total:</Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {formatCurrency(financialSummary.grandTotal, "INR", "en-IN")}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Configuration Section */}
          <Accordion expanded={expandedSections.configuration} onChange={() => handleSectionToggle("configuration")}>
            <AccordionSummary expandIcon={<GridExpandMoreIcon />}>
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
                  <EnhancedFormField name="rNotes" control={control} type="textarea" label="Remarks" size="small" rows={4} disabled={isApproved} />
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
