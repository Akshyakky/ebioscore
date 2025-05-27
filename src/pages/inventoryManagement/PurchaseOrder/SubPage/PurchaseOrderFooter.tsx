import React, { useEffect, useState } from "react";
import { Control, useFieldArray, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { Box, FormControl, Grid, Paper, Stack, Typography } from "@mui/material";
import { Check, History } from "@mui/icons-material";
import CustomButton from "@/components/Button/CustomButton";
import { useAlert } from "@/providers/AlertProvider";
import PurchaseOrderImportDialog from "./PurchaseOrderImportDialog";
import { PurchaseOrderDetailDto, PurchaseOrderFormData } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";

interface PurchaseOrderFooterProps {
  control: Control<PurchaseOrderFormData>;
  setValue: UseFormSetValue<PurchaseOrderFormData>;
  watch: UseFormWatch<PurchaseOrderFormData>;
}

const PurchaseOrderFooter: React.FC<PurchaseOrderFooterProps> = ({ control, setValue, watch }) => {
  const [importPODialogOpen, setImportPODialogOpen] = useState<boolean>(false);
  const { showAlert } = useAlert();
  const { fields, update } = useFieldArray({
    control,
    name: "purchaseOrderDetails",
  });
  const purchaseOrderDetails = watch("purchaseOrderDetails");
  const { totDiscAmtPer, isDiscPercentage } = watch("purchaseOrderMast.discountFooter") || {};
  const { pOID, pOApprovedYN, pOApprovedID, totalAmt, taxAmt, discAmt, coinAdjAmt, netAmt, rNotes, supplierID, fromDeptID, disableApprovedFields } = watch("purchaseOrderMast");
  const approvedDisable = disableApprovedFields || false;
  const approvedByOptions = [
    { value: "1", label: "Dr. Arjun Kumar" },
    { value: "2", label: "Dr. Sneha Rao" },
    { value: "3", label: "Mr. Kiran Patil" },
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

  const handleApplyDiscount = () => {
    if (purchaseOrderDetails.length === 0) return;
    const totalDiscAmtOrPer = totDiscAmtPer || 0;
    const updatedGridData = [...purchaseOrderDetails];

    // Calculate the total value of all items
    const totalItemsValue = updatedGridData.reduce((sum, item) => {
      const unitPrice = item.unitPrice || 0;
      const receivedQty = item.receivedQty || 0;
      return sum + unitPrice * receivedQty;
    }, 0);

    // Validation: Check if total discount exceeds total value
    if (isDiscPercentage && totalDiscAmtOrPer > 100) {
      showAlert("", "Discount percentage cannot exceed 100%", "warning");
      return;
    }

    if (!isDiscPercentage && totalDiscAmtOrPer > totalItemsValue) {
      showAlert("", "Discount amount cannot exceed total value of items", "warning");
      return;
    }

    if (isDiscPercentage) {
      updatedGridData.forEach((item, index) => {
        const unitPrice = item.unitPrice || 0;
        const receivedQty = item.receivedQty || 0;
        const totalPrice = unitPrice * receivedQty;

        const discAmt = (totalPrice * totalDiscAmtOrPer) / 100;
        if (discAmt > totalPrice) {
          showAlert("", "Discount amount cannot exceed item value", "warning");
          return;
        }

        updatedGridData[index] = {
          ...item,
          discAmt,
          discPercentageAmt: totalDiscAmtOrPer,
          totAmt: totalPrice - discAmt < 0 ? 0 : totalPrice - discAmt,
        };
      });
    } else {
      if (totalItemsValue > 0) {
        updatedGridData.forEach((item, index) => {
          const unitPrice = item.unitPrice || 0;
          const receivedQty = item.receivedQty || 0;
          const totalPrice = unitPrice * receivedQty;

          const proportion = totalPrice / totalItemsValue;
          const discAmt = totalDiscAmtOrPer * proportion;

          if (discAmt > totalPrice) {
            showAlert("", "Discount amount cannot exceed item value", "warning");
            return;
          }

          const discPercentageAmt = totalPrice > 0 ? (discAmt / totalPrice) * 100 : 0;

          updatedGridData[index] = {
            ...item,
            discAmt,
            discPercentageAmt,
            netAmount: totalPrice - discAmt < 0 ? 0 : totalPrice - discAmt,
          };
        });
      }
    }

    updatedGridData.forEach((item, index) => update(index, item));
  };

  const recalculateFooterAmounts = (details: PurchaseOrderDetailDto[]) => {
    const itemsTotal = details.reduce((sum, item) => sum + (item.unitPrice || 0) * (item.receivedQty || 0), 0);
    const totalDiscAmt = details.reduce((sum, item) => sum + (item.discAmt || 0), 0);
    const totalCGSTTaxAmt = details.reduce((sum, item) => sum + (item.cgstTaxAmt || 0), 0);
    const totalSGSTTaxAmt = details.reduce((sum, item) => sum + (item.sgstTaxAmt || 0), 0);
    const totalTaxAmt = totalCGSTTaxAmt + totalSGSTTaxAmt;
    const netAmount = itemsTotal + (coinAdjAmt || 0) - totalDiscAmt + totalTaxAmt;

    setValue("purchaseOrderMast.totalAmt", itemsTotal);
    setValue("purchaseOrderMast.discAmt", totalDiscAmt);
    setValue("purchaseOrderMast.taxAmt", totalTaxAmt);
    setValue("purchaseOrderMast.netAmt", netAmount);
  };

  useEffect(() => {
    recalculateFooterAmounts(purchaseOrderDetails);
  }, [purchaseOrderDetails, coinAdjAmt, setValue]);
  console.log(purchaseOrderDetails);
  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <Grid container spacing={2} alignContent="center" justifyContent="center">
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ mt: 3, ml: 5 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <FormControl>
                <FormField
                  control={control}
                  type="switch"
                  label=""
                  name="purchaseOrderMast.discountFooter.isDiscPercentage"
                  disabled={approvedDisable}
                  onChange={(value) => {
                    setValue("purchaseOrderMast.discountFooter.isDiscPercentage", value === "Y");
                    return value;
                  }}
                />
              </FormControl>
              <FormField
                control={control}
                type="number"
                label={`Total Disc in ${isDiscPercentage ? "Percentage [%]" : "Amount"}`}
                name="purchaseOrderMast.discountFooter.totDiscAmtPer"
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
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ mt: 3, ml: 5 }}>
            <Stack direction="row" spacing={5} alignItems="center">
              <FormControl>
                <FormField
                  control={control}
                  type="switch"
                  label="Finalize"
                  name="purchaseOrderMast.pOApprovedYN"
                  disabled={approvedDisable}
                  onChange={(value) => {
                    const isFinalized = value === "Y";
                    setValue("purchaseOrderMast.pOApprovedYN", isFinalized ? "Y" : "N");
                    setValue("purchaseOrderMast.pOYN", isFinalized ? "Y" : "N");
                    return value;
                  }}
                />
              </FormControl>
              <FormField
                control={control}
                type="select"
                label="Approved By"
                name="purchaseOrderMast.pOApprovedID"
                options={approvedByOptions}
                disabled={approvedDisable}
                required={pOApprovedYN === "Y"}
                onChange={(value) => {
                  const selected = approvedByOptions.find((opt) => Number(opt.value) === Number(value));
                  if (selected) {
                    setValue("purchaseOrderMast.pOApprovedBy", selected.label);
                  }
                  return value;
                }}
              />
            </Stack>
          </Box>
        </Grid>
      </Grid>
      <Grid container spacing={2} marginTop={2}>
        <Stack direction="row" spacing={4} alignItems="center" justifyContent="center" mt={2} flexWrap="wrap">
          {infoItem("Items Total", totalAmt || "0.00")}
          {infoItem("Tax Amount", taxAmt || "0.00")}
          {infoItem("Disc Amt", discAmt || "0.00")}
          {infoItem("Coin Adjustment", coinAdjAmt || "0.00")}
          {infoItem("Net Amt", netAmt || "0.00")}
        </Stack>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormField control={control} type="textarea" label="Remarks" name="purchaseOrderMast.rNotes" rows={1} disabled={approvedDisable} />
        </Grid>
      </Grid>
      <PurchaseOrderImportDialog open={importPODialogOpen} onClose={() => setImportPODialogOpen(false)} control={control} setValue={setValue} />
    </Paper>
  );
};

export default PurchaseOrderFooter;
