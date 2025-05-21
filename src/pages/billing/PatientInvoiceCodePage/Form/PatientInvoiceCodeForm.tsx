import React, { useState, useEffect } from "react";
import { Box, Grid, Typography, Divider, Card, CardContent, Alert, InputAdornment, CircularProgress } from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { BPatTypeDto } from "@/interfaces/Billing/BPatTypeDto";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import SmartButton from "@/components/Button/SmartButton";
import { Save, Cancel, Refresh } from "@mui/icons-material";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import { showAlert } from "@/utils/Common/showAlert";
import { patientInvioceService } from "@/services/BillingServices/BillingGenericService";
import { usePatientInvoiceCode } from "../hooks/usePatientInvoiceCode";

interface PatientInvoiceCodeFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  initialData: BPatTypeDto | null;
  viewOnly?: boolean;
}

const schema = z.object({
  pTypeID: z.number(),
  pTypeCode: z.string().nonempty("Invoice code is required"),
  pTypeName: z.string().nonempty("Invoice name is required"),
  isInsuranceYN: z.string(),
  rActiveYN: z.string(),
  rNotes: z.string().nullable().optional(),
  transferYN: z.string().optional(),
});

type PatientInvoiceCodeFormData = z.infer<typeof schema>;

const PatientInvoiceCodeForm: React.FC<PatientInvoiceCodeFormProps> = ({ open, onClose, initialData, viewOnly = false }) => {
  const { setLoading } = useLoading();
  const { getNextCode } = usePatientInvoiceCode();
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  const isAddMode = !initialData;

  const defaultValues: PatientInvoiceCodeFormData = {
    pTypeID: 0,
    pTypeCode: "",
    pTypeName: "",
    isInsuranceYN: "N",
    rActiveYN: "Y",
    rNotes: "",
    transferYN: "N",
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty, isValid },
  } = useForm<PatientInvoiceCodeFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const rActiveYN = useWatch({ control, name: "rActiveYN" });
  const isInsuranceYN = useWatch({ control, name: "isInsuranceYN" });

  const generateInvoiceCode = async () => {
    if (!isAddMode) return;

    try {
      setIsGeneratingCode(true);
      const nextCode = await getNextCode("PIC", 3);
      if (nextCode) {
        setValue("pTypeCode", nextCode, { shouldValidate: true, shouldDirty: true });
      } else {
        showAlert("Warning", "Failed to generate invoice code", "warning");
      }
    } catch (error) {
      console.error("Error generating invoice code:", error);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      reset(initialData as PatientInvoiceCodeFormData);
    } else {
      reset(defaultValues);
      generateInvoiceCode();
    }
  }, [initialData, reset]);

  const onSubmit = async (data: PatientInvoiceCodeFormData) => {
    if (viewOnly) return;

    setFormError(null);

    try {
      setIsSaving(true);
      setLoading(true);

      const invoiceData: BPatTypeDto = {
        pTypeID: data.pTypeID,
        pTypeCode: data.pTypeCode,
        pTypeName: data.pTypeName,
        isInsuranceYN: data.isInsuranceYN,
        rActiveYN: data.rActiveYN || "Y",
        rNotes: data.rNotes || "",
        transferYN: data.transferYN || "N",
      };

      const response = await patientInvioceService.save(invoiceData);

      if (response.success) {
        showAlert("Success", isAddMode ? "Invoice code created successfully" : "Invoice code updated successfully", "success");
        onClose(true);
      } else {
        throw new Error(response.errorMessage || "Failed to save invoice code");
      }
    } catch (error) {
      console.error("Error saving invoice code:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save invoice code";
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (isDirty) {
      if (window.confirm("Are you sure you want to reset the form? All unsaved changes will be lost.")) {
        reset(initialData ? (initialData as PatientInvoiceCodeFormData) : defaultValues);
        setFormError(null);

        if (isAddMode) {
          generateInvoiceCode();
        }
      }
    } else {
      reset(initialData ? (initialData as PatientInvoiceCodeFormData) : defaultValues);
      setFormError(null);

      if (isAddMode) {
        generateInvoiceCode();
      }
    }
  };

  const dialogTitle = viewOnly ? "View Invoice Code Details" : isAddMode ? "Create New Invoice Code" : `Edit Invoice Code - ${initialData?.pTypeName}`;

  const dialogActions = viewOnly ? (
    <SmartButton text="Close" onClick={() => onClose()} variant="contained" color="primary" />
  ) : (
    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
      <SmartButton
        text="Cancel"
        onClick={() => onClose()}
        variant="outlined"
        color="inherit"
        disabled={isSaving}
        confirmBeforeAction={isDirty}
        confirmationMessage="You have unsaved changes. Are you sure you want to cancel?"
      />
      <Box sx={{ display: "flex", gap: 1 }}>
        <SmartButton text="Reset" onClick={handleReset} variant="outlined" color="error" icon={Cancel} disabled={isSaving || (!isDirty && !formError)} />
        <SmartButton
          text={isAddMode ? "Create Invoice Code" : "Update Invoice Code"}
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
      generateInvoiceCode();
    }
  };

  return (
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
                      name="pTypeCode"
                      control={control}
                      label="Invoice Code"
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
                    <FormField name="pTypeName" control={control} label="Invoice Name" type="text" required disabled={viewOnly} size="small" fullWidth />
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
                  Invoice Settings
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid size={{ sm: 12, md: 6 }}>
                    <FormField name="isInsuranceYN" control={control} label="Insurance" type="switch" disabled={viewOnly} size="small" />
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
                      placeholder="Enter any additional information about this invoice code"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </GenericDialog>
  );
};

export default PatientInvoiceCodeForm;
