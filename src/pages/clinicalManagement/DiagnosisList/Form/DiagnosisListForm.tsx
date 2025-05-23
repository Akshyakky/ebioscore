import React, { useState, useEffect } from "react";
import { Box, Grid, Typography, Divider, Card, CardContent, Alert, InputAdornment, CircularProgress } from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import SmartButton from "@/components/Button/SmartButton";
import { Save, Cancel, Refresh } from "@mui/icons-material";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import { showAlert } from "@/utils/Common/showAlert";
import { useDiagnosisList } from "../hooks/useDiagnosisList";
import { IcdDetailDto } from "@/interfaces/ClinicalManagement/IcdDetailDto";

interface DiagnosisListFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  initialData: IcdDetailDto | null;
  viewOnly?: boolean;
}

const schema = z.object({
  icddId: z.number(),
  icdmId: z.number().nullable().optional(),
  icddCode: z.string().nonempty("Diagnosis code is required"),
  icddName: z.string().nonempty("Diagnosis name is required"),
  icddCustYN: z.string(),
  icddVer: z.string().optional(),
  icddNameGreek: z.string().optional(),
  rActiveYN: z.string(),
  transferYN: z.string().optional(),
  rNotes: z.string().nullable().optional(),
});

type DiagnosisListFormData = z.infer<typeof schema>;

const DiagnosisListForm: React.FC<DiagnosisListFormProps> = ({ open, onClose, initialData, viewOnly = false }) => {
  const { setLoading } = useLoading();
  const { getNextCode, saveDiagnosis } = useDiagnosisList();
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const isAddMode = !initialData;

  const defaultValues: DiagnosisListFormData = {
    icddId: 0,
    icdmId: 0,
    icddCode: "",
    icddName: "",
    icddCustYN: "N",
    icddVer: "",
    icddNameGreek: "",
    rActiveYN: "Y",
    transferYN: "N",
    rNotes: "",
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty, isValid },
  } = useForm<DiagnosisListFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const rActiveYN = useWatch({ control, name: "rActiveYN" });

  const generateDiagnosisCode = async () => {
    if (!isAddMode) return;

    try {
      setIsGeneratingCode(true);
      const nextCode = await getNextCode("ICD", 4);
      if (nextCode) {
        setValue("icddCode", nextCode, { shouldValidate: true, shouldDirty: true });
      } else {
        showAlert("Warning", "Failed to generate diagnosis code", "warning");
      }
    } catch (error) {
      console.error("Error generating diagnosis code:", error);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      reset(initialData as DiagnosisListFormData);
    } else {
      reset(defaultValues);
      generateDiagnosisCode();
    }
  }, [initialData, reset]);

  const onSubmit = async (data: DiagnosisListFormData) => {
    if (viewOnly) return;

    setFormError(null);

    try {
      setIsSaving(true);
      setLoading(true);

      const diagnosisData: IcdDetailDto = {
        icddId: data.icddId,
        icdmId: data.icdmId,
        icddCode: data.icddCode,
        icddName: data.icddName,
        icddCustYN: data.icddCustYN || "N",
        icddVer: data.icddVer || "",
        icddNameGreek: data.icddNameGreek || "",
        rActiveYN: data.rActiveYN || "Y",
        transferYN: data.transferYN || "N",
        rNotes: data.rNotes || "",
      };

      const response = await saveDiagnosis(diagnosisData);

      if (response.success) {
        showAlert("Success", isAddMode ? "Diagnosis created successfully" : "Diagnosis updated successfully", "success");
        onClose(true);
      } else {
        throw new Error(response.errorMessage || "Failed to save diagnosis");
      }
    } catch (error) {
      console.error("Error saving diagnosis:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save diagnosis";
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
        reset(initialData ? (initialData as DiagnosisListFormData) : defaultValues);
        setFormError(null);

        if (isAddMode) {
          generateDiagnosisCode();
        }
      }
    } else {
      reset(initialData ? (initialData as DiagnosisListFormData) : defaultValues);
      setFormError(null);

      if (isAddMode) {
        generateDiagnosisCode();
      }
    }
  };

  const dialogTitle = viewOnly ? "View Diagnosis Details" : isAddMode ? "Create New Diagnosis" : `Edit Diagnosis - ${initialData?.icddName}`;

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
          text={isAddMode ? "Create Diagnosis" : "Update Diagnosis"}
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
      generateDiagnosisCode();
    }
  };

  const icdMasterOptions = [];

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
                    <FormField name="icdmId" control={control} label="ICD Master" type="select" disabled={viewOnly} size="small" fullWidth options={icdMasterOptions} />
                  </Grid>

                  <Grid size={{ sm: 12, md: 6 }}>
                    <FormField
                      name="icddCode"
                      control={control}
                      label="Diagnosis Code"
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

                  <Grid size={{ sm: 12 }}>
                    <FormField name="icddName" control={control} label="Diagnosis Name" type="text" required disabled={viewOnly} size="small" fullWidth />
                  </Grid>

                  <Grid size={{ sm: 12, md: 6 }}>
                    <FormField name="icddNameGreek" control={control} label="Greek Name" type="text" disabled={viewOnly} size="small" fullWidth />
                  </Grid>

                  <Grid size={{ sm: 12, md: 6 }}>
                    <FormField name="icddVer" control={control} label="Version" type="text" disabled={viewOnly} size="small" fullWidth placeholder="e.g., 2023, v1.0" />
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
                  Diagnosis Settings
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid size={{ sm: 12, md: 6 }}>
                    <FormField name="icddCustYN" control={control} label="Custom Diagnosis" type="switch" disabled={viewOnly} size="small" />
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
                      placeholder="Enter any additional information about this diagnosis"
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

export default DiagnosisListForm;
