import CustomButton from "@/components/Button/CustomButton";
import FormField from "@/components/FormField/FormField";
import { DiscountFooterProps, initialPOMastDto, PurchaseOrderDetailDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import { AppDispatch, RootState } from "@/store";
import { setDiscountFooterField, updateAllPurchaseOrderDetails, updatePurchaseOrderMastField } from "@/store/features/purchaseOrder/purchaseOrderSlice";
import { showAlert } from "@/utils/Common/showAlert";
import { Check, History } from "@mui/icons-material";
import { Grid, Paper, Stack, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PurchaseOrderImportDialog from "./PurchaseOrderImportDialog";

const PurchaseOrderFooter: React.FC = () => {
  const [importPODialogOpen, setImportPODialogOpen] = useState<boolean>(false);
  const dispatch = useDispatch<AppDispatch>();
  const purchaseOrderMastData = useSelector((state: RootState) => state.purchaseOrder.purchaseOrderMastData) ?? initialPOMastDto;
  const purchaseOrderDetails = useSelector((state: RootState) => state.purchaseOrder.purchaseOrderDetails) ?? [];
  const discountFooter = useSelector((state: RootState) => state.purchaseOrder.discountFooter) ?? ({} as DiscountFooterProps);
  const { totDiscAmtPer, isDiscPercentage } = discountFooter ?? ({} as DiscountFooterProps);
  const { pOApprovedYN, pOApprovedID, totalAmt, taxAmt, discAmt, coinAdjAmt, netAmt, rNotes, supplierID, fromDeptID } = purchaseOrderMastData;
  const approvedDisable = useSelector((state: RootState) => state.purchaseOrder.disableApprovedFields) ?? false;
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
  const handleApprovedByChange = (id: number, name: string) => {
    dispatch(updatePurchaseOrderMastField({ field: "pOApprovedID", value: id }));
    dispatch(updatePurchaseOrderMastField({ field: "pOApprovedBy", value: name }));
  };
  const handleRemarksChange = (value: string) => {
    dispatch(updatePurchaseOrderMastField({ field: "rNotes", value: value }));
  };
  const handleFinalizeToggle = (isFinalized: boolean) => {
    dispatch(updatePurchaseOrderMastField({ field: "pOApprovedYN", value: isFinalized ? "Y" : "N" }));
    dispatch(updatePurchaseOrderMastField({ field: "pOYN", value: isFinalized ? "Y" : "N" }));
  };

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

    dispatch(updateAllPurchaseOrderDetails(updatedGridData));
  };

  const recalculateFooterAmounts = (details: PurchaseOrderDetailDto[]) => {
    const itemsTotal = details.reduce((sum, item) => sum + (item.unitPrice || 0) * (item.receivedQty || 0), 0);
    const totalDiscAmt = details.reduce((sum, item) => sum + (item.discAmt || 0), 0);
    const totalCGSTTaxAmt = details.reduce((sum, item) => sum + (item.cgstTaxAmt || 0), 0);
    const totalSGSTTaxAmt = details.reduce((sum, item) => sum + (item.sgstTaxAmt || 0), 0);
    const totalTaxAmt = totalCGSTTaxAmt + totalSGSTTaxAmt;
    const netAmount = itemsTotal + (purchaseOrderMastData.coinAdjAmt || 0) - totalDiscAmt + totalTaxAmt;

    dispatch(updatePurchaseOrderMastField({ field: "totalAmt", value: itemsTotal }));
    dispatch(updatePurchaseOrderMastField({ field: "discAmt", value: totalDiscAmt }));
    dispatch(updatePurchaseOrderMastField({ field: "taxAmt", value: totalTaxAmt }));
    dispatch(updatePurchaseOrderMastField({ field: "netAmt", value: netAmount }));
  };

  useEffect(() => {
    recalculateFooterAmounts(purchaseOrderDetails);
  }, [purchaseOrderDetails]);

  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <Grid container spacing={2} alignContent={"center"} justifyContent={"center"}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <FormField
              type="switch"
              label=""
              name="totDiscAmtPerSwitch"
              ControlID="totDiscAmtPerSwitch"
              value={isDiscPercentage || false}
              checked={isDiscPercentage || false}
              onChange={() => dispatch(setDiscountFooterField({ field: "isDiscPercentage", value: !isDiscPercentage }))}
              disabled={approvedDisable}
              gridProps={{ xs: 2, sm: 1, md: 1 }}
            />
            <FormField
              type="number"
              label={`Total Disc in ${isDiscPercentage ? "Percentage [%]" : "Amount"}`}
              value={totDiscAmtPer}
              onChange={(e) => dispatch(setDiscountFooterField({ field: "totDiscAmtPer", value: Number(e.target.value) }))}
              name="totDiscAmtPer"
              ControlID="totDiscAmtPer"
              disabled={approvedDisable}
              gridProps={{ xs: 4 }}
            />
            <CustomButton onClick={handleApplyDiscount} text={"Apply"} variant="contained" icon={Check} size="medium" color="primary" disabled={approvedDisable} />
            {fromDeptID > 0 && supplierID > 0 && (
              <CustomButton
                onClick={() => {
                  setImportPODialogOpen(true);
                }}
                text={"Import previous"}
                variant="contained"
                icon={History}
                size="medium"
                color="info"
                disabled={approvedDisable}
              />
            )}
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <FormField
              type="switch"
              label="Finalize"
              name="finalizePO"
              ControlID="finalizePO"
              value={pOApprovedYN}
              checked={pOApprovedYN === "Y"}
              onChange={(e) => handleFinalizeToggle(e.target.checked)}
              disabled={approvedDisable}
              gridProps={{ xs: 3 }}
            />
            <FormField
              type="select"
              label="Approved By"
              value={pOApprovedID}
              onChange={(e) => {
                const value = Number(e.target.value);
                const selected = approvedByOptions.find((opt) => Number(opt.value) === value);
                if (selected) {
                  handleApprovedByChange(value, selected.label);
                }
              }}
              name="approvedBy"
              ControlID="approvedBy"
              options={approvedByOptions}
              disabled={approvedDisable}
              isMandatory={pOApprovedYN === "Y"}
              gridProps={{ xs: 6 }}
            />
          </Stack>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Stack direction="row" spacing={4} alignItems="center" justifyContent="center" mt={2} flexWrap="wrap">
          {infoItem("Items Total", totalAmt || "0.00")}
          {infoItem("Tax Amount", taxAmt || "0.00")}
          {infoItem("Disc Amt", discAmt || "0.00")}
          {infoItem("Coin Adjustment", coinAdjAmt || "0.00")}
          {infoItem("Net Amt", netAmt || "0.00")}
        </Stack>
        <FormField
          type="textarea"
          label="Remarks"
          ControlID="rNotes"
          value={rNotes || ""}
          name="rNotes"
          onChange={(e) => {
            handleRemarksChange(e.target.value);
          }}
          maxLength={250}
          rows={1}
          disabled={approvedDisable}
          gridProps={{ xs: 12, sm: 6 }}
        />
      </Grid>
      <PurchaseOrderImportDialog open={importPODialogOpen} onClose={() => setImportPODialogOpen(false)} />
    </Paper>
  );
};

export default PurchaseOrderFooter;
