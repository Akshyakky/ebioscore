import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { RoomGroupDto } from "@/interfaces/HospitalAdministration/Room-BedSetUpDto";
import { useAlert } from "@/providers/AlertProvider";
import { roomGroupService } from "@/services/HospitalAdministrationServices/hospitalAdministrationService";
import { zodResolver } from "@hookform/resolvers/zod";
import { Cancel, Refresh, Save } from "@mui/icons-material";
import { Alert, Box, Card, CardContent, CircularProgress, Divider, Grid, InputAdornment, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface RoomGroupFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  initialData: RoomGroupDto | null;
  viewOnly?: boolean;
  isSubGroup?: boolean;
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

const RoomGroupForm: React.FC<RoomGroupFormProps> = ({ open, onClose, initialData, viewOnly = false, isSubGroup = false }) => {
  const { setLoading } = useLoading();
  const { showAlert } = useAlert();
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const isAddMode = !initialData?.rGrpID;
  const isActuallySubGroup = isSubGroup || (initialData?.key !== undefined && initialData?.key !== null && initialData?.key > 0);
  const dropdownValues = useDropdownValues(["department", "gender"]);

  const defaultValues: RoomGroupFormData = {
    rGrpID: 0,
    rGrpName: "",
    rGrpCode: "",
    key: 0,
    deptID: 0,
    deptName: "",
    gender: "",
    genderValue: "",
    rGrpTypeValue: "",
    groupYN: "Y",
    rActiveYN: "Y",
    rNotes: "",
    transferYN: "N",
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

  const deptID = watch("deptID");
  const gender = watch("gender");

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
    debugger;
    if (initialData) {
      if (initialData.rGrpID) {
        reset({
          ...defaultValues,
          ...initialData,
          key: initialData.key || 0,
        });
      } else {
        const formData = {
          ...defaultValues,
          key: isActuallySubGroup ? initialData.key || 0 : 0,
          deptName: initialData.deptName || "",
          gender: initialData.gender || "",
          genderValue: initialData.genderValue || "",
          rGrpTypeValue: initialData.rGrpTypeValue || "",
          parentGroupName: initialData.rGrpName,
          rGrpName: initialData.rGrpName,
        };
        reset(formData);
      }
    } else {
      reset(defaultValues);
    }
  }, [initialData, reset, isActuallySubGroup]);

  const generateRoomGroupCode = async () => {
    if (!isAddMode || isActuallySubGroup) return;
    try {
      setIsGeneratingCode(true);
      const nextCodeResult = await roomGroupService.getNextCode("RG", 3);
      if (nextCodeResult && nextCodeResult.success && nextCodeResult.data) {
        setValue("rGrpCode", nextCodeResult.data, { shouldValidate: true, shouldDirty: true });
      } else {
        showAlert("Warning", "Failed to generate room group code", "warning");
      }
    } catch (error) {
    } finally {
      setIsGeneratingCode(false);
    }
  };

  useEffect(() => {
    if (isAddMode && !isActuallySubGroup) {
      generateRoomGroupCode();
    }
  }, [isAddMode, isActuallySubGroup]);

  const onSubmit = async (data: RoomGroupFormData) => {
    if (viewOnly) return;
    setFormError(null);
    try {
      setIsSaving(true);
      setLoading(true);
      const formData: RoomGroupDto = {
        rGrpID: data.rGrpID,
        rGrpName: data.rGrpName,
        rGrpCode: data.rGrpCode || "",
        key: isActuallySubGroup ? initialData?.key || 0 : 0,
        groupYN: "Y",
        rActiveYN: data.rActiveYN,
        rNotes: data.rNotes || "",
        transferYN: data.transferYN || "N",
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
        const actionType = isAddMode ? "created" : "updated";
        const itemType = isActuallySubGroup ? "Sub-group" : "Room group";
        showAlert("Success", `${itemType} ${actionType} successfully`, "success");
        onClose(true);
      } else {
        throw new Error(response.errorMessage || "Failed to save room group");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save room group";
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  const performReset = () => {
    if (initialData && initialData.rGrpID) {
      reset({
        ...initialData,
        key: initialData.key || 0,
      } as RoomGroupFormData);
    } else {
      const resetData = {
        ...defaultValues,
        key: isActuallySubGroup ? initialData?.key || 0 : 0,
        deptID: initialData?.deptID || 0,
        deptName: initialData?.deptName || "",
      };
      reset(resetData);
    }
    setFormError(null);

    if (isAddMode && !isActuallySubGroup) {
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
    if (isAddMode && !isActuallySubGroup) {
      generateRoomGroupCode();
    }
  };

  const dialogTitle = viewOnly
    ? isActuallySubGroup
      ? `View Sub-group Details${initialData?.parentGroupName ? ` (Under: ${initialData.parentGroupName})` : ""}`
      : "View Room Group Details"
    : isAddMode
    ? isActuallySubGroup
      ? `Create New Sub-group${initialData?.parentGroupName ? ` under ${initialData.parentGroupName}` : ""}`
      : "Create New Room Group"
    : `Edit ${isActuallySubGroup ? "Sub-group" : "Room Group"} - ${initialData?.rGrpName}`;

  const dialogActions = viewOnly ? (
    <SmartButton text="Close" onClick={() => onClose()} variant="contained" color="primary" />
  ) : (
    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
      <SmartButton text="Cancel" onClick={handleCancel} variant="outlined" color="inherit" disabled={isSaving} />
      <Box sx={{ display: "flex", gap: 1 }}>
        <SmartButton text="Reset" onClick={handleReset} variant="outlined" color="error" icon={Cancel} disabled={isSaving || (!isDirty && !formError)} />
        <SmartButton
          text={isAddMode ? (isActuallySubGroup ? "Create Sub-group" : "Create Room Group") : isActuallySubGroup ? "Update Sub-group" : "Update Room Group"}
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

            {isActuallySubGroup && (
              <Grid size={{ xs: 12 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body1" component="div" sx={{ fontWeight: 500, mb: 1 }}>
                    {isAddMode ? "Creating Sub-group Under:" : "Sub-group Information:"}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box sx={{ bgcolor: "rgba(25, 118, 210, 0.1)", p: 1.5, borderRadius: 1 }}>
                        <Typography variant="caption" color="primary" sx={{ fontWeight: 500 }}>
                          Parent Group
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {initialData?.parentGroupName || initialData?.parentGroup?.rGrpName || "Unknown Group"}
                        </Typography>
                        {initialData?.parentGroup && (
                          <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                            Department: {initialData.parentGroup.deptName || "Not specified"}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box sx={{ bgcolor: "rgba(76, 175, 80, 0.1)", p: 1.5, borderRadius: 1 }}>
                        <Typography variant="caption" color="success.main" sx={{ fontWeight: 500 }}>
                          Department (Inherited)
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {initialData?.deptName || "Unknown Department"}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  {isAddMode && (
                    <Typography variant="body2" sx={{ mt: 1, fontStyle: "italic", color: "text.secondary" }}>
                      The sub-group will inherit department settings from the parent group.
                    </Typography>
                  )}
                </Alert>
              </Grid>
            )}

            <Grid size={{ xs: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    {!isActuallySubGroup && (
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
                              isAddMode && !viewOnly && !isActuallySubGroup ? (
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

                    <Grid size={{ sm: 12, md: isActuallySubGroup ? 12 : 6 }}>
                      <FormField
                        name="rGrpName"
                        control={control}
                        label={isActuallySubGroup ? "Sub-group Name" : "Group Name"}
                        type="text"
                        required
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        helperText={errors.rGrpName?.message}
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField
                        name="deptID"
                        control={control}
                        label="Department"
                        type="select"
                        required
                        disabled={viewOnly || isActuallySubGroup}
                        size="small"
                        fullWidth
                        options={dropdownValues.department || []}
                        helperText={errors.deptID?.message || (isActuallySubGroup ? "Inherited from parent group" : "")}
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
                    {isActuallySubGroup ? "Sub-group Settings" : "Room Group Settings"}
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
                        placeholder={`Enter any additional information about this ${isActuallySubGroup ? "sub-group" : "room group"}`}
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
