import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { GrnDetailDto, GrnMastDto } from "@/interfaces/InventoryManagement/GRNDto";
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
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import GrnDetailsComponent from "./GrnDetailsComponent";
import GRNTotalsAndActionsSection from "./GRNTotalsAndActionsSection";

import { PurchaseOrderDetailDto, PurchaseOrderMastDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import { useGrn } from "../hooks/useGrnhooks";
import { IssueDepartmentData } from "./NewIssueDepartmentDialog";
import PurchaseOrderSection from "./purchaseOrderSection";

const GRNHelpers = {
  calculateProductValue: (detail: Partial<GrnDetailDto>): number => {
    const qty = detail.acceptQty || detail.recvdQty || 0;
    const price = detail.unitPrice || 0;
    const discount = detail.discAmt || 0;
    const discountPercentage = detail.discPercentage || 0;
    let productValue = qty * price;
    if (discount > 0) {
      productValue -= discount;
    } else if (discountPercentage > 0) {
      productValue -= (productValue * discountPercentage) / 100;
    }
    return Math.max(0, Math.round(productValue * 100) / 100);
  },

  calculateTaxAmounts: (
    detail: Partial<GrnDetailDto>
  ): {
    cgstAmount: number;
    sgstAmount: number;
    taxableAmount: number;
    totalTax: number;
    totalWithTax: number;
  } => {
    const productValue = GRNHelpers.calculateProductValue(detail);
    const cgstRate = detail.cgstPerValue || 0;
    const sgstRate = detail.sgstPerValue || 0;

    const taxableAmount = productValue;
    const cgstAmount = (taxableAmount * cgstRate) / 100;
    const sgstAmount = (taxableAmount * sgstRate) / 100;
    const totalTax = cgstAmount + sgstAmount;

    return {
      cgstAmount: Math.round(cgstAmount * 100) / 100,
      sgstAmount: Math.round(sgstAmount * 100) / 100,
      taxableAmount: Math.round(taxableAmount * 100) / 100,
      totalTax: Math.round(totalTax * 100) / 100,
      totalWithTax: Math.round((taxableAmount + totalTax) * 100) / 100,
    };
  },

  calculateGRNTotals: (
    details: GrnDetailDto[],
    discount: number = 0,
    otherCharges: number = 0,
    coinAdjustment: number = 0
  ): {
    total: number;
    netTotal: number;
    totalTaxable: number;
    totalCGST: number;
    totalSGST: number;
    totalTax: number;
    grandTotal: number;
    totalItems: number;
    totalQty: number;
  } => {
    let total = 0;
    let totalTaxable = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalItems = details.length;
    let totalQty = 0;

    details.forEach((detail) => {
      const productValue = GRNHelpers.calculateProductValue(detail);
      const taxAmounts = GRNHelpers.calculateTaxAmounts(detail);

      total += productValue;
      totalTaxable += taxAmounts.taxableAmount;
      totalCGST += taxAmounts.cgstAmount;
      totalSGST += taxAmounts.sgstAmount;
      totalQty += detail.acceptQty || detail.recvdQty || 0;
    });

    const netTotal = total - discount;
    const totalTax = totalCGST + totalSGST;
    const grandTotal = netTotal + totalTax + otherCharges + coinAdjustment;

    return {
      total: Math.round(total * 100) / 100,
      netTotal: Math.round(netTotal * 100) / 100,
      totalTaxable: Math.round(totalTaxable * 100) / 100,
      totalCGST: Math.round(totalCGST * 100) / 100,
      totalSGST: Math.round(totalSGST * 100) / 100,
      totalTax: Math.round(totalTax * 100) / 100,
      grandTotal: Math.round(grandTotal * 100) / 100,
      totalItems,
      totalQty,
    };
  },
};

const grnSchema = z.object({
  grnID: z.number().default(0),
  grnCode: z.string().optional(),
  deptID: z.number().optional().nullable(),
  deptName: z.string().optional(),
  supplrID: z.number().optional().nullable(),
  supplrName: z.string().optional(),
  grnDate: z.union([z.date(), z.any()]).optional().nullable(),
  invoiceNo: z.string().optional(),
  invDate: z.union([z.date(), z.any()]).optional().nullable(),
  grnType: z.string().default("Invoice"),
  grnStatus: z.string().default("Pending"),
  grnStatusCode: z.string().default("PEND"),
  grnApprovedYN: z.string().default("N"),
  grnApprovedBy: z.string().optional(),
  grnApprovedID: z.number().optional(),
  poNo: z.string().optional(),
  poID: z.number().optional(),
  poDate: z.union([z.date(), z.any()]).optional().nullable(),
  poTotalAmt: z.number().optional().default(0),
  poDiscAmt: z.number().optional().default(0),
  poCoinAdjAmt: z.number().optional().default(0),
  dcNo: z.string().optional(),
  tot: z.number().optional().default(0),
  disc: z.number().optional().default(0),
  netTot: z.number().optional().default(0),
  taxAmt: z.number().optional().default(0),
  totalTaxableAmt: z.number().optional().default(0),
  netCGSTTaxAmt: z.number().optional().default(0),
  netSGSTTaxAmt: z.number().optional().default(0),
  balanceAmt: z.number().optional().default(0),
  otherAmt: z.number().optional().default(0),
  coinAdj: z.number().optional().default(0),
  transDeptID: z.number().optional(),
  transDeptName: z.string().optional(),
  catValue: z.string().default("MEDI"),
  catDesc: z.string().default("REVENUE"),
  auGrpID: z.number().default(18),
  discPercentageYN: z.string().default("N"),
  grnDetails: z.array(z.any()).default([]),
  rActiveYN: z.string().default("Y"),
  rNotes: z.string().optional().nullable(),
});

type GrnFormData = z.infer<typeof grnSchema>;
interface ComprehensiveGrnFormDialogProps {
  open: boolean;
  onClose: () => void;
  grn: GrnMastDto | null;
  departments: { value: string; label: string }[];
  suppliers: { value: string; label: string }[];
  products: { value: string; label: string }[];
}

const ComprehensiveGrnFormDialog: React.FC<ComprehensiveGrnFormDialogProps> = ({ open, onClose, grn, departments, suppliers, products }) => {
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [grnDetails, setGrnDetails] = useState<GrnDetailDto[]>([]); // For manually added products
  const [poGrnDetails, setPOGrnDetails] = useState<GrnDetailDto[]>([]); // For PO-based products
  const [issueDepartments, setIssueDepartments] = useState<IssueDepartmentData[]>([]); // Issue departments
  const [selectedProductForIssue, setSelectedProductForIssue] = useState<GrnDetailDto | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    invoice: true,
    po: false,
    manual: true,
    financial: false,
    configuration: false,
  });

  const isEditMode = !!grn && grn.grnID > 0;
  const isApproved = grn?.grnApprovedYN === "Y";
  const { generateGrnCode, createGrn } = useGrn();
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

  const watcheddeptID = watch("deptID");
  const watchedgrnCode = watch("grnCode");
  const watcheddiscount = watch("disc");
  const watcheddeptName = watch("deptName");
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
          grnDate: grn.grnDate ? new Date(grn.grnDate) : null,
          invoiceNo: grn.invoiceNo || "",
          invDate: grn.invDate ? new Date(grn.invDate) : null,
          grnType: grn.grnType || "Invoice",
          grnStatus: grn.grnStatus || "Pending",
          grnStatusCode: grn.grnStatusCode || "PEND",
          grnApprovedYN: grn.grnApprovedYN || "N",
          grnApprovedBy: grn.grnApprovedBy || "",
          grnApprovedID: grn.grnApprovedID || 0,
          poNo: grn.poNo || "",
          poID: grn.poID || 0,
          poDate: grn.poDate ? new Date(grn.poDate) : null,
          poTotalAmt: grn.poTotalAmt || 0,
          poDiscAmt: grn.poDiscAmt || 0,
          poCoinAdjAmt: grn.poCoinAdjAmt || 0,
          dcNo: grn.dcNo || "",
          tot: grn.tot || 0,
          disc: grn.disc || 0,
          netTot: grn.netTot || 0,
          taxAmt: grn.taxAmt || 0,
          totalTaxableAmt: grn.totalTaxableAmt || 0,
          netCGSTTaxAmt: grn.netCGSTTaxAmt || 0,
          netSGSTTaxAmt: grn.netSGSTTaxAmt || 0,
          balanceAmt: grn.balanceAmt || 0,
          otherAmt: grn.otherAmt || 0,
          coinAdj: grn.coinAdj || 0,
          transDeptID: grn.transDeptID || 0,
          transDeptName: grn.transDeptName || "",
          catValue: grn.catValue || "MEDI",
          catDesc: grn.catDesc || "REVENUE",
          auGrpID: grn.auGrpID || 18,
          discPercentageYN: grn.discPercentageYN || "N",
          grnDetails: grn.grnDetails || [],
          rActiveYN: grn.rActiveYN || "Y",
          rNotes: grn.rNotes || "",
        };

        reset(formData);
        const poBasedDetails = (grn.grnDetails || []).filter((detail) => detail.poDetID && detail.poDetID > 0);
        const manualDetails = (grn.grnDetails || []).filter((detail) => !detail.poDetID || detail.poDetID === 0);

        setPOGrnDetails(poBasedDetails);
        setGrnDetails(manualDetails);
        setIssueDepartments([]);
      } else {
        reset();
        setGrnDetails([]);
        setPOGrnDetails([]);
        setIssueDepartments([]);
      }
    }
  }, [open, grn, reset]);

  const handleGenerateCode = useCallback(async () => {
    if (!watcheddeptID) {
      showAlert("Warning", "Please select a department first", "warning");
      return;
    }
    try {
      setIsGeneratingCode(true);
      const newCode = await generateGrnCode(watcheddeptID);
      setValue("grnCode", newCode, { shouldValidate: true, shouldDirty: true });
      trigger();
    } catch (error) {
      showAlert("Error", "Failed to generate GRN code", "error");
    } finally {
      setIsGeneratingCode(false);
    }
  }, [watcheddeptID, generateGrnCode, setValue, trigger, showAlert]);

  useEffect(() => {
    if (!isEditMode && watcheddeptID && !watchedgrnCode) {
      handleGenerateCode();
    }
  }, [watcheddeptID, isEditMode, watchedgrnCode, handleGenerateCode]);

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
    (allDetails: GrnDetailDto[]) => {
      const itemsTotal = allDetails.reduce((sum, detail) => {
        const receivedQty = detail.recvdQty || 0;
        const unitPrice = detail.unitPrice || 0;
        return sum + receivedQty * unitPrice;
      }, 0);
      setValue("tot", parseFloat(itemsTotal.toFixed(2)), { shouldDirty: true });
      const discountValue = watcheddiscount || 0;
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
    [setValue, trigger, watcheddiscount, getValues]
  );

  const handleManualGrnDetailsChange = useCallback(
    (details: GrnDetailDto[]) => {
      setGrnDetails(details);
      calculateTotals([...poGrnDetails, ...details]);
    },
    [poGrnDetails, calculateTotals]
  );

  const handlePOGrnDetailsChange = useCallback(
    (details: GrnDetailDto[]) => {
      setPOGrnDetails(details);
      calculateTotals([...details, ...grnDetails]);
    },
    [grnDetails, calculateTotals]
  );

  const handlePoDataFetched = useCallback(
    (mast: PurchaseOrderMastDto | null, details: PurchaseOrderDetailDto[]) => {
      if (mast && details.length > 0) {
        showAlert("Success", `PO ${mast.pOCode} selected with ${details.length} items.`, "success");
        if (!watch("supplrID") && mast.supplierID) {
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
    [showAlert, watch, handleSupplierChange]
  );
  const handleIssueDepartmentChange = useCallback((departments: IssueDepartmentData[]) => {
    setIssueDepartments(departments);
  }, []);

  const handleDeleteAll = useCallback(() => {
    setGrnDetails([]);
    setPOGrnDetails([]);
    setIssueDepartments([]);
    calculateTotals([]);
    showAlert("Success", "All products removed from GRN", "success");
  }, [calculateTotals, showAlert]);

  const handleShowHistory = useCallback(() => {
    showAlert("Info", "History functionality to be implemented", "info");
  }, [showAlert]);

  const handleNewIssueDepartment = useCallback(() => {}, []);

  const handleApplydiscount = useCallback(() => {
    calculateTotals(allGrnDetails);
    showAlert("Success", "discount applied and totals recalculated", "success");
  }, [allGrnDetails, calculateTotals, showAlert]);

  const onSubmit = async (data: GrnFormData) => {
    // Find the selected department and supplier labels from the props.
    // This is more reliable than relying on the form state for derived values like names.
    const selectedDept = departments.find((d) => d.value === data.deptID?.toString());
    const selectedSupplier = suppliers.find((s) => s.value === data.supplrID?.toString());

    // Convert form data to the exact format expected by the API
    const formattedData: GrnMastDto = {
      grnID: data.grnID,
      deptID: data.deptID,
      deptName: selectedDept ? selectedDept.label : "", // Use the looked-up name
      supplrID: data.supplrID,
      supplrName: selectedSupplier ? selectedSupplier.label : "", // Use the looked-up name
      grnCode: data.grnCode || "",
      grnDate: data.grnDate ? new Date(data.grnDate).toISOString() : null,
      invoiceNo: data.invoiceNo,
      invDate: data.invDate ? new Date(data.invDate).toISOString() : null,
      grnType: data.grnType,
      grnStatus: data.grnStatus,
      grnStatusCode: data.grnStatusCode,
      grnApprovedYN: data.grnApprovedYN,
      grnApprovedBy: data.grnApprovedBy,
      grnApprovedID: data.grnApprovedID,
      poNo: data.poNo,
      poID: data.poID,
      poDate: data.poDate ? new Date(data.poDate).toISOString() : null,
      poTotalAmt: data.poTotalAmt,
      poDiscAmt: data.poDiscAmt,
      poCoinAdjAmt: data.poCoinAdjAmt,
      dcNo: data.dcNo,
      tot: data.tot,
      disc: data.disc,
      netTot: data.netTot,
      taxAmt: data.taxAmt,
      totalTaxableAmt: data.totalTaxableAmt,
      netCGSTTaxAmt: data.netCGSTTaxAmt,
      netSGSTTaxAmt: data.netSGSTTaxAmt,
      balanceAmt: data.balanceAmt,
      otherAmt: data.otherAmt,
      coinAdj: data.coinAdj,
      transDeptID: data.transDeptID,
      transDeptName: data.transDeptName,
      catValue: data.catValue,
      catDesc: data.catDesc,
      auGrpID: data.auGrpID,
      discPercentageYN: data.discPercentageYN,
      grnDetails: allGrnDetails,
      rActiveYN: data.rActiveYN,
      rNotes: data.rNotes,
    };

    try {
      const response = await createGrn(formattedData);
      if (response.success) {
        showAlert("Success", "GRN saved successfully.", "success");
        onClose();
      } else {
        throw new Error(response.errorMessage || "Failed to save GRN");
      }
    } catch (error) {
      console.error("Error submitting GRN:", error);
      showAlert("Error", "Failed to submit GRN. Please try again.", "error");
    }
  };

  const handleClear = () => {
    reset();
    setGrnDetails([]);
    setPOGrnDetails([]);
    setIssueDepartments([]);
  };

  const handleSectionToggle = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const dialogActions = useMemo(() => {
    return (
      <Box sx={{ display: "flex", gap: 1 }}>
        <CustomButton variant="outlined" text={isEditMode ? "Reset" : "Clear"} icon={ClearIcon} onClick={handleClear} disabled={isSubmitting || isApproved} color="inherit" />
        <CustomButton variant="outlined" text="Cancel" onClick={onClose} disabled={isSubmitting} />

        <SmartButton
          text={isEditMode ? "Update GRN" : "Create GRN"}
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          color="primary"
          icon={SaveIcon}
          asynchronous={true}
          showLoadingIndicator={true}
          loadingText={isEditMode ? "Updating..." : "Creating..."}
          successText={isEditMode ? "Updated!" : "Created!"}
          disabled={isSubmitting || isApproved}
        />
      </Box>
    );
  }, [handleSubmit, onSubmit, onClose, isEditMode, isSubmitting, isApproved]);

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
        {isApproved && (
          <Alert severity="info" sx={{ mb: 2 }} icon={<ApproveIcon />}>
            This GRN has been approved and cannot be modified. Stock has been updated.
          </Alert>
        )}

        <Accordion expanded={expandedSections.basic} onChange={() => handleSectionToggle("basic")}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" gap={1}>
              <DeptIcon color="primary" />
              <Typography variant="h6" color="primary">
                Basic GRN Information
              </Typography>
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
                  disabled={isEditMode || isApproved}
                  size="small"
                  helperText={isEditMode ? "Code cannot be changed" : isGeneratingCode ? "Generating..." : "Auto-generated"}
                  adornment={
                    !isEditMode &&
                    !isApproved && <CustomButton size="small" variant="outlined" text="Generate" onClick={handleGenerateCode} disabled={!watcheddeptID || isGeneratingCode} />
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField
                  name="deptID"
                  control={control}
                  type="select"
                  label="Department"
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
                  size="small"
                  options={suppliers}
                  onChange={handleSupplierChange}
                  disabled={isApproved}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField name="grnDate" control={control} type="datepicker" label="GRN Date" size="small" disabled={isApproved} />
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

        <Accordion expanded={expandedSections.invoice} onChange={() => handleSectionToggle("invoice")}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" gap={1}>
              <InvoiceIcon color="primary" />
              <Typography variant="h6" color="primary">
                Invoice Information
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <EnhancedFormField name="invoiceNo" control={control} type="text" label="Invoice Number" size="small" disabled={isApproved} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <EnhancedFormField name="invDate" control={control} type="datepicker" label="Invoice Date" size="small" disabled={isApproved} />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <PurchaseOrderSection
          expanded={expandedSections.po}
          onChange={() => handleSectionToggle("po")}
          isApproved={isApproved}
          watchedDeptID={watcheddeptID}
          watchedDeptName={watcheddeptName}
          onPoDataFetched={handlePoDataFetched}
          onGRNDataFetched={handlePOGrnDetailsChange}
          issueDepartments={issueDepartments}
          onIssueDepartmentChange={handleIssueDepartmentChange}
        />

        <GrnDetailsComponent
          grnDetails={grnDetails}
          onGrnDetailsChange={handleManualGrnDetailsChange}
          disabled={isSubmitting}
          grnApproved={isApproved}
          expanded={expandedSections.manual}
          onToggle={() => handleSectionToggle("manual")}
          issueDepartments={issueDepartments}
          onIssueDepartmentChange={handleIssueDepartmentChange}
        />

        <GRNTotalsAndActionsSection
          grnDetails={allGrnDetails}
          control={control}
          setValue={setValue}
          watch={watch}
          onDeleteAll={handleDeleteAll}
          onShowHistory={handleShowHistory}
          onNewIssueDepartment={handleNewIssueDepartment}
          onApplyDiscount={handleApplydiscount}
          disabled={isSubmitting}
          isApproved={isApproved}
          issueDepartments={issueDepartments}
          onIssueDepartmentChange={handleIssueDepartmentChange}
          selectedProductForIssue={selectedProductForIssue}
          onSelectedProductForIssueChange={setSelectedProductForIssue}
        />

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
                      <Switch checked={getValues("discPercentageYN") === "Y"} onChange={(e) => setValue("discPercentageYN", e.target.checked ? "Y" : "N")} disabled={isApproved} />
                    }
                    label="discount as Percentage"
                  />
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Additional configuration options for discount calculations.
                </Typography>

                {issueDepartments.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Issue Departments Summary:
                    </Typography>
                    <Stack spacing={1}>
                      {issueDepartments.map((dept) => (
                        <Chip key={dept.id} label={`${dept.productName} → ${dept.deptName} (${dept.quantity})`} size="small" variant="outlined" color="primary" />
                      ))}
                    </Stack>
                  </Box>
                )}
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Box>
    </GenericDialog>
  );
};

export default ComprehensiveGrnFormDialog;
