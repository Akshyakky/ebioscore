import React, { useState, useEffect } from "react";
import { Box, Grid, Typography, Divider, Card, CardContent, Alert, InputAdornment, CircularProgress } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { RoomGroupDto } from "@/interfaces/HospitalAdministration/Room-BedSetUpDto";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import SmartButton from "@/components/Button/SmartButton";
import { Save, Cancel, Refresh } from "@mui/icons-material";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import { useAlert } from "@/providers/AlertProvider";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { roomGroupService } from "@/services/HospitalAdministrationServices/hospitalAdministrationService";

interface RoomGroupFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  initialData: RoomGroupDto | null;
  viewOnly?: boolean;
}

const schema = z.object({
  rGrpID: z.number(),
  rGrpName: z.string().nonempty("Room group name is required"),
  rGrpCode: z.string().optional().nullable(),
  key: z.number(),
  deptID: z.number(),
  deptName: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  genderValue: z.string().optional().nullable(),
  rGrpTypeValue: z.string().optional().nullable(),
  groupYN: z.string(),
  rActiveYN: z.string(),
  rNotes: z.string().optional().nullable(),
  transferYN: z.string(),
  showinboYN: z.string(),
  teachingYN: z.string(),
});

type RoomGroupFormData = z.infer<typeof schema>;

const RoomGroupForm: React.FC<RoomGroupFormProps> = ({ open, onClose, initialData, viewOnly = false }) => {
  const { setLoading } = useLoading();
  const { showAlert } = useAlert();
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const isAddMode = !initialData?.rGrpID;
  const isSubGroup = initialData?.isParent;
  const dropdownValues = useDropdownValues(["department", "gender"]);

  const defaultValues: RoomGroupFormData = {
    rGrpID: 0,
    rGrpName: "",
    rGrpCode: "",
    key: isSubGroup && initialData ? initialData.rGrpID : 0,
    deptID: 0,
    deptName: "",
    gender: "",
    genderValue: "",
    rGrpTypeValue: "",
    groupYN: "N",
    rActiveYN: "Y",
    rNotes: "",
    transferYN: "Y",
    showinboYN: "Y",
    teachingYN: "N",
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isDirty, isValid, errors },
  } = useForm<RoomGroupFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  // Watch for changes in dropdown selections
  const deptID = watch("deptID");
  const gender = watch("gender");
  const rGrpTypeValue = watch("rGrpTypeValue");

  // Update related fields when selections change
  useEffect(() => {
    if (deptID && dropdownValues.department) {
      const selectedDept = dropdownValues.department.find((d) => d.value.toString() === deptID.toString());
      if (selectedDept) {
        setValue("deptName", selectedDept.label, { shouldValidate: true, shouldDirty: true });
      }
    }
  }, [deptID, dropdownValues.department, setValue]);

  useEffect(() => {
    if (gender && dropdownValues.gender) {
      const selectedGender = dropdownValues.gender.find((g) => g.value === gender);
      if (selectedGender) {
        setValue("genderValue", selectedGender.label, { shouldValidate: true, shouldDirty: true });
      }
    }
  }, [gender, dropdownValues.gender, setValue]);

  useEffect(() => {
    if (initialData) {
      // Handle regular edit mode
      if (initialData.rGrpID && !initialData.isParent) {
        reset({
          ...defaultValues,
          ...initialData,
        });
      }
      // Handle sub-group creation (initialData contains parent info)
      else if (initialData.isParent) {
        reset({
          ...defaultValues,
          key: initialData.rGrpID,
          deptID: initialData.deptID || 0,
          deptName: initialData.deptName || "",
        });
      }
    } else {
      reset(defaultValues);
    }
  }, [initialData, reset]);

  const generateRoomGroupCode = async () => {
    if (!isAddMode) return;

    try {
      setIsGeneratingCode(true);
      // You'll need to implement a getNextCode function in your room group service
      const nextCodeResult = await roomGroupService.getNextCode("RG", 3);
      if (nextCodeResult && nextCodeResult.success && nextCodeResult.data) {
        setValue("rGrpCode", nextCodeResult.data, { shouldValidate: true, shouldDirty: true });
      } else {
        showAlert("Warning", "Failed to generate room group code", "warning");
      }
    } catch (error) {
      console.error("Error generating room group code:", error);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  useEffect(() => {
    if (isAddMode && !isSubGroup) {
      generateRoomGroupCode();
    }
  }, [isAddMode, isSubGroup]);

  const onSubmit = async (data: RoomGroupFormData) => {
    if (viewOnly) return;

    setFormError(null);

    try {
      setIsSaving(true);
      setLoading(true);

      // Ensure all required properties are explicitly set
      const formData: RoomGroupDto = {
        rGrpID: data.rGrpID,
        rGrpName: data.rGrpName,
        rGrpCode: data.rGrpCode || "",
        key: data.key,
        groupYN: data.groupYN,
        rActiveYN: data.rActiveYN,
        rNotes: data.rNotes || "",
        transferYN: data.transferYN || "Y",
        // Convert deptID to number if it's a string
        deptID: typeof data.deptID === "string" ? parseInt(data.deptID, 10) : data.deptID,
        deptName: data.deptName || "",
        gender: data.gender || "",
        genderValue: data.genderValue || "",
        rGrpTypeValue: data.rGrpTypeValue || "",
        showinboYN: data.showinboYN,
        teachingYN: data.teachingYN,
      };

      const response = await roomGroupService.save(formData);

      if (response.success) {
        showAlert("Success", isAddMode ? "Room group created successfully" : "Room group updated successfully", "success");
        onClose(true);
      } else {
        throw new Error(response.errorMessage || "Failed to save room group");
      }
    } catch (error) {
      console.error("Error saving room group:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save room group";
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  const performReset = () => {
    if (initialData && !initialData.isParent) {
      reset(initialData as RoomGroupFormData);
    } else {
      reset(defaultValues);
    }
    setFormError(null);

    if (isAddMode && !isSubGroup) {
      generateRoomGroupCode();
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

  const handleRefreshCode = () => {
    if (isAddMode && !isSubGroup) {
      generateRoomGroupCode();
    }
  };

  const dialogTitle = viewOnly
    ? "View Room Group Details"
    : isAddMode
    ? isSubGroup
      ? "Create New Sub Group"
      : "Create New Room Group"
    : `Edit Room Group - ${initialData?.rGrpName}`;

  const dialogActions = viewOnly ? (
    <SmartButton text="Close" onClick={() => onClose()} variant="contained" color="primary" />
  ) : (
    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
      <SmartButton text="Cancel" onClick={handleCancel} variant="outlined" color="inherit" disabled={isSaving} />
      <Box sx={{ display: "flex", gap: 1 }}>
        <SmartButton text="Reset" onClick={handleReset} variant="outlined" color="error" icon={Cancel} disabled={isSaving || (!isDirty && !formError)} />
        <SmartButton
          text={isAddMode ? (isSubGroup ? "Create Sub Group" : "Create Room Group") : "Update Room Group"}
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
            <Grid size={{ xs: 12 }}>
              <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2}>
                <Typography variant="body2" color="text.secondary">
                  Status:
                </Typography>
                <FormField name="rActiveYN" control={control} label="Active" type="switch" disabled={viewOnly} size="small" />
              </Box>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    {!isSubGroup && (
                      <Grid size={{ sm: 12, md: 6 }}>
                        <FormField
                          name="rGrpCode"
                          control={control}
                          label="Group Code"
                          type="text"
                          disabled={viewOnly || !isAddMode}
                          size="small"
                          fullWidth
                          InputProps={{
                            endAdornment:
                              isAddMode && !viewOnly && !isSubGroup ? (
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
                    )}

                    <Grid size={{ sm: 12, md: isSubGroup ? 12 : 6 }}>
                      <FormField
                        name="rGrpName"
                        control={control}
                        label="Group Name"
                        type="text"
                        required
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        helperText={errors.rGrpName?.message}
                      />
                    </Grid>

                    {isSubGroup && (
                      <Grid size={{ xs: 12 }}>
                        <Alert severity="info" sx={{ mb: 2 }}>
                          This sub-group will be created under: <strong>{initialData?.rGrpName}</strong>
                        </Alert>
                      </Grid>
                    )}

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField
                        name="deptID"
                        control={control}
                        label="Department"
                        type="select"
                        required
                        disabled={viewOnly || isSubGroup}
                        size="small"
                        fullWidth
                        options={dropdownValues.department || []}
                        helperText={errors.deptID?.message}
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="gender" control={control} label="Gender" type="select" disabled={viewOnly} size="small" fullWidth options={dropdownValues.gender || []} />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Room Group Settings
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField
                        name="rGrpTypeValue"
                        control={control}
                        label="Room Group Type"
                        type="select"
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        options={[
                          { value: "Ward", label: "Ward" },
                          { value: "ICU", label: "ICU" },
                        ]}
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="transferYN" control={control} label="Allow Transfer" type="switch" disabled={viewOnly} size="small" />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="teachingYN" control={control} label="Teaching Ward" type="switch" disabled={viewOnly} size="small" />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="showinboYN" control={control} label="Show in Bed Occupancy" type="switch" disabled={viewOnly} size="small" />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Additional Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                      <FormField
                        name="rNotes"
                        control={control}
                        label="Notes"
                        type="textarea"
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        rows={4}
                        placeholder="Enter any additional information about this room group"
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

export default RoomGroupForm;
