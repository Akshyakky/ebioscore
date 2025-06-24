import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { GRNDetailDto, GRNWithAllDetailsDto } from "@/interfaces/InventoryManagement/GRNDto";
import { useAlert } from "@/providers/AlertProvider";

import { zodResolver } from "@hookform/resolvers/zod";
import { Clear as ClearIcon, Save as SaveIcon } from "@mui/icons-material";
import { Box, Grid, Paper, Typography } from "@mui/material";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import useGRN from "../hooks/useGrnhooks";
import GrnDetailsComponent from "./GrnDetailsComponent";

const grnSchema = z.object({
  grnID: z.number().default(0),
  deptID: z.number().min(1, "Department is required"),
  deptName: z.string().min(1, "Department name is required"),
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
  supplrID: z.number().min(1, "Supplier is required"),
  supplrName: z.string().min(1, "Supplier name is required"),
  grnCode: z.string().optional(),
  grnType: z.string().default("INV"),
  grnStatus: z.string().default("Pending"),
  grnStatusCode: z.string().default("PEND"),
  grnApprovedYN: z.string().default("N"),
  grnApprovedBy: z.string().optional(),
  grnApprovedID: z.number().optional(),
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
  dcNo: z.string().optional(),
  poNo: z.string().optional(),
  poID: z.number().optional(),
  poDate: z.union([z.date(), z.any()]).optional().nullable(),
  poTotalAmt: z.number().optional().default(0),
  poDiscAmt: z.number().optional().default(0),
  poCoinAdjAmt: z.number().optional().default(0),
  transDeptID: z.number().optional(),
  transDeptName: z.string().optional(),
  catValue: z.string().default("MEDI"),
  catDesc: z.string().default("REVENUE"),
  auGrpID: z.number().default(18),
  discPercentageYN: z.string().default("N"),
  grnDetails: z.array(z.any()).default([]),
  rActiveYN: z.string().default("Y"),
  transferYN: z.string().default("N"),
  rNotes: z.string().optional().nullable(),
});

type GrnFormData = z.infer<typeof grnSchema>;

interface GrnFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (grn: GRNWithAllDetailsDto) => Promise<void>;
  grn: GRNWithAllDetailsDto | null;
}

const GrnFormDialog: React.FC<GrnFormDialogProps> = ({ open, onClose, onSubmit, grn }) => {
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [grnDetails, setGrnDetails] = useState<GRNDetailDto[]>([]);

  const isEditMode = !!grn && grn.grnID > 0;
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
    formState: { errors, isDirty, isValid, isSubmitting },
  } = useForm<GrnFormData>({
    resolver: zodResolver(grnSchema),
    mode: "onChange",
    defaultValues: {
      grnID: 0,
      deptID: 0,
      deptName: "",
      grnDate: new Date(),
      invoiceNo: "",
      invDate: new Date(),
      supplrID: 0,
      supplrName: "",
      grnCode: "",
      grnType: "INV",
      grnStatus: "Pending",
      grnStatusCode: "PEND",
      grnApprovedYN: "N",
      grnApprovedBy: "",
      grnApprovedID: 0,
      tot: 0,
      disc: 0,
      netTot: 0,
      taxAmt: 0,
      totalTaxableAmt: 0,
      netCGSTTaxAmt: 0,
      netSGSTTaxAmt: 0,
      balanceAmt: 0,
      otherAmt: 0,
      coinAdj: 0,
      dcNo: "",
      poNo: "",
      poID: 0,
      poDate: null,
      poTotalAmt: 0,
      poDiscAmt: 0,
      poCoinAdjAmt: 0,
      transDeptID: 0,
      transDeptName: "",
      catValue: "MEDI",
      catDesc: "REVENUE",
      auGrpID: 18,
      discPercentageYN: "N",
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

  const isMandatoryFieldsFilled = !!(watchedDeptID && watchedSupplierID && watchedGrnCode && watchedInvoiceNo);

  // Initialize form data when dialog opens
  useEffect(() => {
    if (open) {
      if (grn) {
        // Edit mode - populate form with existing data
        const formData: GrnFormData = {
          grnID: grn.grnID || 0,
          deptID: grn.deptID || 0,
          deptName: grn.deptName || "",
          grnDate: grn.grnDate ? new Date(grn.grnDate) : new Date(),
          invoiceNo: grn.invoiceNo || "",
          invDate: grn.invDate ? new Date(grn.invDate) : new Date(),
          supplrID: grn.supplrID || 0,
          supplrName: grn.supplrName || "",
          grnCode: grn.grnCode || "",
          grnType: grn.grnType || "INV",
          grnStatus: grn.grnStatus || "Pending",
          grnStatusCode: grn.grnStatusCode || "PEND",
          grnApprovedYN: grn.grnApprovedYN || "N",
          grnApprovedBy: grn.grnApprovedBy || "",
          grnApprovedID: grn.grnApprovedID || 0,
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
          dcNo: grn.dcNo || "",
          poNo: grn.poNo || "",
          poID: grn.poID || 0,
          poDate: grn.poDate ? new Date(grn.poDate) : null,
          poTotalAmt: grn.poTotalAmt || 0,
          poDiscAmt: grn.poDiscAmt || 0,
          poCoinAdjAmt: grn.poCoinAdjAmt || 0,
          transDeptID: grn.transDeptID || 0,
          transDeptName: grn.transDeptName || "",
          catValue: grn.catValue || "MEDI",
          catDesc: grn.catDesc || "REVENUE",
          auGrpID: grn.auGrpID || 18,
          discPercentageYN: grn.discPercentageYN || "N",
          grnDetails: grn.grnDetails || [],
          rActiveYN: grn.rActiveYN || "Y",
          transferYN: grn.transferYN || "N",
          rNotes: grn.rNotes || "",
        };

        reset(formData);
        setGrnDetails(grn.grnDetails || []);
      } else {
        // New mode - reset to default values
        const newFormData: GrnFormData = {
          grnID: 0,
          deptID: 0,
          deptName: "",
          grnDate: new Date(),
          invoiceNo: "",
          invDate: new Date(),
          supplrID: 0,
          supplrName: "",
          grnCode: "",
          grnType: "INV",
          grnStatus: "Pending",
          grnStatusCode: "PEND",
          grnApprovedYN: "N",
          grnApprovedBy: "",
          grnApprovedID: 0,
          tot: 0,
          disc: 0,
          netTot: 0,
          taxAmt: 0,
          totalTaxableAmt: 0,
          netCGSTTaxAmt: 0,
          netSGSTTaxAmt: 0,
          balanceAmt: 0,
          otherAmt: 0,
          coinAdj: 0,
          dcNo: "",
          poNo: "",
          poID: 0,
          poDate: null,
          poTotalAmt: 0,
          poDiscAmt: 0,
          poCoinAdjAmt: 0,
          transDeptID: 0,
          transDeptName: "",
          catValue: "MEDI",
          catDesc: "REVENUE",
          auGrpID: 18,
          discPercentageYN: "N",
          grnDetails: [],
          rActiveYN: "Y",
          transferYN: "N",
          rNotes: "",
        };

        reset(newFormData);
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
  //   const handleDepartmentChange = useCallback(
  //     (value: any) => {
  //       const selectedDept = departments.find((dept) => dept.value === value.toString());
  //       if (selectedDept) {
  //         setValue("deptID", Number(selectedDept.value), { shouldValidate: true, shouldDirty: true });
  //         setValue("deptName", selectedDept.label, { shouldValidate: true, shouldDirty: true });
  //         trigger();
  //       }
  //     },
  //     [departments, setValue, trigger]
  //   );

  // Handle supplier change
  //   const handleSupplierChange = useCallback(
  //     (value: any) => {
  //       const selectedSupplier = suppliers.find((supplier) => supplier.value === value.toString());
  //       if (selectedSupplier) {
  //         setValue("supplrID", Number(selectedSupplier.value), { shouldValidate: true, shouldDirty: true });
  //         setValue("supplrName", selectedSupplier.label, { shouldValidate: true, shouldDirty: true });
  //         trigger();
  //       }
  //     },
  //     [suppliers, setValue, trigger]
  //   );

  // Calculate totals based on GRN details
  const calculateTotals = useCallback(
    (details: GRNDetailDto[]) => {
      let total = 0;
      let totalTaxable = 0;
      let totalCGST = 0;
      let totalSGST = 0;

      details.forEach((detail) => {
        const productValue = detail.productValue || 0;
        total += productValue;
        totalTaxable += detail.taxableAmt || 0;
        totalCGST += detail.cgstTaxAmt || 0;
        totalSGST += detail.sgstTaxAmt || 0;
      });

      const discount = getValues("disc") || 0;
      const netTotal = total - discount;

      setValue("tot", total);
      setValue("netTot", netTotal);
      setValue("totalTaxableAmt", totalTaxable);
      setValue("netCGSTTaxAmt", totalCGST);
      setValue("netSGSTTaxAmt", totalSGST);
      setValue("taxAmt", totalCGST + totalSGST);
      setValue("balanceAmt", netTotal);

      trigger();
    },
    [setValue, trigger, getValues]
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

  // Form submission
  const onFormSubmit = async (data: GrnFormData) => {
    try {
      // Validate that we have at least one detail
      if (!grnDetails || grnDetails.length === 0) {
        showAlert("Validation Error", "Please add at least one product to the GRN", "warning");
        return;
      }

      // Format dates
      //   const formattedData: GRNWithAllDetailsDto = {
      //     grnID: data.grnID, // Ensure grnID is always present at the top level
      //     deptID: data.deptID, // Explicitly add deptID to satisfy required property
      //     deptName: data.deptName, // Explicitly add deptName to satisfy required property
      //     invoiceNo: data.invoiceNo, // Explicitly add invoiceNo to satisfy required property
      //     ...data,
      //     grnDate: dayjs(data.grnDate).toISOString(),
      //     invDate: dayjs(data.invDate).toISOString(),
      //     poDate: data.poDate ? dayjs(data.poDate).toISOString() : null,
      //     grnDetails: grnDetails.map((detail, index) => ({
      //       ...detail,
      //       grnID: data.grnID,
      //       grnDetID: detail.grnDetID || 0,
      //     })),
      //   };

      //   await onSubmit(formattedData);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleClear = () => {
    if (isEditMode && grn) {
      // Reset to original values
      reset({
        grnID: grn.grnID || 0,
        deptID: grn.deptID || 0,
        deptName: grn.deptName || "",
        grnDate: grn.grnDate ? new Date(grn.grnDate) : new Date(),
        invoiceNo: grn.invoiceNo || "",
        invDate: grn.invDate ? new Date(grn.invDate) : new Date(),
        supplrID: grn.supplrID || 0,
        supplrName: grn.supplrName || "",
        grnCode: grn.grnCode || "",
        grnType: grn.grnType || "INV",
        grnStatus: grn.grnStatus || "Pending",
        grnStatusCode: grn.grnStatusCode || "PEND",
        grnApprovedYN: grn.grnApprovedYN || "N",
        grnApprovedBy: grn.grnApprovedBy || "",
        grnApprovedID: grn.grnApprovedID || 0,
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
        dcNo: grn.dcNo || "",
        poNo: grn.poNo || "",
        poID: grn.poID || 0,
        poDate: grn.poDate ? new Date(grn.poDate) : null,
        poTotalAmt: grn.poTotalAmt || 0,
        poDiscAmt: grn.poDiscAmt || 0,
        poCoinAdjAmt: grn.poCoinAdjAmt || 0,
        transDeptID: grn.transDeptID || 0,
        transDeptName: grn.transDeptName || "",
        catValue: grn.catValue || "MEDI",
        catDesc: grn.catDesc || "REVENUE",
        auGrpID: grn.auGrpID || 18,
        discPercentageYN: grn.discPercentageYN || "N",
        grnDetails: grn.grnDetails || [],
        rActiveYN: grn.rActiveYN || "Y",
        transferYN: grn.transferYN || "N",
        rNotes: grn.rNotes || "",
      });
      setGrnDetails(grn.grnDetails || []);
    } else {
      // Clear to defaults
      reset({
        grnID: 0,
        deptID: 0,
        deptName: "",
        grnDate: new Date(),
        invoiceNo: "",
        invDate: new Date(),
        supplrID: 0,
        supplrName: "",
        grnCode: "",
        grnType: "INV",
        grnStatus: "Pending",
        grnStatusCode: "PEND",
        grnApprovedYN: "N",
        grnApprovedBy: "",
        grnApprovedID: 0,
        tot: 0,
        disc: 0,
        netTot: 0,
        taxAmt: 0,
        totalTaxableAmt: 0,
        netCGSTTaxAmt: 0,
        netSGSTTaxAmt: 0,
        balanceAmt: 0,
        otherAmt: 0,
        coinAdj: 0,
        dcNo: "",
        poNo: "",
        poID: 0,
        poDate: null,
        poTotalAmt: 0,
        poDiscAmt: 0,
        poCoinAdjAmt: 0,
        transDeptID: 0,
        transDeptName: "",
        catValue: "MEDI",
        catDesc: "REVENUE",
        auGrpID: 18,
        discPercentageYN: "N",
        grnDetails: [],
        rActiveYN: "Y",
        transferYN: "N",
        rNotes: "",
      });
      setGrnDetails([]);
    }
  };

  const dialogActions = (
    <>
      <CustomButton variant="outlined" text={isEditMode ? "Reset" : "Clear"} icon={ClearIcon} onClick={handleClear} disabled={isSubmitting} color="inherit" />
      <CustomButton variant="outlined" text="Cancel" onClick={onClose} disabled={isSubmitting} />
      <SmartButton
        variant="contained"
        text={isEditMode ? "Update GRN" : "Create GRN"}
        icon={SaveIcon}
        onAsyncClick={handleSubmit(onFormSubmit)}
        asynchronous
        disabled={isSubmitting || !isMandatoryFieldsFilled}
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
      title={isEditMode ? "Edit GRN" : "New GRN"}
      maxWidth="xl"
      fullWidth
      disableBackdropClick={isSubmitting}
      disableEscapeKeyDown={isSubmitting}
      actions={dialogActions}
    >
      <Box sx={{ width: "100%" }}>
        <form onSubmit={handleSubmit(onFormSubmit)}>
          {/* Basic GRN Information */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Basic GRN Information
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField
                  name="grnCode"
                  control={control}
                  type="text"
                  label="GRN Code"
                  required
                  disabled={isEditMode}
                  size="small"
                  helperText={isEditMode ? "Code cannot be changed" : isGeneratingCode ? "Generating..." : "Auto-generated based on department"}
                  adornment={
                    !isEditMode && <CustomButton size="small" variant="outlined" text="Generate" onClick={handleGenerateCode} disabled={!watchedDeptID || isGeneratingCode} />
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField name="deptID" control={control} type="select" label="Department" required size="small" options={null} onChange={null} disabled={isEditMode} />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField name="supplrID" control={control} type="select" label="Supplier" required size="small" options={null} onChange={null} />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField name="grnDate" control={control} type="datepicker" label="GRN Date" required size="small" />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField name="invoiceNo" control={control} type="text" label="Invoice Number" required size="small" />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField name="invDate" control={control} type="datepicker" label="Invoice Date" required size="small" />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField
                  name="grnType"
                  control={control}
                  type="select"
                  label="GRN Type"
                  size="small"
                  options={[
                    { value: "INV", label: "Invoice" },
                    { value: "DC", label: "Delivery Challan" },
                    { value: "PO", label: "Purchase Order" },
                  ]}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField name="dcNo" control={control} type="text" label="DC Number" size="small" />
              </Grid>
            </Grid>
          </Paper>

          {/* Purchase Order Information */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Purchase Order Information (Optional)
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField name="poNo" control={control} type="text" label="PO Number" size="small" />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField name="poDate" control={control} type="datepicker" label="PO Date" size="small" />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField name="poTotalAmt" control={control} type="number" label="PO Total Amount" size="small" />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField name="rNotes" control={control} type="textarea" label="Notes" size="small" rows={2} />
              </Grid>
            </Grid>
          </Paper>

          {/* GRN Details Component */}
          <GrnDetailsComponent grnDetails={grnDetails} onGrnDetailsChange={handleGrnDetailsChange} products={null} disabled={isSubmitting} />

          {/* Totals Summary */}
          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Totals Summary
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 2 }}>
                <EnhancedFormField name="tot" control={control} type="number" label="Total" size="small" disabled />
              </Grid>

              <Grid size={{ xs: 12, md: 2 }}>
                <EnhancedFormField
                  name="disc"
                  control={control}
                  type="number"
                  label="Discount"
                  size="small"
                  onChange={(value) => {
                    setValue("disc", Number(value) || 0);
                    calculateTotals(grnDetails);
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 2 }}>
                <EnhancedFormField name="netTot" control={control} type="number" label="Net Total" size="small" disabled />
              </Grid>

              <Grid size={{ xs: 12, md: 2 }}>
                <EnhancedFormField name="netCGSTTaxAmt" control={control} type="number" label="CGST Amount" size="small" disabled />
              </Grid>

              <Grid size={{ xs: 12, md: 2 }}>
                <EnhancedFormField name="netSGSTTaxAmt" control={control} type="number" label="SGST Amount" size="small" disabled />
              </Grid>

              <Grid size={{ xs: 12, md: 2 }}>
                <EnhancedFormField name="taxAmt" control={control} type="number" label="Total Tax" size="small" disabled />
              </Grid>
            </Grid>
          </Paper>
        </form>
      </Box>
    </GenericDialog>
  );
};

export default GrnFormDialog;
