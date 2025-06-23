import CustomButton from "@/components/Button/CustomButton";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import { PurchaseOrderDetailDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import { useAlert } from "@/providers/AlertProvider";
import { Check, History } from "@mui/icons-material";
import { Box, FormControl, Grid, Paper, Stack, Typography } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { Control, UseFormSetValue, UseFormWatch } from "react-hook-form";
import PurchaseOrderImportDialog from "./PurchaseOrderImportDialog";

interface PurchaseOrderFooterProps {
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  purchaseOrderDetails: PurchaseOrderDetailDto[];
  onDetailsUpdate: (details: PurchaseOrderDetailDto[]) => void;
  approvedDisable: boolean;
}

const PurchaseOrderFooter: React.FC<PurchaseOrderFooterProps> = ({ control, setValue, watch, purchaseOrderDetails, onDetailsUpdate, approvedDisable }) => {
  const { showAlert } = useAlert();
  const [importPODialogOpen, setImportPODialogOpen] = useState<boolean>(false);

  const isDiscPercentage = watch("discountFooter.isDiscPercentage") || false;
  const totDiscAmtPer = watch("discountFooter.totDiscAmtPer") || 0;
  const pOID = watch("pOID");
  const pOApprovedYN = watch("pOApprovedYN");
  const fromDeptID = watch("fromDeptID");
  const supplierID = watch("supplierID");
  const totalAmt = watch("totalAmt") || 0;
  const taxAmt = watch("taxAmt") || 0;
  const discAmt = watch("discAmt") || 0;
  const coinAdjAmt = watch("coinAdjAmt") || 0;
  const netAmt = watch("netAmt") || 0;

  const approvedByOptions = [
    { value: 1, label: "Dr. Arjun Kumar" },
    { value: 2, label: "Dr. Sneha Rao" },
    { value: 3, label: "Mr. Kiran Patil" },
  ];

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(numValue) ? "0.00" : numValue.toFixed(2);
  };

  const infoItem = (label: string, value: string | number) => (
    <Stack direction="column" spacing={1} alignItems="center" sx={{ minWidth: 140 }}>
      <Typography color="primary" fontWeight="bold">
        {label}
      </Typography>
      <Typography color="primary" fontWeight="bold">
        ₹ {formatCurrency(value)}
      </Typography>
    </Stack>
  );

  const handleApplyDiscount = useCallback(() => {
    if (purchaseOrderDetails.length === 0) return;

    const activeDetails = purchaseOrderDetails.filter((d) => d.rActiveYN === "Y");
    const totalDiscAmtOrPer = totDiscAmtPer || 0;

    // Calculate the total value of all items (base amount before GST and discount)
    const totalItemsValue = activeDetails.reduce((sum, item) => {
      const unitPrice = item.unitPrice || 0;
      const requiredPack = item.requiredPack || 0;
      return sum + unitPrice * requiredPack;
    }, 0);

    // Validation
    if (isDiscPercentage && totalDiscAmtOrPer > 100) {
      showAlert("Warning", "Discount percentage cannot exceed 100%", "warning");
      return;
    }

    if (!isDiscPercentage && totalDiscAmtOrPer > totalItemsValue) {
      showAlert("Warning", "Discount amount cannot exceed total value of items", "warning");
      return;
    }

    const updatedDetails = [...purchaseOrderDetails];

    if (isDiscPercentage) {
      // Apply percentage discount
      updatedDetails.forEach((item) => {
        if (item.rActiveYN === "Y") {
          // Get base values (same as handleCellValueChange)
          const requiredPack = item.requiredPack || 0;
          const unitPack = item.unitPack || 1;
          const unitPrice = item.unitPrice || 0;
          const gstPercentage = item.gstPerValue || 0;

          // Calculate required unit quantity
          item.requiredUnitQty = parseFloat((requiredPack * unitPack).toFixed(2));

          // Calculate base amount (before discount and GST)
          const baseAmount = unitPrice * requiredPack;

          // Apply discount percentage
          item.discPercentageAmt = totalDiscAmtOrPer;
          item.discAmt = parseFloat(((baseAmount * totalDiscAmtOrPer) / 100).toFixed(2));

          // Calculate GST on original base amount (before discount)
          const gstAmount = parseFloat(((baseAmount * gstPercentage) / 100).toFixed(2));
          item.gstTaxAmt = gstAmount;

          // Split GST into CGST and SGST
          item.cgstPerValue = parseFloat((gstPercentage / 2).toFixed(2));
          item.sgstPerValue = parseFloat((gstPercentage / 2).toFixed(2));
          item.cgstTaxAmt = parseFloat((gstAmount / 2).toFixed(2));
          item.sgstTaxAmt = parseFloat((gstAmount / 2).toFixed(2));

          // Calculate final item total: (Base Amount + GST) - Discount
          item.netAmount = parseFloat((baseAmount + gstAmount - item.discAmt).toFixed(2));
        }
      });
    } else {
      // Apply proportional discount amount
      if (totalItemsValue > 0) {
        updatedDetails.forEach((item) => {
          if (item.rActiveYN === "Y") {
            // Get base values (same as handleCellValueChange)
            const requiredPack = item.requiredPack || 0;
            const unitPack = item.unitPack || 1;
            const unitPrice = item.unitPrice || 0;
            const gstPercentage = item.gstPerValue || 0;

            // Calculate required unit quantity
            item.requiredUnitQty = parseFloat((requiredPack * unitPack).toFixed(2));

            // Calculate base amount (before discount and GST)
            const baseAmount = unitPrice * requiredPack;

            // Calculate proportional discount
            const proportion = baseAmount / totalItemsValue;
            item.discAmt = parseFloat((totalDiscAmtOrPer * proportion).toFixed(2));
            item.discPercentageAmt = parseFloat((baseAmount > 0 ? (item.discAmt / baseAmount) * 100 : 0).toFixed(2));

            // Calculate GST on original base amount (before discount)
            const gstAmount = parseFloat(((baseAmount * gstPercentage) / 100).toFixed(2));
            item.gstTaxAmt = gstAmount;

            // Split GST into CGST and SGST
            item.cgstPerValue = parseFloat((gstPercentage / 2).toFixed(2));
            item.sgstPerValue = parseFloat((gstPercentage / 2).toFixed(2));
            item.cgstTaxAmt = parseFloat((gstAmount / 2).toFixed(2));
            item.sgstTaxAmt = parseFloat((gstAmount / 2).toFixed(2));

            // Calculate final item total: (Base Amount + GST) - Discount
            item.netAmount = parseFloat((baseAmount + gstAmount - item.discAmt).toFixed(2));
          }
        });
      }
    }

    onDetailsUpdate(updatedDetails);
    showAlert("Success", "Discount applied successfully", "success");
  }, [purchaseOrderDetails, totDiscAmtPer, isDiscPercentage, onDetailsUpdate, showAlert]);
  const recalculateFooterAmounts = useCallback(() => {
    const activeDetails = purchaseOrderDetails.filter((d) => d.rActiveYN === "Y");

    const itemsTotal = activeDetails.reduce((sum, item) => sum + (item.netAmount || 0), 0);
    const totalDiscAmt = activeDetails.reduce((sum, item) => sum + (item.discAmt || 0), 0);
    const totalGSTTaxAmt = activeDetails.reduce((sum, item) => sum + (item.gstTaxAmt || 0), 0);
    const totalCGSTTaxAmt = activeDetails.reduce((sum, item) => sum + (item.cgstTaxAmt || 0), 0);
    const totalSGSTTaxAmt = activeDetails.reduce((sum, item) => sum + (item.sgstTaxAmt || 0), 0);

    setValue("totalAmt", itemsTotal - totalGSTTaxAmt + totalDiscAmt);
    setValue("discAmt", totalDiscAmt);
    setValue("taxAmt", totalGSTTaxAmt);
    setValue("netCGSTTaxAmt", totalCGSTTaxAmt);
    setValue("netSGSTTaxAmt", totalSGSTTaxAmt);
    setValue("netAmt", itemsTotal);
  }, [purchaseOrderDetails, setValue]);

  useEffect(() => {
    recalculateFooterAmounts();
  }, [purchaseOrderDetails, recalculateFooterAmounts]);

  const handleImportPO = useCallback(
    (importedDetails: PurchaseOrderDetailDto[]) => {
      onDetailsUpdate(importedDetails);
      setImportPODialogOpen(false);
    },
    [onDetailsUpdate]
  );

  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <Grid container spacing={2} alignContent="center" justifyContent="center">
        {!approvedDisable && (
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ mt: 3, ml: 5 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <FormControl>
                  <FormField
                    control={control}
                    type="switch"
                    label=""
                    name="discountFooter.isDiscPercentage"
                    disabled={approvedDisable}
                    onChange={(value) => {
                      setValue("discountFooter.isDiscPercentage", value === "Y");
                      return value;
                    }}
                  />
                </FormControl>
                <FormField
                  control={control}
                  type="number"
                  label={`Total Disc in ${isDiscPercentage ? "Percentage [%]" : "Amount"}`}
                  name="discountFooter.totDiscAmtPer"
                  disabled={approvedDisable}
                />
                <CustomButton
                  onClick={handleApplyDiscount}
                  text="Apply"
                  variant="contained"
                  icon={Check}
                  size="medium"
                  color="primary"
                  disabled={approvedDisable}
                  sx={{ minWidth: 100 }}
                />
                {fromDeptID > 0 && supplierID > 0 && pOID === 0 && (
                  <CustomButton
                    onClick={() => setImportPODialogOpen(true)}
                    text="Import previous"
                    variant="contained"
                    icon={History}
                    size="medium"
                    color="info"
                    disabled={approvedDisable}
                    sx={{ minWidth: 200 }}
                  />
                )}
              </Stack>
            </Box>
          </Grid>
        )}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ mt: 3, ml: 5 }}>
            <Stack direction="row" spacing={5} alignItems="center">
              <FormControl>
                <FormField
                  control={control}
                  type="switch"
                  label="Finalize"
                  name="pOApprovedYN"
                  disabled={approvedDisable}
                  onChange={(value) => {
                    const isFinalized = value === "Y";
                    setValue("pOApprovedYN", isFinalized ? "Y" : "N");
                    return value;
                  }}
                />
              </FormControl>
              <FormField
                control={control}
                type="select"
                label="Approved By"
                name="pOApprovedID"
                options={approvedByOptions}
                disabled={approvedDisable}
                required={pOApprovedYN === "Y"}
                onChange={(value) => {
                  const selected = approvedByOptions.find((opt) => Number(opt.value) === Number(value));
                  if (selected) {
                    setValue("pOApprovedBy", selected.label);
                  }
                  return value;
                }}
              />
            </Stack>
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={2} marginTop={2}>
        <Grid size={{ xs: 12 }}>
          <Stack direction="row" spacing={4} alignItems="center" justifyContent="center" mt={2} flexWrap="wrap">
            {infoItem("Items Total", totalAmt)}
            {infoItem("Tax Amount", taxAmt)}
            {infoItem("Disc Amt", discAmt)}
            {infoItem("Coin Adjustment", coinAdjAmt)}
            {infoItem("Net Amt", netAmt)}
          </Stack>
        </Grid>
        <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
          <FormField control={control} type="textarea" label="Remarks" name="rNotes" rows={2} disabled={approvedDisable} />
        </Grid>
      </Grid>

      <PurchaseOrderImportDialog open={importPODialogOpen} onClose={() => setImportPODialogOpen(false)} fromDeptID={fromDeptID} supplierID={supplierID} onImport={handleImportPO} />
    </Paper>
  );
};

export default PurchaseOrderFooter;
