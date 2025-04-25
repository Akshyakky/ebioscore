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

  // Format currency values
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

  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <Grid container spacing={2} alignContent={"center"} justifyContent={"center"}>
        {/* Left Section: Discount Area */}
        <FormField
          type="number"
          label={`Total Disc in ${isDiscPercentage ? "Percentage [%]" : "Amount"}`}
          value={totDiscAmtPer}
          onChange={(e) => setTotDiscAmtPer(Number(e.target.value))}
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
          onChange={() => setIsDiscPercentage(!isDiscPercentage)}
          gridProps={{ xs: 2, sm: 1, md: 1 }}
        />
        <Grid size={{ xs: 1, sm: 2, md: 1 }}>
          <Button variant="contained" onClick={handleApplyDiscount}>
            Apply
          </Button>
        </Grid>

        {/* Right Section: Finalize & Dropdown */}
        <FormField
          type="switch"
          label="Finalize PO"
          name="finalizePO"
          ControlID="finalizePO"
          value={purchaseOrderMastData.pOApprovedYN}
          checked={purchaseOrderMastData.pOApprovedYN === "Y"}
          onChange={(e) => handleFinalizeToggle(e.target.checked)}
          gridProps={{ xs: 6, sm: 4, md: 2 }}
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
          gridProps={{ xs: 6, sm: 4, md: 2 }}
        />
      </Grid>
      <Grid container spacing={2}>
        <Stack direction="row" spacing={4} alignItems="center" justifyContent="center" mt={2} flexWrap="wrap">
          {infoItem("Items Total", purchaseOrderMastData.totalAmt || "0.00")}
          {infoItem("Tax Amount", purchaseOrderMastData.taxAmt || "0.00")}
          {infoItem("Disc Amt", purchaseOrderMastData.discAmt || "0.00")}
          {infoItem("Coin Adjustment", purchaseOrderMastData.coinAdjAmt || "0.00")}
          {infoItem("Net Amt", purchaseOrderMastData.netAmt || "0.00")}
        </Stack>
        <FormField
          type="textarea"
          label="Remarks"
          ControlID="rNotes"
          value={purchaseOrderMastData.rNotes || ""}
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
