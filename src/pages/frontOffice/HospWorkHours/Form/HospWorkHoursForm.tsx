import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import { DAY_OPTIONS, HOLIDAY_OPTIONS, HospWorkHoursDto, LANGUAGE_OPTIONS, STATUS_OPTIONS } from "@/interfaces/FrontOffice/HospWorkHoursDt";
import { useAlert } from "@/providers/AlertProvider";
import { formatTimeStringToDate } from "@/utils/Common/dateUtils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Cancel, Save } from "@mui/icons-material";
import { Alert, Box, Card, CardContent, Divider, Grid, Typography } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { useHospWorkHoursOperations } from "../hooks/useHospWorkHoursOperations";

interface HospWorkHoursFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  initialData: HospWorkHoursDto | null;
  viewOnly?: boolean;
}

const schema = z
  .object({
    hwrkID: z.number(),
    langType: z.string().nonempty("Language is required"),
    daysDesc: z.string().nonempty("Day is required"),
    startTime: z.date().nullable(),
    endTime: z.date().nullable(),
    wkHoliday: z.string().nonempty("Holiday status is required"),
    rActiveYN: z.string(),
    rNotes: z.string().nullable().optional(),
    transferYN: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return data.endTime > data.startTime;
      }
      return true;
    },
    { message: "End time must be after start time", path: ["endTime"] }
  );

type WorkHoursFormData = z.infer<typeof schema>;

const HospWorkHoursForm: React.FC<HospWorkHoursFormProps> = ({ open, onClose, initialData, viewOnly = false }) => {
  const { setLoading } = useLoading();
  const { showAlert } = useAlert();

  const { validateAndSaveWorkHours, checkWorkHoursExist } = useHospWorkHoursOperations();

  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

  const defaultValues: HospWorkHoursDto = {
    hwrkID: 0,
    langType: "EN",
    daysDesc: "MONDAY",
    startTime: null,
    endTime: null,
    wkHoliday: "N",
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
    watch,
  } = useForm<WorkHoursFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const langType = useWatch({ control, name: "langType" });
  const daysDesc = useWatch({ control, name: "daysDesc" });
  const startTime = watch("startTime");
  const endTime = watch("endTime");

  useEffect(() => {
    if (initialData) {
      const formData: WorkHoursFormData = {
        ...initialData,
        startTime: initialData.startTime ? new Date(initialData.startTime) : null,
        endTime: initialData.endTime ? new Date(initialData.endTime) : null,
      };
      reset(formData);
    } else {
      reset(defaultValues);
    }
  }, [initialData, reset]);

  const validateUniqueRecord = useCallback(async () => {
    if (!langType || !daysDesc || initialData?.hwrkID) {
      return true; // Skip validation for edit mode or incomplete data
    }

    const exists = await checkWorkHoursExist(langType, daysDesc);
    if (exists) {
      setFormError(`Work hours already exist for ${langType} language on ${daysDesc}`);
      showAlert("Validation Error", `Work hours already exist for ${langType} language on ${daysDesc}`, "warning");
      return false;
    }
    return true;
  }, [langType, daysDesc, initialData, checkWorkHoursExist, showAlert]);

  const onSubmit = async (data: WorkHoursFormData) => {
    if (viewOnly) return;

    setFormError(null);

    // Validate unique combination
    const isUnique = await validateUniqueRecord();
    if (!isUnique) {
      return;
    }

    try {
      setIsSaving(true);
      setLoading(true);

      const workHoursData: HospWorkHoursDto = {
        hwrkID: data.hwrkID || 0,
        langType: data.langType,
        daysDesc: data.daysDesc,
        startTime: data.startTime,
        endTime: data.endTime,
        wkHoliday: data.wkHoliday,
        rActiveYN: data.rActiveYN || "Y",
        rNotes: data.rNotes || "",
        transferYN: data.transferYN || "N",
      };

      const response = await validateAndSaveWorkHours(workHoursData);

      if (response.success) {
        const actionText = data.hwrkID ? "updated" : "created";
        showAlert("Success", `Work hours ${actionText} successfully`, "success");
        onClose(true);
      } else {
        throw new Error(response.errorMessage || "Failed to save work hours");
      }
    } catch (error) {
      console.error("Error saving work hours:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save work hours";
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  const performReset = () => {
    reset(initialData ? (initialData as WorkHoursFormData) : defaultValues);
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

  const dialogTitle = viewOnly ? "View Work Hours Details" : initialData ? "Edit Work Hours" : "Create New Work Hours";

  const dialogActions = viewOnly ? (
    <SmartButton text="Close" onClick={() => onClose()} variant="contained" color="primary" />
  ) : (
    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
      <SmartButton text="Cancel" onClick={handleCancel} variant="outlined" color="inherit" disabled={isSaving} />
      <Box sx={{ display: "flex", gap: 1 }}>
        <SmartButton text="Reset" onClick={handleReset} variant="outlined" color="error" icon={Cancel} disabled={isSaving || (!isDirty && !formError)} />
        <SmartButton
          text={initialData ? "Update Work Hours" : "Create Work Hours"}
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          color="primary"
          icon={Save}
          asynchronous={true}
          showLoadingIndicator={true}
          loadingText={initialData ? "Updating..." : "Creating..."}
          successText={initialData ? "Updated!" : "Created!"}
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
                      <FormField name="langType" control={control} label="Language" type="select" options={LANGUAGE_OPTIONS} required disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="daysDesc" control={control} label="Day" type="select" options={DAY_OPTIONS} required disabled={viewOnly} size="small" fullWidth />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Time Information Section */}
            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Time Schedule
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField
                        name="startTime"
                        control={control}
                        label="Start Time"
                        type="timepicker"
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        onChange={(item) => {
                          const formattedTime = formatTimeStringToDate(item);
                          setValue("startTime", formattedTime);
                        }}
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField
                        name="endTime"
                        control={control}
                        label="End Time"
                        type="timepicker"
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        onChange={(item) => {
                          const formattedTime = formatTimeStringToDate(item);
                          setValue("endTime", formattedTime);
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Status Information Section */}
            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Status Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="wkHoliday" control={control} label="Holiday" type="select" options={HOLIDAY_OPTIONS} required disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="rActiveYN" control={control} label="Status" type="select" options={STATUS_OPTIONS} required disabled={viewOnly} size="small" fullWidth />
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
                        placeholder="Enter any additional information about these work hours"
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

export default HospWorkHoursForm;
