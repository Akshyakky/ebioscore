// src/pages/billing/Billing/MainPage/components/BillSummarySection.tsx
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import { Box, Card, CardContent, Divider, Grid, Stack, Typography } from "@mui/material";
import React from "react";
import { Control } from "react-hook-form";
import { BillingFormData } from "../types";
import { formatCurrency } from "../utils/billingUtils";

interface BillSummarySectionProps {
  control: Control<BillingFormData>;
  billGrossAmt: number;
  billDiscAmt: number;
  groupDisc: number | undefined;
  finalBillAmount: number;
  serviceCount: number;
  productCount: number;
  calculateDiscountFromPercent: (amount: number, percentage: number) => number;
}

export const BillSummarySection: React.FC<BillSummarySectionProps> = ({
  control,
  billGrossAmt,
  billDiscAmt,
  groupDisc,
  finalBillAmount,
  serviceCount,
  productCount,
  calculateDiscountFromPercent,
}) => {
  const groupDiscountAmount = calculateDiscountFromPercent(billGrossAmt - billDiscAmt, groupDisc || 0);

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Bill Summary
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid size={{ sm: 12, md: 6 }}>
            <Stack spacing={1}>
              <Box display="flex" justifyContent="space-between">
                <Typography>Gross Amount:</Typography>
                <Typography fontWeight="bold">{formatCurrency(billGrossAmt)}</Typography>
              </Box>

              <Box display="flex" justifyContent="space-between">
                <Typography>Item Discounts:</Typography>
                <Typography color="error">-{formatCurrency(billDiscAmt)}</Typography>
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography>Group Discount %:</Typography>
                <Box sx={{ width: 120 }}>
                  <FormField name="groupDisc" control={control} type="number" size="small" min={0} max={100} step={0.01} fullWidth />
                </Box>
              </Box>

              <Box display="flex" justifyContent="space-between">
                <Typography>Group Discount Amount:</Typography>
                <Typography color="error">-{formatCurrency(groupDiscountAmount)}</Typography>
              </Box>

              <Divider />

              <Box display="flex" justifyContent="space-between">
                <Typography variant="h6">Net Amount Payable:</Typography>
                <Typography variant="h6" color="primary">
                  {formatCurrency(finalBillAmount)}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid size={{ sm: 12, md: 6 }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Summary Breakdown:
              </Typography>

              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Total Services:</Typography>
                <Typography variant="body2">{serviceCount}</Typography>
              </Box>

              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Total Products:</Typography>
                <Typography variant="body2">{productCount}</Typography>
              </Box>

              <Divider />

              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" fontWeight="medium">
                  Total Items:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {serviceCount + productCount}
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
