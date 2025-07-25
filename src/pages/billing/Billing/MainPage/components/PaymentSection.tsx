import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { Add as AddIcon, AttachMoney as AttachMoneyIcon, CreditCard as CreditCardIcon, Delete as DeleteIcon, Info as InfoIcon } from "@mui/icons-material";
import { Alert, AlertTitle, Box, Button, Card, CardContent, Chip, Divider, Grid, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo } from "react";
import { Control, FieldArrayPath, FieldPath, Path, UseFormSetValue, UseFormWatch, useFieldArray } from "react-hook-form";
import { formatCurrency } from "../utils/billingUtils";
interface PaymentDetail {
  paymentID?: number;
  paymentMode?: string;
  paymentCode?: string;
  paymentName?: string;
  paidAmount?: number;
  paymentNote?: string;
  referenceNumber?: string;
  bank?: string;
  branch?: string;
  clientID?: number;
  clientCode?: string;
  clientName?: string;
  transactionNumber?: number;
}

interface PaymentSectionProps<T extends Record<string, any>> {
  control: Control<T>;
  setValue: UseFormSetValue<T>;
  watch: UseFormWatch<T>;
  finalBillAmount: number;
  showTitle?: boolean;
  showPaymentSummary?: boolean;
  paymentFieldName?: FieldArrayPath<T>;
  filterPaymentTypes?: (types: any[]) => any[];
  filterInsuranceList?: (insurers: any[]) => any[];
  excludePaymentModes?: string[];
  includeOnlyPaymentModes?: string[];
  excludePaymentCodes?: string[];
  includeOnlyPaymentCodes?: string[];
  customPaymentFilter?: (paymentType: any) => boolean;
  maxPaymentAmount?: number;
  allowMultiplePayments?: boolean;
  requiredPaymentFields?: string[];
  hidePaymentFields?: string[];
  paymentSectionTitle?: string;
  addPaymentButtonText?: string;
  showBankChargeInfo?: boolean;
  enableGroupedPaymentSummary?: boolean;
}

export const PaymentSection = <T extends Record<string, any>>({
  control,
  setValue,
  watch,
  finalBillAmount,
  showTitle = true,
  showPaymentSummary = true,
  paymentFieldName = "billPaymentDetails" as FieldArrayPath<T>,
  filterPaymentTypes,
  filterInsuranceList,
  excludePaymentModes = [],
  includeOnlyPaymentModes = [],
  excludePaymentCodes = [],
  includeOnlyPaymentCodes = [],
  customPaymentFilter,
  maxPaymentAmount,
  allowMultiplePayments = true,
  requiredPaymentFields = [],
  hidePaymentFields = [],
  paymentSectionTitle = "Payment Details",
  addPaymentButtonText = "Add Payment Method",
  showBankChargeInfo = true,
  enableGroupedPaymentSummary = false,
}: PaymentSectionProps<T>): JSX.Element => {
  const { paymentTypes: allPaymentTypes, insuranceList: allInsuranceList, bank: allBankList } = useDropdownValues(["paymentTypes", "insuranceList", "bank"]);

  const paymentTypes = useMemo(() => {
    let filteredTypes = allPaymentTypes;

    if (customPaymentFilter) {
      filteredTypes = filteredTypes.filter(customPaymentFilter);
    }
    if (excludePaymentModes.length > 0) {
      filteredTypes = filteredTypes.filter((type) => !excludePaymentModes.includes(type.payMode));
    }
    if (includeOnlyPaymentModes.length > 0) {
      filteredTypes = filteredTypes.filter((type) => includeOnlyPaymentModes.includes(type.payMode));
    }
    if (excludePaymentCodes.length > 0) {
      filteredTypes = filteredTypes.filter((type) => !excludePaymentCodes.includes(type.payCode));
    }
    if (includeOnlyPaymentCodes.length > 0) {
      filteredTypes = filteredTypes.filter((type) => includeOnlyPaymentCodes.includes(type.payCode));
    }
    if (filterPaymentTypes) {
      filteredTypes = filterPaymentTypes(filteredTypes);
    }

    return filteredTypes;
  }, [allPaymentTypes, excludePaymentModes, includeOnlyPaymentModes, excludePaymentCodes, includeOnlyPaymentCodes, customPaymentFilter, filterPaymentTypes]);

  const insuranceList = filterInsuranceList ? filterInsuranceList(allInsuranceList) : allInsuranceList;

  const bankList = allBankList || [];
  const {
    fields: paymentFields,
    append: appendPayment,
    remove: removePayment,
  } = useFieldArray({
    control,
    name: paymentFieldName,
  });

  const watchedPaymentDetails = watch(paymentFieldName as Path<T>);
  const totalPaidAmount = useMemo(() => {
    if (!watchedPaymentDetails || !Array.isArray(watchedPaymentDetails)) return 0;
    return watchedPaymentDetails.reduce((sum: number, payment: PaymentDetail) => {
      return sum + (payment?.paidAmount || 0);
    }, 0);
  }, [watchedPaymentDetails]);

  const balance = useMemo(() => {
    return finalBillAmount - totalPaidAmount;
  }, [finalBillAmount, totalPaidAmount]);

  const effectiveMaxAmount = maxPaymentAmount ?? finalBillAmount;

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
      } as any);
    }
  }, [paymentFields.length, appendPayment]);

  const handleAddPayment = useCallback(() => {
    if (!allowMultiplePayments && paymentFields.length >= 1) return;

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
    } as any);
  }, [appendPayment, allowMultiplePayments, paymentFields.length]);

  const handlePaymentTypeChange = useCallback(
    (index: number, data: any) => {
      if (data && typeof data === "object" && "value" in data) {
        const selected = paymentTypes.find((type) => type.payID === data.value);
        if (selected) {
          setValue(`${paymentFieldName}.${index}.paymentID` as FieldPath<T>, selected.payID as any, { shouldDirty: true });
          setValue(`${paymentFieldName}.${index}.paymentMode` as FieldPath<T>, selected.payMode as any, { shouldDirty: true });
          setValue(`${paymentFieldName}.${index}.paymentCode` as FieldPath<T>, selected.payCode as any, { shouldDirty: true });
          setValue(`${paymentFieldName}.${index}.paymentName` as FieldPath<T>, selected.payName as any, { shouldDirty: true });
        }
      }
    },
    [paymentTypes, setValue, paymentFieldName]
  );

  const handleInsuranceChange = useCallback(
    (index: number, data: any) => {
      if (data && typeof data === "object" && "value" in data) {
        const selected = insuranceList.find((type) => type.insurID === data.value);
        if (selected) {
          setValue(`${paymentFieldName}.${index}.clientID` as FieldPath<T>, selected.insurID as any, { shouldDirty: true });
          setValue(`${paymentFieldName}.${index}.clientCode` as FieldPath<T>, selected.insurCode as any, { shouldDirty: true });
          setValue(`${paymentFieldName}.${index}.clientName` as FieldPath<T>, selected.insurName as any, { shouldDirty: true });
        }
      }
    },
    [insuranceList, setValue, paymentFieldName]
  );

  const handleBankChange = useCallback(
    (index: number, data: any) => {
      if (data && typeof data === "object" && "value" in data) {
        const selected = bankList.find((bank) => bank.bankID === data.value);
        if (selected) {
          setValue(`${paymentFieldName}.${index}.bank` as FieldPath<T>, selected.bankName as any, { shouldDirty: true });
        }
      }
    },
    [bankList, setValue, paymentFieldName]
  );

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

  const getSelectedPaymentType = (paymentMode: string) => {
    return paymentTypes.find((type) => type.payMode === paymentMode);
  };

  const isFieldRequired = (fieldName: string) => {
    return requiredPaymentFields.includes(fieldName);
  };

  const isFieldHidden = (fieldName: string) => {
    return hidePaymentFields.includes(fieldName);
  };

  const shouldShowReferenceNumber = (paymentCode: string) => {
    return ["CHK", "CRP", "UPI", "BT"].includes(paymentCode);
  };

  const shouldShowBankField = (paymentCode: string) => {
    return ["CHK", "CRP", "UPI", "BT"].includes(paymentCode);
  };

  const getReferenceNumberLabel = (paymentCode: string) => {
    switch (paymentCode) {
      case "CHK":
        return "Cheque Number";
      case "CRP":
        return "Card Reference Number";
      case "UPI":
        return "UPI Transaction ID";
      case "BT":
        return "Bank Transfer Reference";
      default:
        return "Reference Number";
    }
  };

  const getReferenceNumberPlaceholder = (paymentCode: string) => {
    switch (paymentCode) {
      case "CHK":
        return "Enter cheque number";
      case "CRP":
        return "Enter card reference number";
      case "UPI":
        return "Enter UPI transaction ID";
      case "BT":
        return "Enter bank transfer reference";
      default:
        return "Enter reference number";
    }
  };

  const groupedPaymentSummary = useMemo(() => {
    if (!enableGroupedPaymentSummary || !watchedPaymentDetails || !Array.isArray(watchedPaymentDetails)) return null;

    const grouped = watchedPaymentDetails.reduce((acc: any, payment: PaymentDetail) => {
      const key = payment?.paymentName || payment?.paymentMode || "Unknown";
      if (!acc[key]) {
        acc[key] = { count: 0, total: 0 };
      }
      acc[key].count += 1;
      acc[key].total += payment?.paidAmount || 0;
      return acc;
    }, {});

    return grouped;
  }, [watchedPaymentDetails, enableGroupedPaymentSummary]);

  return (
    <Card variant="outlined">
      <CardContent>
        {showTitle && (
          <>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <CreditCardIcon color="primary" />
                <Typography variant="h6">{paymentSectionTitle}</Typography>
              </Box>
              {allowMultiplePayments && (
                <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={handleAddPayment}>
                  {addPaymentButtonText}
                </Button>
              )}
            </Box>
            <Divider sx={{ mb: 2 }} />
          </>
        )}

        {paymentFields.map((field, index) => {
          const payment = watchedPaymentDetails?.[index];
          const selectedPaymentType = payment ? getSelectedPaymentType(payment.paymentMode || "") : null;
          const bankChargeAmount = selectedPaymentType && payment ? ((payment.paidAmount || 0) * (selectedPaymentType.bankCharge || 0)) / 100 : 0;
          const showPaymentMethodLabel = allowMultiplePayments && paymentFields.length > 1;

          return (
            <Box key={field.id} mb={3}>
              {index > 0 && <Divider sx={{ mb: 2 }} />}

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

              {!showPaymentMethodLabel && paymentFields.length === 1 && allowMultiplePayments && (
                <Box display="flex" justifyContent="flex-end" mb={2}>
                  <Tooltip title="Remove Payment Method">
                    <IconButton size="small" color="error" onClick={() => removePayment(index)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}

              <Grid container spacing={2}>
                {!isFieldHidden("paymentType") && (
                  <Grid size={{ sm: 12, md: 4 }}>
                    <FormField
                      name={`${paymentFieldName}.${index}.paymentType` as FieldPath<T>}
                      control={control}
                      label="Payment Type"
                      type="select"
                      required={isFieldRequired("paymentType")}
                      size="small"
                      fullWidth
                      options={paymentTypes}
                      defaultText="Select Payment Type"
                      onChange={(data) => handlePaymentTypeChange(index, data)}
                    />
                  </Grid>
                )}

                {!isFieldHidden("paidAmount") && (
                  <Grid size={{ sm: 12, md: 4 }}>
                    <FormField
                      name={`${paymentFieldName}.${index}.paidAmount` as FieldPath<T>}
                      control={control}
                      label="Payment Amount"
                      type="number"
                      required={isFieldRequired("paidAmount")}
                      size="small"
                      fullWidth
                      min={0}
                      max={effectiveMaxAmount}
                      step={0.01}
                      placeholder="Enter payment amount"
                    />
                  </Grid>
                )}

                {!isFieldHidden("paymentNote") && (
                  <Grid size={{ sm: 12, md: 4 }}>
                    <FormField
                      name={`${paymentFieldName}.${index}.paymentNote` as FieldPath<T>}
                      control={control}
                      label="Payment Note"
                      type="text"
                      required={isFieldRequired("paymentNote")}
                      size="small"
                      fullWidth
                      placeholder="Enter payment note"
                    />
                  </Grid>
                )}

                {selectedPaymentType && shouldShowReferenceNumber(selectedPaymentType.payCode) && !isFieldHidden("referenceNumber") && (
                  <Grid size={{ sm: 12, md: 4 }}>
                    <FormField
                      name={`${paymentFieldName}.${index}.referenceNumber` as FieldPath<T>}
                      control={control}
                      label={getReferenceNumberLabel(selectedPaymentType.payCode)}
                      type="text"
                      required={isFieldRequired("referenceNumber")}
                      size="small"
                      fullWidth
                      placeholder={getReferenceNumberPlaceholder(selectedPaymentType.payCode)}
                    />
                  </Grid>
                )}

                {selectedPaymentType && shouldShowBankField(selectedPaymentType.payCode) && !isFieldHidden("bank") && (
                  <Grid size={{ sm: 12, md: 4 }}>
                    <FormField
                      name={`${paymentFieldName}.${index}.bank` as FieldPath<T>}
                      control={control}
                      label="Bank Name"
                      type="select"
                      required={isFieldRequired("bank")}
                      size="small"
                      fullWidth
                      options={bankList}
                      defaultText="Select Bank"
                      onChange={(data) => handleBankChange(index, data)}
                    />
                  </Grid>
                )}

                {selectedPaymentType?.payCode === "BT" && !isFieldHidden("branch") && (
                  <Grid size={{ sm: 12, md: 4 }}>
                    <FormField
                      name={`${paymentFieldName}.${index}.branch` as FieldPath<T>}
                      control={control}
                      label="Branch"
                      type="text"
                      required={isFieldRequired("branch")}
                      size="small"
                      fullWidth
                      placeholder="Enter branch"
                    />
                  </Grid>
                )}

                {selectedPaymentType?.payCode === "INSU" && !isFieldHidden("insurance") && (
                  <Grid size={{ sm: 12, md: 4 }}>
                    <FormField
                      name={`${paymentFieldName}.${index}.clientID` as FieldPath<T>}
                      control={control}
                      label="Insurer Name"
                      type="select"
                      required={isFieldRequired("clientID")}
                      size="small"
                      fullWidth
                      options={insuranceList}
                      onChange={(data) => handleInsuranceChange(index, data)}
                    />
                  </Grid>
                )}

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

                        {(selectedPaymentType.bankCharge || 0) > 0 && showBankChargeInfo && (
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

        {showPaymentSummary && (
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

                  {enableGroupedPaymentSummary && groupedPaymentSummary
                    ? Object.entries(groupedPaymentSummary).map(([paymentType, data]: [string, any]) => (
                        <Box key={paymentType} display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2">
                            {paymentType} ({data.count} payment{data.count > 1 ? "s" : ""}):
                          </Typography>
                          <Typography variant="body2">{formatCurrency(data.total)}</Typography>
                        </Box>
                      ))
                    : watchedPaymentDetails &&
                      Array.isArray(watchedPaymentDetails) &&
                      watchedPaymentDetails.length > 1 &&
                      watchedPaymentDetails.map((payment: PaymentDetail, index: number) => (
                        <Box key={index} display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2">
                            Payment {index + 1} ({payment?.paymentName || "Not selected"}):
                          </Typography>
                          <Typography variant="body2">{formatCurrency(payment?.paidAmount || 0)}</Typography>
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
                {watchedPaymentDetails &&
                  Array.isArray(watchedPaymentDetails) &&
                  watchedPaymentDetails.some((payment: PaymentDetail) => {
                    const paymentType = getSelectedPaymentType(payment?.paymentMode || "");
                    return paymentType && (paymentType.bankCharge || 0) > 0;
                  }) &&
                  showBankChargeInfo && (
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
        )}
      </CardContent>
    </Card>
  );
};
