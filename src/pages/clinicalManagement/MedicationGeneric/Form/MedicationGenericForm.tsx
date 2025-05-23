import React, { useState, useEffect } from "react";
import { Box, Grid, Typography, Divider, Card, CardContent, Alert, InputAdornment, CircularProgress } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MedicationGenericDto } from "@/interfaces/ClinicalManagement/MedicationGenericDto";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import SmartButton from "@/components/Button/SmartButton";
import { Save, Cancel, Refresh } from "@mui/icons-material";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import { showAlert } from "@/utils/Common/showAlert";
import { useMedicationGeneric } from "../hooks/useMedicationGeneric";

interface MedicationGenericFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  initialData: MedicationGenericDto | null;
  viewOnly?: boolean;
}

const schema = z.object({
  mGenID: z.number(),
  mGenCode: z.string().nonempty("Generic code is required"),
  mGenName: z.string().nonempty("Generic name is required"),
  modifyYN: z.string(),
  defaultYN: z.string(),
  rActiveYN: z.string(),
  transferYN: z.string(),
  rNotes: z.string().nullable().optional(),
  mSnomedCode: z.string().nullable().optional(),
});

type MedicationGenericFormData = z.infer<typeof schema>;

const MedicationGenericForm: React.FC<MedicationGenericFormProps> = ({ open, onClose, initialData, viewOnly = false }) => {
  const { setLoading } = useLoading();
  const { getNextCode, saveMedicationGeneric } = useMedicationGeneric();
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const isAddMode = !initialData;

  const defaultValues: MedicationGenericFormData = {
    mGenID: 0,
    mGenCode: "",
    mGenName: "",
    modifyYN: "Y",
    defaultYN: "N",
    rActiveYN: "Y",
    transferYN: "N",
    rNotes: "",
    mSnomedCode: "",
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty, isValid },
  } = useForm<MedicationGenericFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const generateGenericCode = async () => {
    if (!isAddMode) return;

    try {
      setIsGeneratingCode(true);
      const nextCode = await getNextCode("GEN", 3);
      if (nextCode) {
        setValue("mGenCode", nextCode, { shouldValidate: true, shouldDirty: true });
      } else {
        showAlert("Warning", "Failed to generate generic code", "warning");
      }
    } catch (error) {
      console.error("Error generating generic code:", error);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      reset({
        mGenID: initialData.mGenID,
        mGenCode: initialData.mGenCode,
        mGenName: initialData.mGenName,
        modifyYN: initialData.modifyYN || "Y",
        defaultYN: initialData.defaultYN || "N",
        rActiveYN: initialData.rActiveYN || "Y",
        transferYN: initialData.transferYN || "N",
        rNotes: initialData.rNotes || "",
        mSnomedCode: initialData.mSnomedCode || "",
      });
    } else {
      reset(defaultValues);
      generateGenericCode();
    }
  }, [initialData, reset]);

  const onSubmit = async (data: MedicationGenericFormData) => {
    if (viewOnly) return;

    setFormError(null);

    try {
      setIsSaving(true);
      setLoading(true);

      const genericData: MedicationGenericDto = {
        mGenID: data.mGenID,
        mGenCode: data.mGenCode,
        mGenName: data.mGenName,
        modifyYN: data.modifyYN,
        defaultYN: data.defaultYN,
        rActiveYN: data.rActiveYN,
        transferYN: data.transferYN,
        rNotes: data.rNotes || "",
        mSnomedCode: data.mSnomedCode || "",
      };

      const response = await saveMedicationGeneric(genericData);

      if (response.success) {
        showAlert("Success", isAddMode ? "Generic medication created successfully" : "Generic medication updated successfully", "success");
        onClose(true);
      } else {
        throw new Error(response.errorMessage || "Failed to save generic medication");
      }
    } catch (error) {
      console.error("Error saving generic medication:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save generic medication";
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
            mGenID: initialData.mGenID,
            mGenCode: initialData.mGenCode,
            mGenName: initialData.mGenName,
            modifyYN: initialData.modifyYN || "Y",
            defaultYN: initialData.defaultYN || "N",
            rActiveYN: initialData.rActiveYN || "Y",
            transferYN: initialData.transferYN || "N",
            rNotes: initialData.rNotes || "",
            mSnomedCode: initialData.mSnomedCode || "",
          }
        : defaultValues
    );
    setFormError(null);

    if (isAddMode) {
      generateGenericCode();
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

  const dialogTitle = viewOnly ? "View Generic Medication Details" : isAddMode ? "Create New Generic Medication" : `Edit Generic Medication - ${initialData?.mGenName}`;

  const dialogActions = viewOnly ? (
    <SmartButton text="Close" onClick={() => onClose()} variant="contained" color="primary" />
  ) : (
    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
      <SmartButton text="Cancel" onClick={handleCancel} variant="outlined" color="inherit" disabled={isSaving} />
      <Box sx={{ display: "flex", gap: 1 }}>
        <SmartButton text="Reset" onClick={handleReset} variant="outlined" color="error" icon={Cancel} disabled={isSaving || (!isDirty && !formError)} />
        <SmartButton
          text={isAddMode ? "Create Generic Medication" : "Update Generic Medication"}
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
      generateGenericCode();
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
                        name="mGenCode"
                        control={control}
                        label="Generic Code"
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
                      <FormField name="mGenName" control={control} label="Generic Name" type="text" required disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="mSnomedCode" control={control} label="SNOMED Code" type="text" disabled={viewOnly} size="small" fullWidth />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Generic Medication Settings
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 4 }}>
                      <FormField name="defaultYN" control={control} label="Set as Default" type="switch" disabled={viewOnly} size="small" />
                    </Grid>

                    <Grid size={{ sm: 12, md: 4 }}>
                      <FormField name="modifyYN" control={control} label="Allow Modification" type="switch" disabled={viewOnly} size="small" />
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
                        placeholder="Enter any additional information about this generic medication"
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

export default MedicationGenericForm;
