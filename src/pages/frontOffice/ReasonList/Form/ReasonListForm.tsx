import React, { useState, useEffect } from "react";
import { Box, Grid, Typography, Divider, Card, CardContent, Alert, InputAdornment, CircularProgress } from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ReasonListData } from "@/interfaces/FrontOffice/ReasonListData";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import SmartButton from "@/components/Button/SmartButton";
import { Save, Cancel, Refresh } from "@mui/icons-material";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import { useAlert } from "@/providers/AlertProvider";
import { useReasonList } from "../hooks/useReasonList";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";

interface ReasonListFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  initialData: ReasonListData | null;
  viewOnly?: boolean;
}

const schema = z.object({
  arlID: z.number(),
  arlCode: z.string().nonempty("Reason code is required"),
  arlName: z.string().nonempty("Reason name is required"),
  arlDuration: z.any(),
  arlDurDesc: z.string().optional(),
  arlColor: z.number().min(0, "Color must be a positive number"),
  rActiveYN: z.string(),
  rNotes: z.string().nullable().optional(),
  transferYN: z.string().optional(),
  rlID: z.number().optional(),
  rlName: z.string().optional(),
});

type ReasonListFormData = z.infer<typeof schema>;

const ReasonListForm: React.FC<ReasonListFormProps> = ({ open, onClose, initialData, viewOnly = false }) => {
  const { setLoading } = useLoading();
  const { getNextCode, saveReason } = useReasonList();
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const { resourceList } = useDropdownValues(["resourceList"]);
  const { showAlert } = useAlert();
  const isAddMode = !initialData;

  const defaultValues: ReasonListFormData = {
    arlID: 0,
    arlCode: "",
    arlName: "",
    arlDuration: 0,
    arlDurDesc: "",
    arlColor: 1,
    rActiveYN: "Y",
    rNotes: "",
    transferYN: "N",
    rlID: 0,
    rlName: "",
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty, isValid },
  } = useForm<ReasonListFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const rActiveYN = useWatch({ control, name: "rActiveYN" });

  const generateReasonCode = async () => {
    if (!isAddMode) return;

    try {
      setIsGeneratingCode(true);
      const nextCode = await getNextCode("RSN", 3);
      if (nextCode) {
        setValue("arlCode", nextCode, { shouldValidate: true, shouldDirty: true });
      } else {
        showAlert("Warning", "Failed to generate reason code", "warning");
      }
    } catch (error) {
      console.error("Error generating reason code:", error);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      reset(initialData as ReasonListFormData);
    } else {
      reset(defaultValues);
      generateReasonCode();
    }
  }, [initialData, reset]);

  const onSubmit = async (data: ReasonListFormData) => {
    if (viewOnly) return;

    setFormError(null);

    try {
      setIsSaving(true);
      setLoading(true);

      const reasonData: ReasonListData = {
        arlID: data.arlID,
        arlCode: data.arlCode,
        arlName: data.arlName,
        arlDuration: Number(data.arlDuration),
        arlDurDesc: data.arlDurDesc || "",
        arlColor: data.arlColor,
        rActiveYN: data.rActiveYN || "Y",
        rNotes: data.rNotes || "",
        transferYN: data.transferYN || "N",
        rlID: data.rlID || 0,
        rlName: data.rlName || "",
      };

      const response = await saveReason(reasonData);

      if (response.success) {
        showAlert("Success", isAddMode ? "Reason created successfully" : "Reason updated successfully", "success");
        onClose(true);
      } else {
        throw new Error(response.errorMessage || "Failed to save reason");
      }
    } catch (error) {
      console.error("Error saving reason:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save reason";
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  const performReset = () => {
    reset(initialData ? (initialData as ReasonListFormData) : defaultValues);
    setFormError(null);

    if (isAddMode) {
      generateReasonCode();
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

  const dialogTitle = viewOnly ? "View Reason Details" : isAddMode ? "Create New Reason" : `Edit Reason - ${initialData?.arlName}`;

  const dialogActions = viewOnly ? (
    <SmartButton text="Close" onClick={() => onClose()} variant="contained" color="primary" />
  ) : (
    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
      <SmartButton text="Cancel" onClick={handleCancel} variant="outlined" color="inherit" disabled={isSaving} />
      <Box sx={{ display: "flex", gap: 1 }}>
        <SmartButton text="Reset" onClick={handleReset} variant="outlined" color="error" icon={Cancel} disabled={isSaving || (!isDirty && !formError)} />
        <SmartButton
          text={isAddMode ? "Create Reason" : "Update Reason"}
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
      generateReasonCode();
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
                        name="arlCode"
                        control={control}
                        label="Reason Code"
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
                      <FormField name="arlName" control={control} label="Reason Name" type="text" required disabled={viewOnly} size="small" fullWidth />
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
                    Reason Settings
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="arlDuration" control={control} label="Duration (minutes)" type="number" required disabled={viewOnly} size="small" inputProps={{ min: 0 }} />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField
                        name="arlDurDesc"
                        control={control}
                        label="Duration Description"
                        type="text"
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        placeholder="E.g., Short, Medium, Long"
                      />
                    </Grid>
                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField
                        name="rlID"
                        control={control}
                        label="Associated Resource"
                        type="select"
                        disabled={viewOnly}
                        size="small"
                        options={resourceList}
                        fullWidth
                        onChange={(value) => {
                          const selectedResource = resourceList?.find((resource) => Number(resource.value) === Number(value.value));
                          setValue("rlName", selectedResource.label);
                        }}
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
                        placeholder="Enter any additional information about this reason"
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

export default ReasonListForm;
