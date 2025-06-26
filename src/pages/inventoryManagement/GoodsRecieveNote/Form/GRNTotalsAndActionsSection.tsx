import CustomButton from "@/components/Button/CustomButton";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import { GRNDetailDto } from "@/interfaces/InventoryManagement/GRNDto";
import { Check as ApplyIcon, DeleteSweep as DeleteAllIcon, History as HistoryIcon, AddBusiness as NewDeptIcon } from "@mui/icons-material";
import { Box, FormControlLabel, Grid, Paper, Stack, Switch, Typography, useTheme } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { Control, UseFormSetValue, UseFormWatch } from "react-hook-form";

interface GRNTotalsAndActionsSectionProps {
  grnDetails: GRNDetailDto[];
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  onDeleteAll: () => void;
  onShowHistory: () => void;
  onNewIssueDepartment: () => void;
  onApplyDiscount: () => void;
  disabled?: boolean;
  isApproved?: boolean;
}

interface CalculatedTotals {
  itemsTotal: number;
  totalDiscountAmount: number;
  totalTaxAmount: number;
  totalCGSTAmount: number;
  totalSGSTAmount: number;
  totalTaxableAmount: number;
  netTotal: number;
  grandTotal: number;
}

const TotalDisplayField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <Box
    sx={{
      p: 2,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      height: "100%",
      borderRadius: 1,
      border: "1px solid",
      borderColor: "divider",
    }}
  >
    <Typography variant="subtitle2" component="div" sx={{ fontWeight: "bold", mr: 1, whiteSpace: "nowrap" }}>
      {label}:
    </Typography>
    {children}
  </Box>
);

const GRNTotalsAndActionsSection: React.FC<GRNTotalsAndActionsSectionProps> = ({
  grnDetails,
  control,
  setValue,
  watch,
  onDeleteAll,
  onShowHistory,
  onNewIssueDepartment,
  onApplyDiscount,
  disabled = false,
  isApproved = false,
}) => {
  const theme = useTheme();
  const [isDiscountInPercentage, setIsDiscountInPercentage] = useState(watch("discPercentageYN") === "Y");

  // Watch form values for calculations
  const watchedDiscountType = watch("discPercentageYN");
  const watchedDiscount = watch("disc") || 0;
  const watchedOtherAmount = watch("otherAmt") || 0;
  const watchedCoinAdjustment = watch("coinAdj") || 0;
  const watchedRoundingAdjustment = watch("roundingAdjustment") || 0;

  useEffect(() => {
    setIsDiscountInPercentage(watchedDiscountType === "Y");
  }, [watchedDiscountType]);

  // Main calculation function
  const calculateTotals = useCallback((): CalculatedTotals => {
    if (!grnDetails || grnDetails.length === 0) {
      return {
        itemsTotal: 0,
        totalDiscountAmount: 0,
        totalTaxAmount: 0,
        totalCGSTAmount: 0,
        totalSGSTAmount: 0,
        totalTaxableAmount: 0,
        netTotal: 0,
        grandTotal: 0,
      };
    }

    let itemsTotal = 0;
    let totalDiscountAmount = 0;
    let totalTaxAmount = 0;
    let totalCGSTAmount = 0;
    let totalSGSTAmount = 0;
    let totalTaxableAmount = 0;

    // Calculate totals for each line item
    grnDetails.forEach((detail) => {
      const receivedPack = detail.recvdPack || 0;
      const packPrice = detail.packPrice || 0;
      const discPercentage = detail.discPercentage || 0;
      const gstPercentage = detail.gstPercentage || 0;
      const cgstPerValue = detail.cgstPerValue || 0;
      const sgstPerValue = detail.sgstPerValue || 0;

      // Flags for tax calculation logic
      const isTaxAfterDisc = detail.taxAfterDiscYN === "Y";
      const isTaxInclusive = detail.includeTaxYN === "Y";

      // 1. Base Amount (Items Total for this line)
      const lineItemsTotal = receivedPack * packPrice;
      itemsTotal += lineItemsTotal;

      let lineDiscountAmount = 0;
      let lineTaxableAmount = 0;
      let lineTotalTaxAmount = 0;
      let lineCGSTAmount = 0;
      let lineSGSTAmount = 0;

      if (isTaxInclusive) {
        // Tax Inclusive Logic
        const finalValue = lineItemsTotal;

        if (isTaxAfterDisc) {
          // When tax is applied after discount in inclusive mode
          lineTaxableAmount = finalValue / (1 + gstPercentage / 100);
          lineTotalTaxAmount = lineTaxableAmount * (gstPercentage / 100);
          lineDiscountAmount = finalValue - lineTaxableAmount;
        } else {
          // When tax is applied on base amount in inclusive mode
          lineTotalTaxAmount = finalValue * (gstPercentage / 100);
          lineDiscountAmount = lineTotalTaxAmount;
          lineTaxableAmount = finalValue - lineDiscountAmount;
        }
      } else {
        // Tax Exclusive Logic (Standard)
        // 2. Discount Amount
        lineDiscountAmount = lineItemsTotal * (discPercentage / 100);

        // 3. Taxable Amount
        lineTaxableAmount = lineItemsTotal - lineDiscountAmount;

        // 4. Tax Amount calculation based on "Tax after Disc" flag
        if (isTaxAfterDisc) {
          // Tax calculated on amount after discount
          lineTotalTaxAmount = lineTaxableAmount * (gstPercentage / 100);
        } else {
          // Tax calculated on gross amount (before discount)
          lineTotalTaxAmount = lineItemsTotal * (gstPercentage / 100);
        }
      }

      // Split tax into CGST and SGST
      const totalGstPercentage = cgstPerValue + sgstPerValue;
      if (totalGstPercentage > 0) {
        lineCGSTAmount = lineTotalTaxAmount * (cgstPerValue / totalGstPercentage);
        lineSGSTAmount = lineTotalTaxAmount * (sgstPerValue / totalGstPercentage);
      }

      // Add to totals
      totalDiscountAmount += lineDiscountAmount;
      totalTaxableAmount += lineTaxableAmount;
      totalTaxAmount += lineTotalTaxAmount;
      totalCGSTAmount += lineCGSTAmount;
      totalSGSTAmount += lineSGSTAmount;
    });

    // Apply global discount if specified
    let globalDiscountAmount = 0;
    if (watchedDiscount > 0) {
      if (isDiscountInPercentage) {
        globalDiscountAmount = itemsTotal * (watchedDiscount / 100);
      } else {
        globalDiscountAmount = watchedDiscount;
      }
    }

    // Calculate final totals
    const adjustedTaxableAmount = totalTaxableAmount - globalDiscountAmount;
    const netTotal = adjustedTaxableAmount;
    const grandTotal = netTotal + totalTaxAmount + watchedOtherAmount + watchedCoinAdjustment + watchedRoundingAdjustment;

    return {
      itemsTotal: parseFloat(itemsTotal.toFixed(2)),
      totalDiscountAmount: parseFloat((totalDiscountAmount + globalDiscountAmount).toFixed(2)),
      totalTaxAmount: parseFloat(totalTaxAmount.toFixed(2)),
      totalCGSTAmount: parseFloat(totalCGSTAmount.toFixed(2)),
      totalSGSTAmount: parseFloat(totalSGSTAmount.toFixed(2)),
      totalTaxableAmount: parseFloat(adjustedTaxableAmount.toFixed(2)),
      netTotal: parseFloat(netTotal.toFixed(2)),
      grandTotal: parseFloat(grandTotal.toFixed(2)),
    };
  }, [grnDetails, watchedDiscount, isDiscountInPercentage, watchedOtherAmount, watchedCoinAdjustment, watchedRoundingAdjustment]);

  // Update form values when calculations change
  useEffect(() => {
    const totals = calculateTotals();

    // Update form fields with calculated values
    setValue("tot", totals.itemsTotal, { shouldDirty: false });
    setValue("taxAmt", totals.totalTaxAmount, { shouldDirty: false });
    setValue("poDiscAmt", totals.totalDiscountAmount, { shouldDirty: false });
    setValue("totalTaxableAmt", totals.totalTaxableAmount, { shouldDirty: false });
    setValue("netCGSTTaxAmt", totals.totalCGSTAmount, { shouldDirty: false });
    setValue("netSGSTTaxAmt", totals.totalSGSTAmount, { shouldDirty: false });
    setValue("netTot", totals.netTotal, { shouldDirty: false });
    setValue("balanceAmt", totals.grandTotal, { shouldDirty: false });
  }, [grnDetails, watchedDiscount, isDiscountInPercentage, watchedOtherAmount, watchedCoinAdjustment, watchedRoundingAdjustment, setValue, calculateTotals]);

  const handleDiscountToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setValue("discPercentageYN", isChecked ? "Y" : "N", { shouldDirty: true });
    setValue("disc", 0, { shouldDirty: true });
  };

  const handleApplyDiscountClick = () => {
    // Trigger recalculation by calling the parent's apply discount handler
    onApplyDiscount();

    // Also trigger our own recalculation
    const totals = calculateTotals();
    setValue("tot", totals.itemsTotal, { shouldDirty: true });
    setValue("taxAmt", totals.totalTaxAmount, { shouldDirty: true });
    setValue("poDiscAmt", totals.totalDiscountAmount, { shouldDirty: true });
    setValue("netTot", totals.netTotal, { shouldDirty: true });
    setValue("balanceAmt", totals.grandTotal, { shouldDirty: true });
  };

  const allDisabled = disabled || isApproved;

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2.5,
        mt: 2,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
      }}
    >
      <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems="center" mb={2.5}>
        <CustomButton text="Delete All" icon={DeleteAllIcon} color="error" onClick={onDeleteAll} disabled={allDisabled} />
        <CustomButton text="Show History" icon={HistoryIcon} color="warning" onClick={onShowHistory} />
        <CustomButton text="New Issual Department" icon={NewDeptIcon} color="primary" onClick={onNewIssueDepartment} />
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={1} alignItems="center">
          <FormControlLabel
            control={<Switch checked={isDiscountInPercentage} onChange={handleDiscountToggle} disabled={allDisabled} color="primary" />}
            label=""
            title={isDiscountInPercentage ? "Switch to Amount-based Discount" : "Switch to Percentage-based Discount"}
            sx={{ mr: 0 }}
          />
          <EnhancedFormField name="disc" control={control} type="number" placeholder={isDiscountInPercentage ? "Discount %" : "Discount Amt"} size="small" disabled={allDisabled} />
          <CustomButton text="Apply" icon={ApplyIcon} color="secondary" onClick={handleApplyDiscountClick} disabled={allDisabled} />
        </Stack>
      </Stack>

      <Grid container spacing={1}>
        <Grid size={{ xs: 12, md: 2.4, sm: 6 }}>
          <TotalDisplayField label="Items Total">
            <EnhancedFormField name="tot" control={control} type="number" disabled fullWidth variant="outlined" />
          </TotalDisplayField>
        </Grid>
        <Grid size={{ xs: 12, md: 2.4, sm: 6 }}>
          <TotalDisplayField label="Tax Amount">
            <EnhancedFormField name="taxAmt" control={control} type="number" disabled fullWidth variant="outlined" />
          </TotalDisplayField>
        </Grid>
        <Grid size={{ xs: 12, md: 2.4, sm: 6 }}>
          <TotalDisplayField label="PO Disc. Amt">
            <EnhancedFormField name="poDiscAmt" control={control} type="number" disabled fullWidth variant="outlined" />
          </TotalDisplayField>
        </Grid>
        <Grid size={{ xs: 12, md: 2.4, sm: 6 }}>
          <TotalDisplayField label="Rounding Adjustment">
            <EnhancedFormField name="roundingAdjustment" control={control} type="number" fullWidth variant="outlined" disabled={allDisabled} />
          </TotalDisplayField>
        </Grid>
        <Grid size={{ xs: 12, md: 2.4, sm: 6 }}>
          <TotalDisplayField label="Net Total">
            <EnhancedFormField name="netTot" control={control} type="number" disabled fullWidth variant="outlined" />
          </TotalDisplayField>
        </Grid>

        <Grid size={{ xs: 12, md: 2.4, sm: 6 }}>
          <TotalDisplayField label="Others">
            <EnhancedFormField name="otherAmt" control={control} type="number" fullWidth variant="outlined" disabled={allDisabled} />
          </TotalDisplayField>
        </Grid>
        <Grid size={{ xs: 12, md: 2.4, sm: 6 }}>
          <TotalDisplayField label="CGST Total">
            <EnhancedFormField name="netCGSTTaxAmt" control={control} type="number" disabled fullWidth variant="outlined" />
          </TotalDisplayField>
        </Grid>
        <Grid size={{ xs: 12, md: 2.4, sm: 6 }}>
          <TotalDisplayField label="SGST Total">
            <EnhancedFormField name="netSGSTTaxAmt" control={control} type="number" disabled fullWidth variant="outlined" />
          </TotalDisplayField>
        </Grid>
        <Grid size={{ xs: 12, md: 2.4, sm: 6 }}>
          <TotalDisplayField label="Coin Adjustment">
            <EnhancedFormField name="coinAdj" control={control} type="number" fullWidth variant="outlined" disabled={allDisabled} />
          </TotalDisplayField>
        </Grid>
        <Grid size={{ xs: 12, md: 2.4, sm: 6 }}>
          <TotalDisplayField label="Balance">
            <EnhancedFormField name="balanceAmt" control={control} type="number" disabled fullWidth variant="outlined" />
          </TotalDisplayField>
        </Grid>
      </Grid>

      <Box mt={2.5}>
        <EnhancedFormField
          name="rNotes"
          control={control}
          type="textarea"
          label="Remarks"
          fullWidth
          disabled={allDisabled}
          placeholder="Enter any additional remarks or notes for this GRN..."
        />
      </Box>
    </Paper>
  );
};

export default GRNTotalsAndActionsSection;
