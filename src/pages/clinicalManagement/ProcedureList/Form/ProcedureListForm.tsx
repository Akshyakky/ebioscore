import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import { OTProcedureListDto } from "@/interfaces/ClinicalManagement/ProcedureListDto";
import { useAlert } from "@/providers/AlertProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Cancel, Refresh, Save } from "@mui/icons-material";
import { Alert, Box, Card, CardContent, CircularProgress, Divider, Grid, InputAdornment, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useProcedureList } from "../hooks/useProcedureListForm";

interface ProcedureFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  initialData: OTProcedureListDto | null;
  viewOnly?: boolean;
}

const schema = z.object({
  procedureID: z.number(),
  procedureCode: z.string().nonempty("Procedure code is required"),
  procedureName: z.string().nonempty("Procedure name is required"),
  procedureNameLong: z.string().optional(),
  procType: z.string().nonempty("Procedure type is required"),
  chargeID: z.number(),
  rActiveYN: z.string(),
  transferYN: z.string(),
  rNotes: z.string().nullable().optional(),
});

type ProcedureFormData = z.infer<typeof schema>;

const ProcedureForm: React.FC<ProcedureFormProps> = ({ open, onClose, initialData, viewOnly = false }) => {
  const { setLoading } = useLoading();
  const { getNextCode, saveProcedure } = useProcedureList();
  const { showAlert } = useAlert();
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const isAddMode = !initialData;

  const defaultValues: ProcedureFormData = {
    procedureID: 0,
    procedureCode: "",
    procedureName: "",
    procedureNameLong: "",
    procType: "",
    chargeID: 0,
    rActiveYN: "Y",
    transferYN: "N",
    rNotes: "",
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isDirty, isValid },
  } = useForm<ProcedureFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const procedureTypeOptions = [
    { value: "HOSP", label: "Hospital" },
    { value: "DR", label: "Doctor" },
  ];

  const generateProcedureCode = async () => {
    if (!isAddMode) return;

    try {
      setIsGeneratingCode(true);
      const nextCode = await getNextCode("PROC", 5);
      if (nextCode) {
        setValue("procedureCode", nextCode, { shouldValidate: true, shouldDirty: true });
      } else {
        showAlert("Warning", "Failed to generate procedure code", "warning");
      }
    } catch (error) {
    } finally {
      setIsGeneratingCode(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      reset({
        procedureID: initialData.procedureID,
        procedureCode: initialData.procedureCode,
        procedureName: initialData.procedureName,
        procedureNameLong: initialData.procedureNameLong || "",
        procType: initialData.procType || "",
        chargeID: initialData.chargeID,
        rActiveYN: initialData.rActiveYN || "Y",
        transferYN: initialData.transferYN || "N",
        rNotes: initialData.rNotes || "",
      });
    } else {
      reset(defaultValues);
      generateProcedureCode();
    }
  }, [initialData, reset]);

  const onSubmit = async (data: ProcedureFormData) => {
    if (viewOnly) return;

    setFormError(null);

    try {
      setIsSaving(true);
      setLoading(true);

      const formData: OTProcedureListDto = {
        procedureID: data.procedureID,
        procedureCode: data.procedureCode,
        procedureName: data.procedureName,
        procedureNameLong: data.procedureNameLong,
        procType: data.procType,
        chargeID: data.chargeID,
        rActiveYN: data.rActiveYN,
        transferYN: data.transferYN,
        rNotes: data.rNotes || "",
      };

      const response = await saveProcedure(formData);

      if (response.success) {
        showAlert("Success", isAddMode ? "Procedure created successfully" : "Procedure updated successfully", "success");
        onClose(true);
      } else {
        throw new Error(response.errorMessage || "Failed to save procedure");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save procedure";
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  const performReset = () => {
    reset(
      initialData
        ? {
            procedureID: initialData.procedureID,
            procedureCode: initialData.procedureCode,
            procedureName: initialData.procedureName,
            procedureNameLong: initialData.procedureNameLong || "",
            procType: initialData.procType || "",
            chargeID: initialData.chargeID,
            rActiveYN: initialData.rActiveYN || "Y",
            transferYN: initialData.transferYN || "N",
            rNotes: initialData.rNotes || "",
          }
        : defaultValues
    );
    setFormError(null);

    if (isAddMode) {
      generateProcedureCode();
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

  const dialogTitle = viewOnly ? "View Procedure Details" : isAddMode ? "Create New Procedure" : `Edit Procedure - ${initialData?.procedureName}`;

  const dialogActions = viewOnly ? (
    <SmartButton text="Close" onClick={() => onClose()} variant="contained" color="primary" />
  ) : (
    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
      <SmartButton
        text="Cancel"
        onClick={handleCancel}
        variant="outlined"
        color="inherit"
        disabled={isSaving}
        confirmBeforeAction={isDirty}
        confirmationMessage="You have unsaved changes. Are you sure you want to cancel?"
      />
      <Box sx={{ display: "flex", gap: 1 }}>
        <SmartButton text="Reset" onClick={handleReset} variant="outlined" color="error" icon={Cancel} disabled={isSaving || (!isDirty && !formError)} />
        <SmartButton
          text={isAddMode ? "Create Procedure" : "Update Procedure"}
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
      generateProcedureCode();
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
            <Grid size={{ sm: 12 }}>
              <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2}>
                <Typography variant="body2" color="text.secondary">
                  Status:
                </Typography>
                <FormField name="rActiveYN" control={control} label="Active" type="switch" disabled={viewOnly} size="small" />
              </Box>
            </Grid>

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
                        name="procedureCode"
                        control={control}
                        label="Procedure Code"
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
                      <FormField name="procedureName" control={control} label="Procedure Name" type="text" required disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12 }}>
                      <FormField
                        name="procedureNameLong"
                        control={control}
                        label="Procedure Long Name"
                        type="text"
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        placeholder="Enter detailed procedure name"
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField
                        name="procType"
                        control={control}
                        label="Procedure Type"
                        type="select"
                        options={procedureTypeOptions}
                        required
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

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
                        placeholder="Enter any additional information about this procedure"
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

export default ProcedureForm;
