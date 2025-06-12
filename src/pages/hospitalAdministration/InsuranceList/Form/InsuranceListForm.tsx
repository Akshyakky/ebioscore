import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import { InsuranceListDto } from "@/interfaces/HospitalAdministration/InsuranceListDto";
import { useAlert } from "@/providers/AlertProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Cancel, Save } from "@mui/icons-material";
import { Alert, Box, Card, CardContent, Divider, Grid, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useInsuranceList } from "../hooks/useInsuranceList";

interface InsuranceListFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  initialData: InsuranceListDto | null;
  viewOnly?: boolean;
}

const schema = z.object({
  insurID: z.number(),
  insurCode: z.string().min(1, "Insurance code is required").max(25, "Insurance code must be 25 characters or less"),
  insurName: z.string().min(1, "Insurance name is required").max(50, "Insurance name must be 50 characters or less"),
  insurStreet: z.string().max(100, "Street must be 100 characters or less").nullable().optional(),
  insurStreet1: z.string().max(100, "Street 1 must be 100 characters or less").nullable().optional(),
  insurCity: z.string().max(50, "City must be 50 characters or less").nullable().optional(),
  insurState: z.string().max(50, "State must be 50 characters or less").nullable().optional(),
  insurCountry: z.string().max(50, "Country must be 50 characters or less").nullable().optional(),
  insurPostCode: z.string().max(20, "Postal code must be 20 characters or less").nullable().optional(),
  insurContact1: z.string().max(50, "Contact 1 must be 50 characters or less").nullable().optional(),
  insurContact2: z.string().max(50, "Contact 2 must be 50 characters or less").nullable().optional(),
  insurPh1: z.string().max(20, "Phone 1 must be 20 characters or less").nullable().optional(),
  insurPh2: z.string().max(20, "Phone 2 must be 20 characters or less").nullable().optional(),
  insurEmail: z.string().email("Invalid email format").max(100, "Email must be 100 characters or less").nullable().optional().or(z.literal("")),
  inCategory: z.string().max(50, "Category must be 50 characters or less").nullable().optional(),
  rActiveYN: z.string(),
  rNotes: z.string().max(4000, "Notes must be 4000 characters or less").nullable().optional(),
  transferYN: z.string(),
});

type InsuranceListFormData = z.infer<typeof schema>;

const InsuranceListForm: React.FC<InsuranceListFormProps> = ({ open, onClose, initialData, viewOnly = false }) => {
  const { setLoading } = useLoading();
  const { saveInsuranceList } = useInsuranceList();
  const { showAlert } = useAlert();
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const isAddMode = !initialData;

  const defaultValues: InsuranceListFormData = {
    insurID: 0,
    insurCode: "",
    insurName: "",
    insurStreet: "",
    insurStreet1: "",
    insurCity: "",
    insurState: "",
    insurCountry: "",
    insurPostCode: "",
    insurContact1: "",
    insurContact2: "",
    insurPh1: "",
    insurPh2: "",
    insurEmail: "",
    inCategory: "",
    rActiveYN: "Y",
    rNotes: "",
    transferYN: "N",
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isValid },
  } = useForm<InsuranceListFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData as InsuranceListFormData);
    } else {
      reset(defaultValues);
    }
  }, [initialData, reset]);

  const onSubmit = async (data: InsuranceListFormData) => {
    if (viewOnly) return;

    setFormError(null);

    try {
      setIsSaving(true);
      setLoading(true);

      const formData: InsuranceListDto = {
        insurID: data.insurID,
        insurCode: data.insurCode,
        insurName: data.insurName,
        insurStreet: data.insurStreet || "",
        insurStreet1: data.insurStreet1 || "",
        insurCity: data.insurCity || "",
        insurState: data.insurState || "",
        insurCountry: data.insurCountry || "",
        insurPostCode: data.insurPostCode || "",
        insurContact1: data.insurContact1 || "",
        insurContact2: data.insurContact2 || "",
        insurPh1: data.insurPh1 || "",
        insurPh2: data.insurPh2 || "",
        insurEmail: data.insurEmail || "",
        inCategory: data.inCategory || "",
        rActiveYN: data.rActiveYN,
        rNotes: data.rNotes || "",
        transferYN: data.transferYN,
      };

      const response = await saveInsuranceList(formData);

      if (response.success) {
        showAlert("Success", isAddMode ? "Insurance created successfully" : "Insurance updated successfully", "success");
        onClose(true);
      } else {
        throw new Error(response.errorMessage || "Failed to save insurance");
      }
    } catch (error) {
      console.error("Error saving insurance:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save insurance";
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  const performReset = () => {
    reset(initialData ? (initialData as InsuranceListFormData) : defaultValues);
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

  const dialogTitle = viewOnly ? "View Insurance Details" : isAddMode ? "Create New Insurance" : `Edit Insurance - ${initialData?.insurName}`;

  const dialogActions = viewOnly ? (
    <SmartButton text="Close" onClick={() => onClose()} variant="contained" color="primary" />
  ) : (
    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
      <SmartButton text="Cancel" onClick={handleCancel} variant="outlined" color="inherit" disabled={isSaving} />
      <Box sx={{ display: "flex", gap: 1 }}>
        <SmartButton text="Reset" onClick={handleReset} variant="outlined" color="error" icon={Cancel} disabled={isSaving || (!isDirty && !formError)} />
        <SmartButton
          text={isAddMode ? "Create Insurance" : "Update Insurance"}
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
        maxWidth="lg"
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
                      <FormField name="insurCode" control={control} label="Insurance Code" type="text" required disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="insurName" control={control} label="Insurance Name" type="text" required disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="inCategory" control={control} label="Category" type="text" disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="insurEmail" control={control} label="Email" type="email" disabled={viewOnly} size="small" fullWidth />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Contact Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="insurContact1" control={control} label="Contact Person 1" type="text" disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="insurContact2" control={control} label="Contact Person 2" type="text" disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="insurPh1" control={control} label="Phone 1" type="text" disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="insurPh2" control={control} label="Phone 2" type="text" disabled={viewOnly} size="small" fullWidth />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Address Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12 }}>
                      <FormField name="insurStreet" control={control} label="Street Address" type="textarea" disabled={viewOnly} size="small" fullWidth rows={2} />
                    </Grid>

                    <Grid size={{ sm: 12, md: 4 }}>
                      <FormField name="insurCity" control={control} label="City" type="text" disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 4 }}>
                      <FormField name="insurState" control={control} label="State" type="text" disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 4 }}>
                      <FormField name="insurCountry" control={control} label="Country" type="text" disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="insurPostCode" control={control} label="Postal Code" type="text" disabled={viewOnly} size="small" fullWidth />
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
                        placeholder="Enter any additional notes about this insurance provider"
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

export default InsuranceListForm;
