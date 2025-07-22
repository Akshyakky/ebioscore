// src/pages/billing/Billing/MainPage/components/PaymentSection.tsx
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import { paymentTypeService } from "@/services/BillingServices/BillingGenericService";
import { AttachMoney as AttachMoneyIcon, CreditCard as CreditCardIcon, Info as InfoIcon } from "@mui/icons-material";
import { Alert, AlertTitle, Box, Card, CardContent, Chip, Divider, Grid, Stack, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Control, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { BillingFormData, DropdownOption } from "../types";
import { formatCurrency } from "../utils/billingUtils";

interface PaymentType {
  payID: number;
  payCode: string;
  payName: string;
  payMode: string;
  bankCharge: number;
  rActiveYN: string;
  transferYN: string;
  rNotes: string;
}

interface PaymentSectionProps {
  control: Control<BillingFormData>;
  setValue: UseFormSetValue<BillingFormData>;
  watch: UseFormWatch<BillingFormData>;
  finalBillAmount: number;
}

export const PaymentSection: React.FC<PaymentSectionProps> = ({ control, setValue, watch, finalBillAmount }) => {
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [loadingPaymentTypes, setLoadingPaymentTypes] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentType | null>(null);

  const watchedPaymentDetails = watch("billPaymentDetails");
  const paidAmount = watchedPaymentDetails?.paidAmount || 0;

  // Convert payment types to dropdown options
  const paymentTypeOptions: DropdownOption[] = useMemo(() => {
    return paymentTypes.map((type) => ({
      value: type.payID,
      label: type.payName,
    }));
  }, [paymentTypes]);

  // Fetch payment types on mount
  useEffect(() => {
    const fetchPaymentTypes = async () => {
      setLoadingPaymentTypes(true);
      try {
        const response = await paymentTypeService.getAll();
        if (response.success && response.data) {
          setPaymentTypes(response.data);
        }
      } catch (error) {
        console.error("Failed to load payment types:", error);
      } finally {
        setLoadingPaymentTypes(false);
      }
    };
    fetchPaymentTypes();
  }, []);

  // Handle payment type selection
  const handlePaymentTypeChange = useCallback(
    (data: any) => {
      if (data && typeof data === "object" && "value" in data) {
        const selected = paymentTypes.find((type) => type.payID === data.value);
        if (selected) {
          setSelectedPaymentType(selected);
          setValue("billPaymentDetails.paymentMode", selected.payMode, { shouldDirty: true });
          setValue("billPaymentDetails.paymentCode", selected.payCode, { shouldDirty: true });
          setValue("billPaymentDetails.paymentName", selected.payName, { shouldDirty: true });
        }
      }
    },
    [paymentTypes, setValue]
  );

  // Calculate bank charges
  const bankChargeAmount = useMemo(() => {
    if (!selectedPaymentType || !paidAmount) return 0;
    return (paidAmount * selectedPaymentType.bankCharge) / 100;
  }, [selectedPaymentType, paidAmount]);

  // Calculate total amount including bank charges
  const totalAmountWithCharges = useMemo(() => {
    return paidAmount + bankChargeAmount;
  }, [paidAmount, bankChargeAmount]);

  // Calculate balance
  const balance = useMemo(() => {
    return finalBillAmount - paidAmount;
  }, [finalBillAmount, paidAmount]);

  // Get payment mode icon
  const getPaymentIcon = (payMode: string) => {
    switch (payMode) {
      case "CASHP":
        return <AttachMoneyIcon />;
      case "CRCDP":
      case "ONLP":
      case "BNKTR":
        return <CreditCardIcon />;
      default:
        return <AttachMoneyIcon />;
    }
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <CreditCardIcon color="primary" />
          <Typography variant="h6">Payment Details</Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={3}>
          {/* Payment Type Selection */}
          <Grid size={{ sm: 12, md: 4 }}>
            <FormField
              name="paymentType"
              control={control}
              label="Payment Type"
              type="select"
              required
              size="small"
              fullWidth
              options={paymentTypeOptions}
              defaultText="Select Payment Type"
              onChange={handlePaymentTypeChange}
              disabled={loadingPaymentTypes}
            />
          </Grid>

          {/* Payment Amount */}
          <Grid size={{ sm: 12, md: 4 }}>
            <FormField
              name="billPaymentDetails.paidAmount"
              control={control}
              label="Payment Amount"
              type="number"
              required
              size="small"
              fullWidth
              min={0}
              max={finalBillAmount}
              step={0.01}
              placeholder="Enter payment amount"
            />
          </Grid>

          {/* Payment Note */}
          <Grid size={{ sm: 12, md: 4 }}>
            <FormField
              name="billPaymentDetails.paymentNote"
              control={control}
              label="Payment Note/Reference"
              type="text"
              size="small"
              fullWidth
              placeholder="Enter payment reference or note"
            />
          </Grid>

          {/* Payment Summary */}
          <Grid size={{ sm: 12 }}>
            <Box sx={{ bgcolor: "grey.50", p: 2, borderRadius: 1 }}>
              <Grid container spacing={2}>
                <Grid size={{ sm: 12, md: 6 }}>
                  <Stack spacing={1.5}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Payment Summary
                    </Typography>

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography>Bill Amount:</Typography>
                      <Typography fontWeight="medium">{formatCurrency(finalBillAmount)}</Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography>Payment Amount:</Typography>
                      <Typography fontWeight="medium" color="primary">
                        {formatCurrency(paidAmount)}
                      </Typography>
                    </Box>

                    {selectedPaymentType && selectedPaymentType.bankCharge > 0 && (
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography>Bank Charges ({selectedPaymentType.bankCharge}%):</Typography>
                        <Typography color="error">{formatCurrency(bankChargeAmount)}</Typography>
                      </Box>
                    )}

                    {selectedPaymentType && selectedPaymentType.bankCharge > 0 && (
                      <>
                        <Divider />
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography>Total with Charges:</Typography>
                          <Typography fontWeight="medium">{formatCurrency(totalAmountWithCharges)}</Typography>
                        </Box>
                      </>
                    )}

                    <Divider />

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">Balance:</Typography>
                      <Typography variant="h6" color={balance > 0 ? "error" : balance < 0 ? "warning.main" : "success.main"}>
                        {formatCurrency(balance)}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>

                <Grid size={{ sm: 12, md: 6 }}>
                  {selectedPaymentType && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" mb={1.5}>
                        Selected Payment Method
                      </Typography>

                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        {getPaymentIcon(selectedPaymentType.payMode)}
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {selectedPaymentType.payName}
                          </Typography>
                          <Box display="flex" gap={1} mt={0.5}>
                            <Chip label={selectedPaymentType.payCode} size="small" variant="outlined" />
                            <Chip label={selectedPaymentType.payMode} size="small" color="primary" variant="outlined" />
                          </Box>
                        </Box>
                      </Box>

                      {selectedPaymentType.bankCharge > 0 && (
                        <Alert severity="info" icon={<InfoIcon />}>
                          <AlertTitle>Bank Charges Apply</AlertTitle>
                          This payment method includes a {selectedPaymentType.bankCharge}% bank charge
                        </Alert>
                      )}
                    </Box>
                  )}

                  {balance !== 0 && (
                    <Alert severity={balance > 0 ? "warning" : "info"} sx={{ mt: 2 }}>
                      {balance > 0 ? `Remaining balance of ${formatCurrency(balance)} needs to be paid` : `Excess payment of ${formatCurrency(Math.abs(balance))} will be refunded`}
                    </Alert>
                  )}
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
