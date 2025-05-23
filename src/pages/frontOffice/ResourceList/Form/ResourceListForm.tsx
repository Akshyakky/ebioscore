import React, { useState, useEffect } from "react";
import { Box, Grid, Typography, Divider, Card, CardContent, Alert, InputAdornment, CircularProgress } from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ResourceListData } from "@/interfaces/FrontOffice/ResourceListData";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import SmartButton from "@/components/Button/SmartButton";
import { Save, Cancel, Refresh } from "@mui/icons-material";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import { showAlert } from "@/utils/Common/showAlert";
import { useResourceList } from "../hooks/useResourceList";

interface ResourceListFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  initialData: ResourceListData | null;
  viewOnly?: boolean;
}

const schema = z.object({
  rLID: z.number(),
  rLCode: z.string().nonempty("Resource code is required"),
  rLName: z.string().nonempty("Resource name is required"),
  rLValidateYN: z.string().nonempty("Validation status is required"),
  rLOtYN: z.string().nonempty("OT status is required"),
  rActiveYN: z.string(),
  rNotes: z.string().nullable().optional(),
  transferYN: z.string().optional(),
});

type ResourceListFormData = z.infer<typeof schema>;

const ResourceListForm: React.FC<ResourceListFormProps> = ({ open, onClose, initialData, viewOnly = false }) => {
  const { setLoading } = useLoading();
  const { getNextCode, saveResource } = useResourceList();
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

  const isAddMode = !initialData;

  const defaultValues: ResourceListFormData = {
    rLID: 0,
    rLCode: "",
    rLName: "",
    rLValidateYN: "N",
    rLOtYN: "N",
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
  } = useForm<ResourceListFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const rActiveYN = useWatch({ control, name: "rActiveYN" });

  const generateResourceCode = async () => {
    if (!isAddMode) return;

    try {
      setIsGeneratingCode(true);
      const nextCode = await getNextCode("RES", 3);
      if (nextCode) {
        setValue("rLCode", nextCode, { shouldValidate: true, shouldDirty: true });
      } else {
        showAlert("Warning", "Failed to generate resource code", "warning");
      }
    } catch (error) {
      console.error("Error generating resource code:", error);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      reset(initialData as ResourceListFormData);
    } else {
      reset(defaultValues);
      generateResourceCode();
    }
  }, [initialData, reset]);

  const onSubmit = async (data: ResourceListFormData) => {
    if (viewOnly) return;

    setFormError(null);

    try {
      setIsSaving(true);
      setLoading(true);

      const resourceData: ResourceListData = {
        rLID: data.rLID,
        rLCode: data.rLCode,
        rLName: data.rLName,
        rLValidateYN: data.rLValidateYN,
        rLOtYN: data.rLOtYN,
        rActiveYN: data.rActiveYN || "Y",
        rNotes: data.rNotes,
        transferYN: data.transferYN || "N",
      };

      const response = await saveResource(resourceData);

      if (response.success) {
        showAlert("Success", isAddMode ? "Resource created successfully" : "Resource updated successfully", "success");
        onClose(true);
      } else {
        throw new Error(response.errorMessage || "Failed to save resource");
      }
    } catch (error) {
      console.error("Error saving resource:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save resource";
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  const performReset = () => {
    reset(initialData ? (initialData as ResourceListFormData) : defaultValues);
    setFormError(null);

    if (isAddMode) {
      generateResourceCode();
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

  const dialogTitle = viewOnly ? "View Resource Details" : isAddMode ? "Create New Resource" : `Edit Resource - ${initialData?.rLName}`;

  const dialogActions = viewOnly ? (
    <SmartButton text="Close" onClick={() => onClose()} variant="contained" color="primary" />
  ) : (
    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
      <SmartButton text="Cancel" onClick={handleCancel} variant="outlined" color="inherit" disabled={isSaving} />
      <Box sx={{ display: "flex", gap: 1 }}>
        <SmartButton text="Reset" onClick={handleReset} variant="outlined" color="error" icon={Cancel} disabled={isSaving || (!isDirty && !formError)} />
        <SmartButton
          text={isAddMode ? "Create Resource" : "Update Resource"}
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
      generateResourceCode();
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
                        name="rLCode"
                        control={control}
                        label="Resource Code"
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
                      <FormField name="rLName" control={control} label="Resource Name" type="text" required disabled={viewOnly} size="small" fullWidth />
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
                    Resource Settings
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="rLValidateYN" control={control} label="Validate" type="switch" disabled={viewOnly} size="small" />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="rLOtYN" control={control} label="OT" type="switch" disabled={viewOnly} size="small" />
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
                        placeholder="Enter any additional information about this resource"
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

export default ResourceListForm;
