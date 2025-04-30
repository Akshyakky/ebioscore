import FormField from "@/components/FormField/FormField";
import { initialPOMastDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import { AppDispatch, RootState } from "@/store";
import { updateAllPurchaseOrderDetails, updatePurchaseOrderMastField, setTotDiscAmtPer, setIsDiscPercentage } from "@/store/features/purchaseOrder/purchaseOrderSlice";
import { Button, Grid, Paper, Stack, Typography } from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

const PurchaseOrderFooter: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const purchaseOrderMastData = useSelector((state: RootState) => state.purchaseOrder.purchaseOrderMastData) ?? initialPOMastDto;
  const purchaseOrderDetails = useSelector((state: RootState) => state.purchaseOrder.purchaseOrderDetails) ?? [];
  const totDiscAmtPer = useSelector((state: RootState) => state.purchaseOrder.totDiscAmtPer) || 0;
  const isDiscPercentage = useSelector((state: RootState) => state.purchaseOrder.isDiscPercentage) || false;

  const { pOApprovedYN, pOApprovedID, pOApprovedBy, totalAmt, taxAmt, discAmt, coinAdjAmt, netAmt, rNotes } = purchaseOrderMastData;
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
    dispatch(updatePurchaseOrderMastField({ field: "pOApprovedNo", value: isFinalized ? pOApprovedID : 0 }));
    dispatch(updatePurchaseOrderMastField({ field: "pOApprovedBy", value: isFinalized ? pOApprovedBy : "" }));
  };

  const handleApplyDiscount = () => {
    if (purchaseOrderDetails.length === 0) return;

    const updatedGridData = [...purchaseOrderDetails];
    if (isDiscPercentage) {
      updatedGridData.forEach((item, index) => {
        const packPrice = item.packPrice || 0;
        const requiredPack = item.requiredPack || 0;
        const totalPrice = packPrice * requiredPack;

        const discAmt = (totalPrice * totDiscAmtPer) / 100;

        updatedGridData[index] = {
          ...item,
          discAmt,
          discPercentageAmt: totDiscAmtPer,
          totAmt: totalPrice - discAmt,
        };
      });
    } else {
      const totalItemsValue = updatedGridData.reduce((sum, item) => {
        const packPrice = item.packPrice || 0;
        const requiredPack = item.requiredPack || 0;
        return sum + packPrice * requiredPack;
      }, 0);

      if (totalItemsValue > 0) {
        updatedGridData.forEach((item, index) => {
          const packPrice = item.packPrice || 0;
          const requiredPack = item.requiredPack || 0;
          const totalPrice = packPrice * requiredPack;

          const proportion = totalPrice / totalItemsValue;
          const discAmt = totDiscAmtPer * proportion;

          const discPercentageAmt = totalPrice > 0 ? (discAmt / totalPrice) * 100 : 0;

          updatedGridData[index] = {
            ...item,
            discAmt,
            discPercentageAmt,
            totAmt: totalPrice - discAmt,
          };
        });
      }
    }
    dispatch(updateAllPurchaseOrderDetails(updatedGridData));
  };
  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <Grid container spacing={2} alignContent={"center"} justifyContent={"center"}>
        <FormField
          type="number"
          label={`Total Disc in ${isDiscPercentage ? "Percentage [%]" : "Amount"}`}
          value={totDiscAmtPer}
          onChange={(e) => dispatch(setTotDiscAmtPer(Number(e.target.value)))}
          name="totDiscAmtPer"
          ControlID="totDiscAmtPer"
          gridProps={{ xs: 6, sm: 3, md: 2 }}
        />
        <FormField
          type="switch"
          label=""
          name="totDiscAmtPerSwitch"
          ControlID="totDiscAmtPerSwitch"
          value={isDiscPercentage}
          checked={isDiscPercentage}
          onChange={() => dispatch(setIsDiscPercentage(!isDiscPercentage))}
          gridProps={{ xs: 2, sm: 1, md: 1 }}
        />
        <Grid size={{ xs: 1, sm: 2, md: 1 }}>
          <Button variant="contained" onClick={handleApplyDiscount}>
            Apply
          </Button>
        </Grid>

        <FormField
          type="switch"
          label="Finalize PO"
          name="finalizePO"
          ControlID="finalizePO"
          value={pOApprovedYN}
          checked={pOApprovedYN === "Y"}
          onChange={(e) => handleFinalizeToggle(e.target.checked)}
          gridProps={{ xs: 6, sm: 4, md: 2 }}
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
          gridProps={{ xs: 6, sm: 4, md: 2 }}
        />
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
          gridProps={{ xs: 12, sm: 6 }}
        />
      </Grid>
    </Paper>
  );
};

export default PurchaseOrderFooter;
