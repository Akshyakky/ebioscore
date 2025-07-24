// src/pages/billing/Billing/MainPage/components/PaymentSection.tsx
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { Add as AddIcon, AttachMoney as AttachMoneyIcon, CreditCard as CreditCardIcon, Delete as DeleteIcon, Info as InfoIcon } from "@mui/icons-material";
import { Alert, AlertTitle, Box, Button, Card, CardContent, Chip, Divider, Grid, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo } from "react";
import { Control, UseFormSetValue, UseFormWatch, useFieldArray } from "react-hook-form";
import { BillingFormData } from "../types";
import { formatCurrency } from "../utils/billingUtils";

interface PaymentSectionProps {
  control: Control<BillingFormData>;
  setValue: UseFormSetValue<BillingFormData>;
  watch: UseFormWatch<BillingFormData>;
  finalBillAmount: number;
}

export const PaymentSection: React.FC<PaymentSectionProps> = ({ control, setValue, watch, finalBillAmount }) => {
  const { paymentTypes, insuranceList } = useDropdownValues(["paymentTypes", "insuranceList"]);
  console.log("insuranceList", insuranceList);
  const {
    fields: paymentFields,
    append: appendPayment,
    remove: removePayment,
  } = useFieldArray({
    control,
    name: "billPaymentDetails",
  });

  const watchedPaymentDetails = watch("billPaymentDetails");

  // Calculate total paid amount from all payment methods
  const totalPaidAmount = useMemo(() => {
    return watchedPaymentDetails.reduce((sum, payment) => {
      return sum + (payment.paidAmount || 0);
    }, 0);
  }, [watchedPaymentDetails]);

  // Calculate balance
  const balance = useMemo(() => {
    return finalBillAmount - totalPaidAmount;
  }, [finalBillAmount, totalPaidAmount]);

  // Add default payment method on mount if none exists
  useEffect(() => {
    if (paymentFields.length === 0) {
      appendPayment({
        paymentID: 0,
        paymentMode: "",
        paymentCode: "",
        paymentName: "",
        paidAmount: 0,
        paymentNote: "",
        referenceNumber: "",
        bank: "",
        branch: "",
        clientID: 0,
        clientCode: "",
        clientName: "",
      });
    }
  }, [paymentFields.length, appendPayment]);

  // Add new payment method
  const handleAddPayment = useCallback(() => {
    appendPayment({
      paymentID: 0,
      paymentMode: "",
      paymentCode: "",
      paymentName: "",
      paidAmount: 0,
      paymentNote: "",
      referenceNumber: "",
      bank: "",
      branch: "",
      clientID: 0,
      clientCode: "",
      clientName: "",
    });
  }, [appendPayment]);

  // Handle payment type selection for a specific index
  const handlePaymentTypeChange = useCallback(
    (index: number, data: any) => {
      if (data && typeof data === "object" && "value" in data) {
        const selected = paymentTypes.find((type) => type.payID === data.value);
        if (selected) {
          setValue(`billPaymentDetails.${index}.paymentID`, selected.payID, { shouldDirty: true });
          setValue(`billPaymentDetails.${index}.paymentMode`, selected.payMode, { shouldDirty: true });
          setValue(`billPaymentDetails.${index}.paymentCode`, selected.payCode, { shouldDirty: true });
          setValue(`billPaymentDetails.${index}.paymentName`, selected.payName, { shouldDirty: true });
        }
      }
    },
    [paymentTypes, setValue]
  );
  const handleInsuranceChange = useCallback(
    (index: number, data: any) => {
      console.log("Selected insurer data:", data);
      if (data && typeof data === "object" && "value" in data) {
        const selected = insuranceList.find((type) => type.insurID === data.value);
        if (selected) {
          setValue(`billPaymentDetails.${index}.clientID`, selected.insurID, { shouldDirty: true });
          setValue(`billPaymentDetails.${index}.clientCode`, selected.insurCode, { shouldDirty: true });
          setValue(`billPaymentDetails.${index}.clientName`, selected.insurName, { shouldDirty: true });
        }
      }
    },
    [insuranceList, setValue]
  );

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

  // Get selected payment type for a specific payment
  const getSelectedPaymentType = (paymentMode: string) => {
    return paymentTypes.find((type) => type.payMode === paymentMode);
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <CreditCardIcon color="primary" />
            <Typography variant="h6">Payment Details</Typography>
          </Box>
          <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={handleAddPayment}>
            Add Payment Method
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />

        {/* Payment Methods */}
        {paymentFields.map((field, index) => {
          const payment = watchedPaymentDetails[index];
          const selectedPaymentType = payment ? getSelectedPaymentType(payment.paymentMode) : null;
          const bankChargeAmount = selectedPaymentType && payment ? (payment.paidAmount * selectedPaymentType.bankCharge) / 100 : 0;
          const showPaymentMethodLabel = paymentFields.length > 1;

          return (
            <Box key={field.id} mb={3}>
              {index > 0 && <Divider sx={{ mb: 2 }} />}

              {/* Only show payment method label when there are multiple payment methods */}
              {showPaymentMethodLabel && (
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Payment Method {index + 1}
                  </Typography>
                  <Tooltip title="Remove Payment Method">
                    <IconButton size="small" color="error" onClick={() => removePayment(index)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}

              {/* Show remove button for single payment method without label */}
              {!showPaymentMethodLabel && paymentFields.length === 1 && (
                <Box display="flex" justifyContent="flex-end" mb={2}>
                  <Tooltip title="Remove Payment Method">
                    <IconButton size="small" color="error" onClick={() => removePayment(index)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}

              <Grid container spacing={2}>
                <Grid size={{ sm: 12, md: 4 }}>
                  <FormField
                    name={`billPaymentDetails.${index}.paymentType`}
                    control={control}
                    label="Payment Type"
                    type="select"
                    required
                    size="small"
                    fullWidth
                    options={paymentTypes}
                    defaultText="Select Payment Type"
                    onChange={(data) => handlePaymentTypeChange(index, data)}
                  />
                </Grid>

                <Grid size={{ sm: 12, md: 4 }}>
                  <FormField
                    name={`billPaymentDetails.${index}.paidAmount`}
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

                <Grid size={{ sm: 12, md: 4 }}>
                  <FormField
                    name={`billPaymentDetails.${index}.paymentNote`}
                    control={control}
                    label="Payment Note"
                    type="text"
                    size="small"
                    fullWidth
                    placeholder="Enter payment note"
                  />
                </Grid>

                {/* Additional fields for non-cash payments */}
                {selectedPaymentType && selectedPaymentType.payCode === "BT" && (
                  <>
                    <Grid size={{ sm: 12, md: 4 }}>
                      <FormField
                        name={`billPaymentDetails.${index}.referenceNumber`}
                        control={control}
                        label="Reference Number"
                        type="text"
                        size="small"
                        fullWidth
                        placeholder="Enter reference number"
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 4 }}>
                      <FormField name={`billPaymentDetails.${index}.bank`} control={control} label="Bank Name" type="text" size="small" fullWidth placeholder="Enter bank name" />
                    </Grid>

                    <Grid size={{ sm: 12, md: 4 }}>
                      <FormField name={`billPaymentDetails.${index}.branch`} control={control} label="Branch" type="text" size="small" fullWidth placeholder="Enter branch" />
                    </Grid>
                  </>
                )}
                {/* Additional fields for non-cash payments */}
                {selectedPaymentType && selectedPaymentType.payCode === "INSU" && (
                  <>
                    <Grid size={{ sm: 12, md: 4 }}>
                      <FormField
                        name={`billPaymentDetails.${index}.clientID`}
                        control={control}
                        label="Insurer Name"
                        type="select"
                        size="small"
                        fullWidth
                        options={insuranceList}
                        onChange={(data) => handleInsuranceChange(index, data)}
                      />
                    </Grid>
                  </>
                )}

                {/* Payment method info */}
                {selectedPaymentType && (
                  <Grid size={{ sm: 12 }}>
                    <Box sx={{ p: 1.5, borderRadius: 1 }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center" gap={2}>
                          {getPaymentIcon(selectedPaymentType.payMode)}
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {selectedPaymentType.payName}
                            </Typography>
                            <Box display="flex" gap={1} mt={0.5}>
                              <Chip label={selectedPaymentType.payCode} size="small" variant="outlined" />
                              <Chip label={selectedPaymentType.payMode} size="small" color="primary" variant="outlined" />
                            </Box>
                          </Box>
                        </Box>

                        {selectedPaymentType.bankCharge > 0 && (
                          <Box textAlign="right">
                            <Typography variant="caption" color="text.secondary">
                              Bank Charges ({selectedPaymentType.bankCharge}%)
                            </Typography>
                            <Typography variant="body2" color="error">
                              {formatCurrency(bankChargeAmount)}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          );
        })}

        {/* Payment Summary */}
        <Box sx={{ p: 2, borderRadius: 1, mt: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" mb={2}>
            Payment Summary
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ sm: 12, md: 6 }}>
              <Stack spacing={1.5}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography>Bill Amount:</Typography>
                  <Typography fontWeight="medium">{formatCurrency(finalBillAmount)}</Typography>
                </Box>

                {/* Individual payment breakdown - only show when multiple payments */}
                {watchedPaymentDetails.length > 1 &&
                  watchedPaymentDetails.map((payment, index) => (
                    <Box key={index} display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">
                        Payment {index + 1} ({payment.paymentName || "Not selected"}):
                      </Typography>
                      <Typography variant="body2">{formatCurrency(payment.paidAmount || 0)}</Typography>
                    </Box>
                  ))}

                <Divider />

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography fontWeight="medium">Total Paid:</Typography>
                  <Typography fontWeight="medium" color="primary">
                    {formatCurrency(totalPaidAmount)}
                  </Typography>
                </Box>

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
              {/* Bank charges summary */}
              {watchedPaymentDetails.some((payment) => {
                const paymentType = getSelectedPaymentType(payment.paymentMode);
                return paymentType && paymentType.bankCharge > 0;
              }) && (
                <Alert severity="info" icon={<InfoIcon />}>
                  <AlertTitle>Bank Charges Apply</AlertTitle>
                  Some payment methods include bank charges. These are shown above for each payment method.
                </Alert>
              )}

              {balance !== 0 && (
                <Alert severity={balance > 0 ? "warning" : "info"} sx={{ mt: 2 }}>
                  {balance > 0 ? `Remaining balance of ${formatCurrency(balance)} needs to be paid` : `Excess payment of ${formatCurrency(Math.abs(balance))} will be refunded`}
                </Alert>
              )}
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};
