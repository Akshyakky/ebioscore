import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import { BPayTypeDto } from "@/interfaces/Billing/BPayTypeDto";
import { useAlert } from "@/providers/AlertProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Cancel, Refresh, Save } from "@mui/icons-material";
import { Alert, Box, Card, CardContent, CircularProgress, Divider, Grid, InputAdornment, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { usePaymentTypes } from "../hooks/usePaymentTypes";

interface PaymentTypesFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  initialData: BPayTypeDto | null;
  viewOnly?: boolean;
}

const schema = z.object({
  payID: z.number(),
  payCode: z.string().nonempty("Payment code is required"),
  payName: z.string().nonempty("Payment name is required"),
  payMode: z.string().nonempty("Payment mode is required"),
  bankCharge: z.any(),
  rNotes: z.string().nullable().optional(),
  rActiveYN: z.string(),
  transferYN: z.string().optional(),
});

type PaymentTypesFormData = z.infer<typeof schema>;

const paymentModeOptions = [
  { value: "CASHP", label: "Cash" },
  { value: "CRCDP", label: "Card" },
  { value: "CHEQP", label: "Cheque" },
  { value: "ADJUS", label: "Adjustment" },
  { value: "BNKTR", label: "Bank Transfer" },
  { value: "ONLP", label: "Online Payment" },
  { value: "DSPAY", label: "Department Sales" },
  { value: "INSUP", label: "Insurance Payment" },
  { value: "OTCRP", label: "Other" },
];

const PaymentTypesForm: React.FC<PaymentTypesFormProps> = ({ open, onClose, initialData, viewOnly = false }) => {
  const { setLoading } = useLoading();
  const { getNextCode, savePaymentType } = usePaymentTypes();
  const { showAlert } = useAlert();
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

  const isAddMode = !initialData;

  const defaultValues: PaymentTypesFormData = {
    payID: 0,
    payCode: "",
    payName: "",
    payMode: "CASH",
    bankCharge: 0,
    rNotes: "",
    rActiveYN: "Y",
    transferYN: "N",
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty, isValid },
  } = useForm<PaymentTypesFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const rActiveYN = useWatch({ control, name: "rActiveYN" });
  const payMode = useWatch({ control, name: "payMode" });

  const generatePaymentCode = async () => {
    if (!isAddMode) return;

    try {
      setIsGeneratingCode(true);
      const nextCode = await getNextCode("PAY", 3);
      if (nextCode) {
        setValue("payCode", nextCode, { shouldValidate: true, shouldDirty: true });
      } else {
        showAlert("Warning", "Failed to generate payment code", "warning");
      }
    } catch (error) {
      console.error("Error generating payment code:", error);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      reset(initialData as PaymentTypesFormData);
    } else {
      reset(defaultValues);
      generatePaymentCode();
    }
  }, [initialData, reset]);

  const onSubmit = async (data: PaymentTypesFormData) => {
    if (viewOnly) return;

    setFormError(null);

    try {
      setIsSaving(true);
      setLoading(true);

      const paymentData: BPayTypeDto = {
        payID: data.payID,
        payCode: data.payCode,
        payName: data.payName,
        payMode: data.payMode,
        bankCharge: data.bankCharge,
        rNotes: data.rNotes || "",
        rActiveYN: data.rActiveYN || "Y",
        transferYN: data.transferYN || "N",
      };

      const response = await savePaymentType(paymentData);

      if (response.success) {
        showAlert("Success", isAddMode ? "Payment type created successfully" : "Payment type updated successfully", "success");
        onClose(true);
      } else {
        throw new Error(response.errorMessage || "Failed to save payment type");
      }
    } catch (error) {
      console.error("Error saving payment type:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save payment type";
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  const performReset = () => {
    reset(initialData ? (initialData as PaymentTypesFormData) : defaultValues);
    setFormError(null);

    if (isAddMode) {
      generatePaymentCode();
    }
  };

  const handleReset = () => {
    if (isDirty) {
      setShowResetConfirmation(true);
    } else {
      performReset();
    }
  };

  const handleResetConfirm = () => {
    performReset();
    setShowResetConfirmation(false);
  };

  const handleResetCancel = () => {
    setShowResetConfirmation(false);
  };

  const handleCancel = () => {
    if (isDirty) {
      setShowCancelConfirmation(true);
    } else {
      onClose();
    }
  };

  const handleCancelConfirm = () => {
    setShowCancelConfirmation(false);
    onClose();
  };

  const handleCancelCancel = () => {
    setShowCancelConfirmation(false);
  };

  const dialogTitle = viewOnly ? "View Payment Type Details" : isAddMode ? "Create New Payment Type" : `Edit Payment Type - ${initialData?.payName}`;

  const dialogActions = viewOnly ? (
    <SmartButton text="Close" onClick={() => onClose()} variant="contained" color="primary" />
  ) : (
    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
      <SmartButton text="Cancel" onClick={handleCancel} variant="outlined" color="inherit" disabled={isSaving} />
      <Box sx={{ display: "flex", gap: 1 }}>
        <SmartButton text="Reset" onClick={handleReset} variant="outlined" color="error" icon={Cancel} disabled={isSaving || (!isDirty && !formError)} />
        <SmartButton
          text={isAddMode ? "Create Payment Type" : "Update Payment Type"}
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          color="primary"
          icon={Save}
          asynchronous={true}
          showLoadingIndicator={true}
          loadingText={isAddMode ? "Creating..." : "Updating..."}
          successText={isAddMode ? "Created!" : "Updated!"}
          disabled={isSaving || !isValid}
        />
      </Box>
    </Box>
  );

  const handleRefreshCode = () => {
    if (isAddMode) {
      generatePaymentCode();
    }
  };

  return (
    <>
      <GenericDialog
        open={open}
        onClose={() => onClose()}
        title={dialogTitle}
        maxWidth="md"
        fullWidth
        showCloseButton
        disableBackdropClick={!viewOnly && (isDirty || isSaving)}
        disableEscapeKeyDown={!viewOnly && (isDirty || isSaving)}
        actions={dialogActions}
      >
        <Box component="form" noValidate sx={{ p: 1 }}>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError(null)}>
              {formError}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Status Toggle - Prominent Position */}
            <Grid size={{ sm: 12 }}>
              <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2}>
                <Typography variant="body2" color="text.secondary">
                  Status:
                </Typography>
                <FormField name="rActiveYN" control={control} label="Active" type="switch" disabled={viewOnly} size="small" />
              </Box>
            </Grid>

            {/* Basic Information Section */}
            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField
                        name="payCode"
                        control={control}
                        label="Payment Code"
                        type="text"
                        required
                        disabled={viewOnly || !isAddMode}
                        size="small"
                        fullWidth
                        InputProps={{
                          endAdornment:
                            isAddMode && !viewOnly ? (
                              <InputAdornment position="end">
                                {isGeneratingCode ? (
                                  <CircularProgress size={20} />
                                ) : (
                                  <SmartButton icon={Refresh} variant="text" size="small" onClick={handleRefreshCode} tooltip="Generate new code" sx={{ minWidth: "unset" }} />
                                )}
                              </InputAdornment>
                            ) : null,
                        }}
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="payName" control={control} label="Payment Name" type="text" required disabled={viewOnly} size="small" fullWidth />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Settings Section */}
            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Payment Settings
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField
                        name="payMode"
                        control={control}
                        label="Payment Mode"
                        type="select"
                        required
                        disabled={viewOnly}
                        size="small"
                        options={paymentModeOptions}
                        fullWidth
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField
                        name="bankCharge"
                        control={control}
                        label="Bank Charge (%)"
                        type="number"
                        required
                        disabled={viewOnly}
                        size="small"
                        inputProps={{ min: 0, step: 0.01 }}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Notes Section */}
            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Additional Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12 }}>
                      <FormField
                        name="rNotes"
                        control={control}
                        label="Notes"
                        type="textarea"
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        rows={4}
                        placeholder="Enter any additional information about this payment type"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </GenericDialog>

      <ConfirmationDialog
        open={showResetConfirmation}
        onClose={handleResetCancel}
        onConfirm={handleResetConfirm}
        title="Reset Form"
        message="Are you sure you want to reset the form? All unsaved changes will be lost."
        confirmText="Reset"
        cancelText="Cancel"
        type="warning"
        maxWidth="sm"
      />

      <ConfirmationDialog
        open={showCancelConfirmation}
        onClose={handleCancelCancel}
        onConfirm={handleCancelConfirm}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to cancel?"
        confirmText="Yes, Cancel"
        cancelText="Continue Editing"
        type="warning"
        maxWidth="sm"
      />
    </>
  );
};

export default PaymentTypesForm;
