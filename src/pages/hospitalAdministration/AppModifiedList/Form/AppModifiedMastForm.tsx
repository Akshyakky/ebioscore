import React, { useState, useEffect } from "react";
import { Box, Grid, Typography, Divider, Card, CardContent, Alert } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AppModifiedMast } from "@/interfaces/HospitalAdministration/AppModifiedListDto";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import SmartButton from "@/components/Button/SmartButton";
import { Save, Cancel } from "@mui/icons-material";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import { useAlert } from "@/providers/AlertProvider";
import { useAppModifiedList } from "../hooks/useAppModifiedList";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";

interface AppModifiedMasterFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  initialData: AppModifiedMast | null;
  viewOnly?: boolean;
}

const schema = z.object({
  fieldID: z.number(),
  fieldCode: z.string().nonempty("Field code is required"),
  fieldName: z.string().nonempty("Field name is required"),
  auGrpID: z.number().min(1, "Main module is required"),
  rActiveYN: z.enum(["Y", "N"]),
  transferYN: z.enum(["Y", "N"]),
  rNotes: z.string().nullable().optional(),
});

type AppModifiedMasterFormData = z.infer<typeof schema>;

const AppModifiedMasterForm: React.FC<AppModifiedMasterFormProps> = ({ open, onClose, initialData, viewOnly = false }) => {
  const { setLoading } = useLoading();
  const { showAlert } = useAlert();
  const { saveMaster } = useAppModifiedList();
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const isAddMode = !initialData;

  // Use the dropdown hook for main modules
  const { mainModules, isLoading } = useDropdownValues(["mainModules"]);

  const defaultValues: AppModifiedMasterFormData = {
    fieldID: 0,
    fieldCode: "",
    fieldName: "",
    auGrpID: 0,
    rActiveYN: "Y",
    transferYN: "N",
    rNotes: "",
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isValid },
  } = useForm<AppModifiedMasterFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData as AppModifiedMasterFormData);
    } else {
      reset(defaultValues);
    }
  }, [initialData, reset]);

  const onSubmit = async (data: AppModifiedMasterFormData) => {
    if (viewOnly) return;

    setFormError(null);

    try {
      setIsSaving(true);
      setLoading(true);

      const formData: AppModifiedMast = {
        fieldID: data.fieldID,
        fieldCode: data.fieldCode,
        fieldName: data.fieldName,
        auGrpID: data.auGrpID,
        rActiveYN: data.rActiveYN,
        transferYN: data.transferYN,
        rNotes: data.rNotes || null,
      };

      const response = await saveMaster(formData);

      if (response.success) {
        showAlert("Success", isAddMode ? "List Master created successfully" : "List Master updated successfully", "success");
        onClose(true);
      } else {
        throw new Error(response.errorMessage || "Failed to save List Master");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save List Master";
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  const performReset = () => {
    reset(initialData ? (initialData as AppModifiedMasterFormData) : defaultValues);
    setFormError(null);
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

  const dialogTitle = viewOnly ? "View List Master Details" : isAddMode ? "Create New List Master" : `Edit List Master - ${initialData?.fieldName}`;

  const dialogActions = viewOnly ? (
    <SmartButton text="Close" onClick={() => onClose()} variant="contained" color="primary" />
  ) : (
    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
      <SmartButton text="Cancel" onClick={handleCancel} variant="outlined" color="inherit" disabled={isSaving} />
      <Box sx={{ display: "flex", gap: 1 }}>
        <SmartButton text="Reset" onClick={handleReset} variant="outlined" color="error" icon={Cancel} disabled={isSaving || (!isDirty && !formError)} />
        <SmartButton
          text={isAddMode ? "Create List Master " : "Update List Master"}
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
                      <FormField name="fieldCode" control={control} label="Field Code" type="text" required disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="fieldName" control={control} label="Field Name" type="text" required disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField
                        name="auGrpID"
                        control={control}
                        label="Main Module"
                        type="select"
                        required
                        disabled={viewOnly || isLoading("mainModules")}
                        size="small"
                        fullWidth
                        options={isLoading("mainModules") ? [{ label: "Loading...", value: 0 }] : mainModules || []}
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
                      <FormField name="rNotes" control={control} label="Notes" type="textarea" disabled={viewOnly} size="small" fullWidth rows={4} />
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

export default AppModifiedMasterForm;
