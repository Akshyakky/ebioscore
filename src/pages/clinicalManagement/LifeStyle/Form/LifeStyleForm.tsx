import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { OPIPLifestyleDto } from "@/interfaces/ClinicalManagement/OPIPLifestyleDto";
import { useAlert } from "@/providers/AlertProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Cancel, Save } from "@mui/icons-material";
import { Alert, Box, Card, CardContent, Divider, Grid, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useLifestyle } from "../hook/useLifeStyle";

interface LifeStyleFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  initialData: OPIPLifestyleDto | null;
  viewOnly?: boolean;
}

const schema = z.object({
  opipLSID: z.number(),
  pChartID: z.number().nullable().optional(),
  opipNo: z.number().nullable().optional(),
  opvID: z.number().nullable().optional(),
  opipCaseNo: z.number().nullable().optional(),
  patOpip: z.string().nullable().optional(),
  dietType: z.string().nonempty("Diet type is required"),
  smokingStatus: z.string().nonempty("Smoking status is required"),
  alcoholStatus: z.string().nonempty("Alcohol status is required"),
  exerciseFrequency: z.string().nonempty("Exercise frequency is required"),
  rActiveYN: z.string().default("Y"),
  rNotes: z.string().nullable().optional(),
});

type LifeStyleFormData = z.infer<typeof schema>;

const LifeStyleForm: React.FC<LifeStyleFormProps> = ({ open, onClose, initialData, viewOnly = false }) => {
  const { setLoading } = useLoading();
  const { saveLifestyle } = useLifestyle();
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const { showAlert } = useAlert();

  const { dietType, smokingStatus, exerciseFrequency, alcoholStatus } = useDropdownValues(["dietType", "smokingStatus", "exerciseFrequency", "alcoholStatus"]);
  const isAddMode = !initialData;

  const defaultValues: LifeStyleFormData = {
    opipLSID: 0,
    pChartID: 0,
    opipNo: 0,
    opvID: 0,
    opipCaseNo: 0,
    patOpip: "O",
    dietType: "",
    smokingStatus: "",
    alcoholStatus: "",
    exerciseFrequency: "",
    rActiveYN: "Y",
    rNotes: "",
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isValid },
  } = useForm<LifeStyleFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData as LifeStyleFormData);
    } else {
      reset(defaultValues);
    }
  }, [initialData, reset]);

  const onSubmit = async (data: LifeStyleFormData) => {
    if (viewOnly) return;

    setFormError(null);

    try {
      setIsSaving(true);
      setLoading(true);

      const lifestyleData: OPIPLifestyleDto = {
        opipLSID: data.opipLSID,
        pChartID: data.pChartID,
        opipNo: data.opipNo,
        opvID: data.opvID,
        opipCaseNo: data.opipCaseNo,
        patOpip: data.patOpip,
        dietType: data.dietType,
        smokingStatus: data.smokingStatus,
        alcoholStatus: data.alcoholStatus,
        exerciseFrequency: data.exerciseFrequency,
        rActiveYN: data.rActiveYN || "Y",
        rNotes: data.rNotes || "",
        transferYN: "N",
      };

      const response = await saveLifestyle(lifestyleData);

      if (response.success) {
        showAlert("Success", isAddMode ? "Lifestyle record created successfully" : "Lifestyle record updated successfully", "success");
        onClose(true);
      } else {
        throw new Error(response.errorMessage || "Failed to save lifestyle record");
      }
    } catch (error) {
      console.error("Error saving lifestyle record:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save lifestyle record";
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  const performReset = () => {
    reset(initialData ? (initialData as LifeStyleFormData) : defaultValues);
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

  const dialogTitle = viewOnly ? "View Lifestyle Details" : isAddMode ? "Create New Lifestyle Record" : `Edit Lifestyle Record - Chart ID: ${initialData?.pChartID}`;

  const dialogActions = viewOnly ? (
    <SmartButton text="Close" onClick={() => onClose()} variant="contained" color="primary" />
  ) : (
    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
      <SmartButton text="Cancel" onClick={handleCancel} variant="outlined" color="inherit" disabled={isSaving} />
      <Box sx={{ display: "flex", gap: 1 }}>
        <SmartButton text="Reset" onClick={handleReset} variant="outlined" color="error" icon={Cancel} disabled={isSaving || (!isDirty && !formError)} />
        <SmartButton
          text={isAddMode ? "Create Record" : "Update Record"}
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
            {/* Status Toggle - Prominent Position */}
            <Grid size={{ sm: 12 }}>
              <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2}>
                <Typography variant="body2" color="text.secondary">
                  Status:
                </Typography>
                <FormField name="rActiveYN" control={control} label="Active" type="switch" disabled={viewOnly} size="small" />
              </Box>
            </Grid>

            {/* Lifestyle Details Section */}
            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Lifestyle Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="dietType" control={control} label="Diet Type" type="select" required disabled={viewOnly} size="small" options={dietType} fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField
                        name="smokingStatus"
                        control={control}
                        label="Smoking Status"
                        type="select"
                        required
                        disabled={viewOnly}
                        size="small"
                        options={smokingStatus}
                        fullWidth
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField
                        name="alcoholStatus"
                        control={control}
                        label="Alcohol Status"
                        type="select"
                        required
                        disabled={viewOnly}
                        size="small"
                        options={alcoholStatus}
                        fullWidth
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField
                        name="exerciseFrequency"
                        control={control}
                        label="Exercise Frequency"
                        type="select"
                        required
                        disabled={viewOnly}
                        size="small"
                        options={exerciseFrequency}
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
                    Additional Notes
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
                        placeholder="Enter any additional lifestyle information or notes"
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

export default LifeStyleForm;
