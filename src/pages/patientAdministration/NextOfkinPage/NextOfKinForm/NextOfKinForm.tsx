import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Grid, Box, Typography, Divider, Card, CardContent, Alert } from "@mui/material";
import { Save as SaveIcon, Cancel as CancelIcon } from "@mui/icons-material";
import { PatNokDetailsDto } from "@/interfaces/PatientAdministration/PatNokDetailsDto";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import { useServerDate } from "@/hooks/Common/useServerDate";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { useLoading } from "@/hooks/Common/useLoading";

interface NextOfKinFormProps {
  onSave: (data: PatNokDetailsDto) => Promise<void>;
  onCancel: () => void;
  initialData?: PatNokDetailsDto | null;
  pChartID: number;
  pChartCode: string;
  viewOnly?: boolean;
}

const schema = z.object({
  pNokTitleVal: z.string().nonempty("Title is required"),
  pNokFName: z.string().nonempty("First name is required"),
  pNokMName: z.string().optional(),
  pNokLName: z.string().nonempty("Last name is required"),
  pNokDob: z.date().optional(),
  pNokRelNameVal: z.string().nonempty("Relationship is required"),
  pNokRegStatusVal: z.string().optional(),
  pNokPssnID: z.string().optional(),
  pAddPhone1: z.string().nonempty("Phone number is required"),
  pAddPhone2: z.string().optional(),
  pAddPhone3: z.string().optional(),
  pNokDoorNo: z.string().optional(),
  pNokStreet: z.string().optional(),
  pNokAreaVal: z.string().optional(),
  pNokCityVal: z.string().optional(),
  pNokState: z.string().optional(),
  pNokPostcode: z.string().optional(),
  pNokCountryVal: z.string().optional(),
  rNotes: z.string().optional(),
  rActiveYN: z.string(),
  transferYN: z.string(),
});

type NextOfKinFormData = z.infer<typeof schema>;

const NextOfKinForm: React.FC<NextOfKinFormProps> = ({ onSave, onCancel, initialData, pChartID, pChartCode, viewOnly = false }) => {
  const { setLoading } = useLoading();
  const serverDate = useServerDate();
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const isEditMode = !!initialData?.pNokID;

  const { ...dropdownValues } = useDropdownValues(["title", "relation", "country", "city", "area"]);

  const defaultValues: NextOfKinFormData = {
    pNokTitleVal: "",
    pNokFName: "",
    pNokMName: "",
    pNokLName: "",
    pNokDob: serverDate,
    pNokRelNameVal: "",
    pNokRegStatusVal: "",
    pNokPssnID: "",
    pAddPhone1: "",
    pAddPhone2: "",
    pAddPhone3: "",
    pNokDoorNo: "",
    pNokStreet: "",
    pNokAreaVal: "",
    pNokCityVal: "",
    pNokState: "",
    pNokPostcode: "",
    pNokCountryVal: "",
    rNotes: "",
    rActiveYN: "Y",
    transferYN: "N",
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isValid },
  } = useForm<NextOfKinFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  useEffect(() => {
    if (initialData) {
      const formData: NextOfKinFormData = {
        pNokTitleVal: initialData.pNokTitleVal || "",
        pNokFName: initialData.pNokFName || "",
        pNokMName: initialData.pNokMName || "",
        pNokLName: initialData.pNokLName || "",
        pNokDob: initialData.pNokDob || serverDate,
        pNokRelNameVal: initialData.pNokRelNameVal || "",
        pNokRegStatusVal: initialData.pNokRegStatusVal || "",
        pNokPssnID: initialData.pNokPssnID || "",
        pAddPhone1: initialData.pAddPhone1 || "",
        pAddPhone2: initialData.pAddPhone2 || "",
        pAddPhone3: initialData.pAddPhone3 || "",
        pNokDoorNo: initialData.pNokDoorNo || "",
        pNokStreet: initialData.pNokStreet || "",
        pNokAreaVal: initialData.pNokAreaVal || "",
        pNokCityVal: initialData.pNokCityVal || "",
        pNokState: initialData.pNokState || "",
        pNokPostcode: initialData.pNokPostcode || "",
        pNokCountryVal: initialData.pNokCountryVal || "",
        rNotes: initialData.rNotes || "",
        rActiveYN: initialData.rActiveYN || "Y",
        transferYN: initialData.transferYN || "N",
      };
      reset(formData);
    } else {
      reset(defaultValues);
    }
  }, [initialData, reset, serverDate]);

  const onSubmit = async (data: NextOfKinFormData) => {
    if (viewOnly) return;

    setFormError(null);

    try {
      setIsSaving(true);
      setLoading(true);

      const nokData: PatNokDetailsDto = {
        ID: initialData?.ID || 0,
        pNokID: initialData?.pNokID || 0,
        pChartID: pChartID,
        pNokPChartCode: pChartCode,
        pNokPChartID: initialData?.pNokPChartID || 0,
        pNokRegStatusVal: data.pNokRegStatusVal || "",
        pNokRegStatus: "",
        pNokPssnID: data.pNokPssnID || "",
        pNokDob: data.pNokDob || serverDate,
        pNokRelNameVal: data.pNokRelNameVal,
        pNokRelName: "",
        pNokTitleVal: data.pNokTitleVal,
        pNokTitle: "",
        pNokFName: data.pNokFName,
        pNokMName: data.pNokMName || "",
        pNokLName: data.pNokLName,
        pNokActualCountryVal: data.pNokCountryVal || "",
        pNokActualCountry: "",
        pNokAreaVal: data.pNokAreaVal || "",
        pNokArea: "",
        pNokCityVal: data.pNokCityVal || "",
        pNokCity: "",
        pNokCountryVal: data.pNokCountryVal || "",
        pNokCountry: "",
        pNokDoorNo: data.pNokDoorNo || "",
        pAddPhone1: data.pAddPhone1,
        pAddPhone2: data.pAddPhone2 || "",
        pAddPhone3: data.pAddPhone3 || "",
        pNokPostcode: data.pNokPostcode || "",
        pNokState: data.pNokState || "",
        pNokStreet: data.pNokStreet || "",
        rActiveYN: data.rActiveYN,
        rNotes: data.rNotes || "",
        transferYN: data.transferYN,
      };

      await onSave(nokData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save next of kin";
      setFormError(errorMessage);
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  const performReset = () => {
    reset(
      initialData
        ? {
            pNokTitleVal: initialData.pNokTitleVal || "",
            pNokFName: initialData.pNokFName || "",
            pNokMName: initialData.pNokMName || "",
            pNokLName: initialData.pNokLName || "",
            pNokDob: initialData.pNokDob || serverDate,
            pNokRelNameVal: initialData.pNokRelNameVal || "",
            pNokRegStatusVal: initialData.pNokRegStatusVal || "",
            pNokPssnID: initialData.pNokPssnID || "",
            pAddPhone1: initialData.pAddPhone1 || "",
            pAddPhone2: initialData.pAddPhone2 || "",
            pAddPhone3: initialData.pAddPhone3 || "",
            pNokDoorNo: initialData.pNokDoorNo || "",
            pNokStreet: initialData.pNokStreet || "",
            pNokAreaVal: initialData.pNokAreaVal || "",
            pNokCityVal: initialData.pNokCityVal || "",
            pNokState: initialData.pNokState || "",
            pNokPostcode: initialData.pNokPostcode || "",
            pNokCountryVal: initialData.pNokCountryVal || "",
            rNotes: initialData.rNotes || "",
            rActiveYN: initialData.rActiveYN || "Y",
            transferYN: initialData.transferYN || "N",
          }
        : defaultValues
    );
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
    if (isDirty && !viewOnly) {
      setShowCancelConfirmation(true);
    } else {
      onCancel();
    }
  };

  const handleCancelConfirm = () => {
    setShowCancelConfirmation(false);
    onCancel();
  };

  const handleCancelCancel = () => {
    setShowCancelConfirmation(false);
  };

  const registrationStatusOptions = [
    { value: "Y", label: "Registered" },
    { value: "N", label: "Non Registered" },
  ];

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 1 }}>
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
            <Controller
              name="rActiveYN"
              control={control}
              render={({ field }) => <EnhancedFormField {...field} control={control} label="Active" type="switch" disabled={viewOnly} size="small" />}
            />
          </Box>
        </Grid>
        <Grid size={{ sm: 12 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Controller
                    name="pNokTitleVal"
                    control={control}
                    render={({ field }) => (
                      <EnhancedFormField
                        {...field}
                        control={control}
                        type="select"
                        label="Title"
                        required
                        options={dropdownValues.title || []}
                        fullWidth
                        disabled={viewOnly}
                        size="small"
                        helperText={errors.pNokTitleVal?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Controller
                    name="pNokFName"
                    control={control}
                    render={({ field }) => (
                      <EnhancedFormField
                        {...field}
                        control={control}
                        type="text"
                        label="First Name"
                        required
                        fullWidth
                        disabled={viewOnly}
                        size="small"
                        helperText={errors.pNokFName?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Controller
                    name="pNokMName"
                    control={control}
                    render={({ field }) => <EnhancedFormField {...field} control={control} type="text" label="Middle Name" fullWidth disabled={viewOnly} size="small" />}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Controller
                    name="pNokLName"
                    control={control}
                    render={({ field }) => (
                      <EnhancedFormField
                        {...field}
                        control={control}
                        type="text"
                        label="Last Name"
                        required
                        fullWidth
                        disabled={viewOnly}
                        size="small"
                        helperText={errors.pNokLName?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Controller
                    name="pNokDob"
                    control={control}
                    render={({ field }) => <EnhancedFormField {...field} control={control} type="datepicker" label="Date of Birth" fullWidth disabled={viewOnly} size="small" />}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Controller
                    name="pNokRelNameVal"
                    control={control}
                    render={({ field }) => (
                      <EnhancedFormField
                        {...field}
                        control={control}
                        type="select"
                        label="Relationship"
                        required
                        options={dropdownValues.relation || []}
                        fullWidth
                        disabled={viewOnly}
                        size="small"
                        helperText={errors.pNokRelNameVal?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="pNokRegStatusVal"
                    control={control}
                    render={({ field }) => (
                      <EnhancedFormField {...field} control={control} type="radio" label="Registration Type" options={registrationStatusOptions} row disabled={viewOnly} />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="pNokPssnID"
                    control={control}
                    render={({ field }) => <EnhancedFormField {...field} control={control} type="text" label="ID/Passport No." fullWidth disabled={viewOnly} size="small" />}
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
                Contact Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Controller
                    name="pAddPhone1"
                    control={control}
                    render={({ field }) => (
                      <EnhancedFormField
                        {...field}
                        control={control}
                        type="tel"
                        label="Phone Number"
                        required
                        fullWidth
                        disabled={viewOnly}
                        size="small"
                        helperText={errors.pAddPhone1?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Controller
                    name="pAddPhone2"
                    control={control}
                    render={({ field }) => <EnhancedFormField {...field} control={control} type="tel" label="Alternative Phone" fullWidth disabled={viewOnly} size="small" />}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Controller
                    name="pAddPhone3"
                    control={control}
                    render={({ field }) => <EnhancedFormField {...field} control={control} type="tel" label="Emergency Phone" fullWidth disabled={viewOnly} size="small" />}
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
                Address Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="pNokDoorNo"
                    control={control}
                    render={({ field }) => <EnhancedFormField {...field} control={control} type="text" label="Door No." fullWidth disabled={viewOnly} size="small" />}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="pNokStreet"
                    control={control}
                    render={({ field }) => <EnhancedFormField {...field} control={control} type="text" label="Street" fullWidth disabled={viewOnly} size="small" />}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Controller
                    name="pNokAreaVal"
                    control={control}
                    render={({ field }) => (
                      <EnhancedFormField {...field} control={control} type="select" label="Area" options={dropdownValues.area || []} fullWidth disabled={viewOnly} size="small" />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Controller
                    name="pNokCityVal"
                    control={control}
                    render={({ field }) => (
                      <EnhancedFormField {...field} control={control} type="select" label="City" options={dropdownValues.city || []} fullWidth disabled={viewOnly} size="small" />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Controller
                    name="pNokState"
                    control={control}
                    render={({ field }) => <EnhancedFormField {...field} control={control} type="text" label="State" fullWidth disabled={viewOnly} size="small" />}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Controller
                    name="pNokPostcode"
                    control={control}
                    render={({ field }) => <EnhancedFormField {...field} control={control} type="text" label="Postal Code" fullWidth disabled={viewOnly} size="small" />}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Controller
                    name="pNokCountryVal"
                    control={control}
                    render={({ field }) => (
                      <EnhancedFormField
                        {...field}
                        control={control}
                        type="select"
                        label="Country"
                        options={dropdownValues.country || []}
                        fullWidth
                        disabled={viewOnly}
                        size="small"
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Controller
                    name="transferYN"
                    control={control}
                    render={({ field }) => <EnhancedFormField {...field} control={control} label="Allow Transfer" type="switch" disabled={viewOnly} size="small" />}
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
                  <Controller
                    name="rNotes"
                    control={control}
                    render={({ field }) => (
                      <EnhancedFormField
                        {...field}
                        control={control}
                        type="textarea"
                        label="Notes"
                        fullWidth
                        disabled={viewOnly}
                        size="small"
                        rows={4}
                        placeholder="Enter any additional information about this next of kin"
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box display="flex" justifyContent="space-between" gap={2} mt={2}>
            <SmartButton text="Cancel" onClick={handleCancel} variant="outlined" color="inherit" disabled={isSaving} />
            {viewOnly ? null : (
              <Box sx={{ display: "flex", gap: 1 }}>
                <SmartButton text="Reset" onClick={handleReset} variant="outlined" color="error" icon={CancelIcon} disabled={isSaving || (!isDirty && !formError)} />
                <SmartButton
                  text={isEditMode ? "Update Next of Kin" : "Save Next of Kin"}
                  onClick={handleSubmit(onSubmit)}
                  variant="contained"
                  color="primary"
                  icon={SaveIcon}
                  asynchronous={true}
                  showLoadingIndicator={true}
                  loadingText={isEditMode ? "Updating..." : "Saving..."}
                  successText={isEditMode ? "Updated!" : "Saved!"}
                  disabled={isSaving || !isValid}
                />
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>

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
    </Box>
  );
};

export default NextOfKinForm;
