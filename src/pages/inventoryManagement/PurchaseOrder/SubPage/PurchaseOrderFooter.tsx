import FormField from "@/components/FormField/FormField";
import { PurchaseOrderMastDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import { Button, Grid, Paper, Stack, Typography } from "@mui/material";
import React from "react";

// Props
interface PurchaseOrderFooterProps {
  totDiscAmtPer: number;
  setTotDiscAmtPer: (value: number) => void;
  isDiscPercentage: boolean;
  setIsDiscPercentage: (value: boolean) => void;
  handleApplyDiscount: () => void;
  handleApprovedByChange: (id: number, name: string) => void;
  handleRemarksChange: (value: string) => void;
  handleFinalizeToggle: (value: boolean) => void;
  purchaseOrderMastData: PurchaseOrderMastDto;
}

const PurchaseOrderFooter: React.FC<PurchaseOrderFooterProps> = ({
  totDiscAmtPer,
  setTotDiscAmtPer,
  isDiscPercentage,
  setIsDiscPercentage,
  handleApplyDiscount,
  handleApprovedByChange,
  handleRemarksChange,
  handleFinalizeToggle,
  purchaseOrderMastData,
}) => {
  const approvedByOptions = [
    { value: "1", label: "Dr. Arjun Kumar" },
    { value: "2", label: "Dr. Sneha Rao" },
    { value: "3", label: "Mr. Kiran Patil" },
  ];
  const infoItem = (label: string, value: string | number) => (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 140 }}>
      <Typography fontWeight="bold">{label}:</Typography>
      <Typography>{value}</Typography>
    </Stack>
  );
  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <Grid container spacing={2} alignItems="center">
        {/* Left Section: Discount Area */}
        <Grid item xs={12} sm={6}>
          <Stack direction="row" spacing={2} alignItems="center">
            <FormField
              type="number"
              label={`Total Disc in ${isDiscPercentage ? "%" : "Amt"}`}
              value={totDiscAmtPer}
              onChange={(e) => setTotDiscAmtPer(Number(e.target.value))}
              isSubmitted={false}
              name="totDiscAmtPer"
              ControlID="totDiscAmtPer"
              sx={{ minWidth: 180 }}
            />
            <FormField
              type="switch"
              label=""
              name="totDiscAmtPerSwitch"
              ControlID="totDiscAmtPerSwitch"
              value={isDiscPercentage}
              checked={isDiscPercentage}
              onChange={() => setIsDiscPercentage(!isDiscPercentage)}
            />
            <Button variant="contained" onClick={handleApplyDiscount}>
              Apply
            </Button>
          </Stack>
        </Grid>

        {/* Right Section: Finalize & Dropdown */}
        <Grid item xs={12} sm={6}>
          <Stack direction="row" spacing={2} justifyContent="flex-end" alignItems="center">
            <FormField
              type="switch"
              label="Finalize PO"
              name="finalizePO"
              ControlID="finalizePO"
              value={purchaseOrderMastData.pOApprovedYN}
              checked={purchaseOrderMastData.pOApprovedYN === "Y"}
              onChange={(e) => handleFinalizeToggle(e.target.checked)}
            />
            <FormField
              type="select"
              label="Approved By"
              value={purchaseOrderMastData.pOApprovedID}
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
              gridProps={{ sm: 6 }}
            />
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Stack direction="row" spacing={4} alignItems="center" justifyContent="center" mt={2} flexWrap="wrap">
            {infoItem("Items Total", purchaseOrderMastData.totalAmt || "0.00")}
            {infoItem("Tax Amount", purchaseOrderMastData.totalTaxableAmt || "0.00")}
            {infoItem("Disc Amt", purchaseOrderMastData.discAmt || "0.00")}
            {infoItem("Coin Adjustment", purchaseOrderMastData.coinAdjAmt || "0.00")}
            {infoItem("Net Amt", purchaseOrderMastData.netAmt || "0.00")}
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormField
            type="textarea"
            label="Remarks"
            ControlID="rNotes"
            value={purchaseOrderMastData.rNotes}
            name="rNotes"
            onChange={(e) => {
              handleRemarksChange(e.target.value);
            }}
            gridProps={{ xs: 12 }}
            maxLength={250}
            rows={1}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PurchaseOrderFooter;
