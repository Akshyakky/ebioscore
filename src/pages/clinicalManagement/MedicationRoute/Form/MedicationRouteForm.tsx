import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import { MedicationRouteDto } from "@/interfaces/ClinicalManagement/MedicationRouteDto";
import { useAlert } from "@/providers/AlertProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Cancel, Refresh, Save, Warning } from "@mui/icons-material";
import { Alert, Box, Card, CardContent, CircularProgress, Divider, Grid, InputAdornment, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { useMedicationRoute } from "../hooks/useMedicationRoute";

interface MedicationRouteFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  initialData: MedicationRouteDto | null;
  viewOnly?: boolean;
}

const schema = z.object({
  mRouteID: z.number(),
  mRouteCode: z.string().nonempty("Route code is required"),
  mRouteName: z.string().nonempty("Route name is required"),
  mRSnomedCode: z.string().optional(),
  defaultYN: z.string(),
  modifyYN: z.string(),
  rActiveYN: z.string(),
  rNotes: z.string().nullable().optional(),
});

type MedicationRouteFormData = z.infer<typeof schema>;

const MedicationRouteForm: React.FC<MedicationRouteFormProps> = ({ open, onClose, initialData, viewOnly = false }) => {
  const { setLoading } = useLoading();
  const { getNextCode, saveMedicationRoute, medicationRouteList } = useMedicationRoute();
  const { showAlert } = useAlert();
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [showDefaultChangeConfirmation, setShowDefaultChangeConfirmation] = useState(false);
  const [currentDefaultRoute, setCurrentDefaultRoute] = useState<MedicationRouteDto | null>(null);
  const [pendingDefaultChange, setPendingDefaultChange] = useState<boolean>(false);
  const isAddMode = !initialData;

  const defaultValues: MedicationRouteFormData = {
    mRouteID: 0,
    mRouteCode: "",
    mRouteName: "",
    mRSnomedCode: "",
    defaultYN: "N",
    modifyYN: "Y",
    rActiveYN: "Y",
    rNotes: "",
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors, isDirty, isValid },
  } = useForm<MedicationRouteFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const rActiveYN = useWatch({ control, name: "rActiveYN" });
  const defaultYN = useWatch({ control, name: "defaultYN" });
  const modifyYN = useWatch({ control, name: "modifyYN" });

  // Find the current default route
  useEffect(() => {
    const existingDefault = medicationRouteList.find((route) => route.defaultYN === "Y" && route.mRouteID !== (initialData?.mRouteID || 0));
    setCurrentDefaultRoute(existingDefault || null);
  }, [medicationRouteList, initialData]);

  // Handle default change logic
  useEffect(() => {
    if (defaultYN === "Y" && currentDefaultRoute && !pendingDefaultChange) {
      // User is trying to set this as default, but another route is already default
      if (initialData?.defaultYN !== "Y") {
        // This wasn't previously default, show confirmation
        setShowDefaultChangeConfirmation(true);
        // Temporarily revert the change until user confirms
        setValue("defaultYN", "N", { shouldValidate: false, shouldDirty: false });
      }
    }
  }, [defaultYN, currentDefaultRoute, initialData, pendingDefaultChange, setValue]);

  const generateRouteCode = async () => {
    if (!isAddMode) return;

    try {
      setIsGeneratingCode(true);
      const nextCode = await getNextCode("ROUTE", 5);
      if (nextCode) {
        setValue("mRouteCode", nextCode, { shouldValidate: true, shouldDirty: true });
      } else {
        showAlert("Warning", "Failed to generate route code", "warning");
      }
    } catch (error) {
      console.error("Error generating route code:", error);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      reset({
        mRouteID: initialData.mRouteID,
        mRouteCode: initialData.mRouteCode || "",
        mRouteName: initialData.mRouteName,
        mRSnomedCode: initialData.mRSnomedCode || "",
        defaultYN: initialData.defaultYN || "N",
        modifyYN: initialData.modifyYN || "Y",
        rActiveYN: (initialData as any).rActiveYN || "Y",
        rNotes: (initialData as any).rNotes || "",
      });
    } else {
      reset(defaultValues);
      generateRouteCode();
    }
  }, [initialData, reset]);

  const handleDefaultChangeConfirm = () => {
    setPendingDefaultChange(true);
    setValue("defaultYN", "Y", { shouldValidate: true, shouldDirty: true });
    setShowDefaultChangeConfirmation(false);
    showAlert("Info", `"${currentDefaultRoute?.mRouteName}" will no longer be the default route when you save this form.`, "info");
  };

  const handleDefaultChangeCancel = () => {
    setShowDefaultChangeConfirmation(false);
    setValue("defaultYN", "N", { shouldValidate: false, shouldDirty: false });
  };

  const onSubmit = async (data: MedicationRouteFormData) => {
    if (viewOnly) return;

    setFormError(null);

    try {
      setIsSaving(true);
      setLoading(true);

      const routeData: MedicationRouteDto = {
        mRouteID: data.mRouteID,
        mRouteCode: data.mRouteCode,
        mRouteName: data.mRouteName,
        mRSnomedCode: data.mRSnomedCode || "",
        defaultYN: data.defaultYN || "N",
        modifyYN: data.modifyYN || "Y",
        ...(data.rActiveYN && { rActiveYN: data.rActiveYN }),
        ...(data.rNotes && { rNotes: data.rNotes }),
      } as any;

      // If setting this route as default, we need to handle the previous default
      if (data.defaultYN === "Y" && currentDefaultRoute) {
        // The backend should handle unsetting the previous default
        // but we'll show a clear message about what happened
        const response = await saveMedicationRoute(routeData);

        if (response.success) {
          showAlert(
            "Success",
            isAddMode
              ? `Medication route created successfully and set as the new default. "${currentDefaultRoute.mRouteName}" is no longer the default.`
              : `Medication route updated successfully and set as the new default. "${currentDefaultRoute.mRouteName}" is no longer the default.`,
            "success"
          );
          onClose(true);
        } else {
          throw new Error(response.errorMessage || "Failed to save medication route");
        }
      } else {
        // Normal save operation
        const response = await saveMedicationRoute(routeData);

        if (response.success) {
          showAlert("Success", isAddMode ? "Medication route created successfully" : "Medication route updated successfully", "success");
          onClose(true);
        } else {
          throw new Error(response.errorMessage || "Failed to save medication route");
        }
      }
    } catch (error) {
      console.error("Error saving medication route:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save medication route";
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setIsSaving(false);
      setLoading(false);
      setPendingDefaultChange(false);
    }
  };

  const performReset = () => {
    reset(
      initialData
        ? {
            mRouteID: initialData.mRouteID,
            mRouteCode: initialData.mRouteCode || "",
            mRouteName: initialData.mRouteName,
            mRSnomedCode: initialData.mRSnomedCode || "",
            defaultYN: initialData.defaultYN || "N",
            modifyYN: initialData.modifyYN || "Y",
            rActiveYN: (initialData as any).rActiveYN || "Y",
            rNotes: (initialData as any).rNotes || "",
          }
        : defaultValues
    );
    setFormError(null);
    setPendingDefaultChange(false);

    if (isAddMode) {
      generateRouteCode();
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

  const dialogTitle = viewOnly ? "View Medication Route Details" : isAddMode ? "Create New Medication Route" : `Edit Medication Route - ${initialData?.mRouteName}`;

  const dialogActions = viewOnly ? (
    <SmartButton text="Close" onClick={() => onClose()} variant="contained" color="primary" />
  ) : (
    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
      <SmartButton text="Cancel" onClick={handleCancel} variant="outlined" color="inherit" disabled={isSaving} />
      <Box sx={{ display: "flex", gap: 1 }}>
        <SmartButton text="Reset" onClick={handleReset} variant="outlined" color="error" icon={Cancel} disabled={isSaving || (!isDirty && !formError)} />
        <SmartButton
          text={isAddMode ? "Create Medication Route" : "Update Medication Route"}
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
      generateRouteCode();
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

          {/* Default Route Information Alert */}
          {currentDefaultRoute && defaultYN === "N" && !viewOnly && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Current Default Route:</strong> "{currentDefaultRoute.mRouteName}" ({currentDefaultRoute.mRouteCode})
              </Typography>
            </Alert>
          )}

          {/* Pending Default Change Alert */}
          {pendingDefaultChange && (
            <Alert severity="warning" sx={{ mb: 2 }} icon={<Warning />}>
              <Typography variant="body2">
                <strong>Default Route Change Pending:</strong> This route will become the new default when saved. "{currentDefaultRoute?.mRouteName}" will no longer be the default.
              </Typography>
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
                        name="mRouteCode"
                        control={control}
                        label="Route Code"
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
                      <FormField name="mRouteName" control={control} label="Route Name" type="text" required disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="mRSnomedCode" control={control} label="SNOMED CT Code" type="text" disabled={viewOnly} size="small" fullWidth />
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
                    Route Settings
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 6 }}>
                      <Box>
                        <FormField name="defaultYN" control={control} label="Default Route" type="switch" disabled={viewOnly} size="small" />
                        {currentDefaultRoute && !viewOnly && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                            {defaultYN === "Y" || pendingDefaultChange
                              ? `Will replace "${currentDefaultRoute.mRouteName}" as default`
                              : `Current default: "${currentDefaultRoute.mRouteName}"`}
                          </Typography>
                        )}
                      </Box>
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="modifyYN" control={control} label="Modifiable" type="switch" disabled={viewOnly} size="small" />
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
                        placeholder="Enter any additional information about this medication route"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </GenericDialog>

      {/* Default Change Confirmation Dialog */}
      <ConfirmationDialog
        open={showDefaultChangeConfirmation}
        onClose={handleDefaultChangeCancel}
        onConfirm={handleDefaultChangeConfirm}
        title="Change Default Route"
        message={`Another route is currently set as the default:\n\n"${currentDefaultRoute?.mRouteName}" (${currentDefaultRoute?.mRouteCode})\n\nSetting this route as the default will automatically remove the default status from the current default route. Do you want to continue?`}
        confirmText="Yes, Change Default"
        cancelText="Cancel"
        type="warning"
        maxWidth="sm"
      />

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

export default MedicationRouteForm;
