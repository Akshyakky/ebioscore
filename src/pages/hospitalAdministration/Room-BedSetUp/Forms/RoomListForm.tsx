import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { RoomGroupDto, RoomListDto } from "@/interfaces/HospitalAdministration/Room-BedSetUpDto";
import { useAlert } from "@/providers/AlertProvider";
import { roomGroupService, roomListService } from "@/services/HospitalAdministrationServices/hospitalAdministrationService";
import { zodResolver } from "@hookform/resolvers/zod";
import { Cancel, Refresh, Save } from "@mui/icons-material";
import { Alert, Box, Card, CardContent, CircularProgress, Divider, Grid, InputAdornment, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface RoomListFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  initialData: RoomListDto | null;
  viewOnly?: boolean;
  roomGroups: RoomGroupDto[];
}

const schema = z.object({
  rlID: z.number(),
  rlCode: z.string().optional().nullable(),
  rName: z.string().nonempty("Room name is required"),
  noOfBeds: z.number(),
  rLocation: z.string().optional().nullable(),
  rLocationID: z.number().optional(),
  rActiveYN: z.string(),
  rNotes: z.string().optional().nullable(),
  rgrpID: z.number().min(1, "Room group is required"),
  deptID: z.number().optional(),
  deptName: z.string().optional().nullable(),
  rOrder: z.number().optional(),
  transferYN: z.string(),
  dulID: z.number().optional(),
  unitDesc: z.string().optional().nullable(),
});

type RoomListFormData = z.infer<typeof schema>;

const RoomListForm: React.FC<RoomListFormProps> = ({ open, onClose, initialData, viewOnly = false, roomGroups }) => {
  const { setLoading } = useLoading();
  const { showAlert } = useAlert();
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const isAddMode = !initialData?.rlID;
  const dropdownValues = useDropdownValues(["floor", "unit"]);

  const defaultValues: RoomListFormData = useMemo(
    () => ({
      rlID: 0,
      rlCode: "",
      rName: "",
      noOfBeds: 0,
      rLocation: "",
      rLocationID: 0,
      rActiveYN: "Y",
      rNotes: "",
      rgrpID: initialData?.rgrpID || 0,
      deptID: 0,
      deptName: "",
      rOrder: 0,
      transferYN: "N",
      dulID: 0,
      unitDesc: "",
    }),
    [initialData?.rgrpID]
  );

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isDirty, isValid, errors },
  } = useForm<RoomListFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });
  const rgrpID = watch("rgrpID");
  const rLocationID = watch("rLocationID");
  const dulID = watch("dulID");

  useEffect(() => {
    if (rLocationID && dropdownValues.floor) {
      const selectedLocation = dropdownValues.floor.find((f) => f.id === rLocationID);
      if (selectedLocation) {
        setValue("rLocation", selectedLocation.label, { shouldValidate: true, shouldDirty: true });
      }
    }
  }, [rLocationID, dropdownValues.floor, setValue]);

  useEffect(() => {
    if (dulID && dropdownValues.unit) {
      const selectedUnit = dropdownValues.unit.find((u) => u.value.toString() === dulID.toString());
      if (selectedUnit) {
        setValue("unitDesc", selectedUnit.label, { shouldValidate: true, shouldDirty: true });
      }
    }
  }, [dulID, dropdownValues.unit, setValue]);

  useEffect(() => {
    if (open) {
      const dataToSet = initialData ? { ...defaultValues, ...initialData } : defaultValues;
      reset(dataToSet);

      if (initialData?.rgrpID) {
        setValue("rgrpID", initialData.rgrpID, { shouldValidate: true, shouldDirty: true });
        // fetchDepartmentDetails(initialData.rgrpID);
      }

      if (isAddMode) {
        generateRoomCode();
      }
    }
  }, [open, initialData, isAddMode]);

  const generateRoomCode = async () => {
    if (!isAddMode) return;
    try {
      setIsGeneratingCode(true);
      const nextCodeResult = await roomListService.getNextCode("RM", 3);
      if (nextCodeResult && nextCodeResult.success && nextCodeResult.data) {
        setValue("rlCode", nextCodeResult.data, { shouldValidate: true, shouldDirty: true });
      } else {
        showAlert("Warning", "Failed to generate room code", "warning");
      }
    } catch (error) {
      showAlert("Error", "Failed to generate room code", "error");
    } finally {
      setIsGeneratingCode(false);
    }
  };

  // Also update the fetchDepartmentDetails function to be more robust:

  const fetchDepartmentDetails = useCallback(
    async (groupId: number) => {
      if (!groupId || groupId === 0) {
        // Clear department fields if no group is selected
        setValue("deptID", 0, { shouldValidate: true, shouldDirty: true });
        setValue("deptName", "", { shouldValidate: true, shouldDirty: true });
        return;
      }

      try {
        setLoading(true);
        const response = await roomGroupService.getById(groupId);
        if (response.success && response.data) {
          const roomGroup = response.data;
          setValue("deptID", roomGroup.deptID || 0, { shouldValidate: true, shouldDirty: true });
          setValue("deptName", roomGroup.deptName || "", { shouldValidate: true, shouldDirty: true });
        } else {
          // Handle case where room group data is not found
          setValue("deptID", 0, { shouldValidate: true, shouldDirty: true });
          setValue("deptName", "", { shouldValidate: true, shouldDirty: true });
          showAlert("Warning", "Could not load department details for selected room group", "warning");
        }
      } catch (error) {
        console.error("Error fetching department details:", error);
        setValue("deptID", 0, { shouldValidate: true, shouldDirty: true });
        setValue("deptName", "", { shouldValidate: true, shouldDirty: true });
        showAlert("Error", "Failed to load department details", "error");
      } finally {
        setLoading(false);
      }
    },
    [setValue, showAlert]
  );
  useEffect(() => {
    if (rgrpID && rgrpID !== 0) {
      fetchDepartmentDetails(rgrpID);
    }
  }, [rgrpID]);

  const onSubmit = async (data: RoomListFormData) => {
    if (viewOnly) return;
    setFormError(null);
    try {
      debugger;
      setIsSaving(true);
      setLoading(true);
      const formData: RoomListDto = {
        rlID: isAddMode ? 0 : data.rlID,
        rName: data.rName,
        noOfBeds: typeof data.noOfBeds === "string" ? parseInt(data.noOfBeds, 10) : data.noOfBeds,
        rLocation: data.rLocation || "",
        rLocationID: typeof data.rLocationID === "string" ? parseInt(data.rLocationID, 10) : data.rLocationID || 0,
        rActiveYN: data.rActiveYN,
        rNotes: data.rNotes || "",
        rgrpID: typeof data.rgrpID === "string" ? parseInt(data.rgrpID, 10) : data.rgrpID,
        deptID: typeof data.deptID === "string" ? parseInt(data.deptID, 10) : data.deptID || 0,
        deptName: data.deptName || "",
        rOrder: data.rOrder || 0,
        transferYN: data.transferYN || "Y",
        dulID: typeof data.dulID === "string" ? parseInt(data.dulID, 10) : data.dulID || 0,
        unitDesc: data.unitDesc || "",
        rlCode: data.rlCode || "",
      };
      const response = await roomListService.save(formData);
      if (response.success) {
        showAlert("Success", isAddMode ? "Room created successfully" : "Room updated successfully", "success");
        onClose(true);
      } else {
        throw new Error(response.errorMessage || "Failed to save room");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save room";
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  const performReset = () => {
    if (initialData?.rlID) {
      reset(initialData as RoomListFormData);
    } else {
      reset(defaultValues);
      if (initialData?.rgrpID) {
        setValue("rgrpID", initialData.rgrpID, { shouldValidate: true, shouldDirty: true });
      }
    }
    setFormError(null);

    if (isAddMode) {
      generateRoomCode();
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
    if (isAddMode) {
      generateRoomCode();
    }
  };

  const dialogTitle = viewOnly ? "View Room Details" : isAddMode ? "Create New Room" : `Edit Room - ${initialData?.rName}`;

  const dialogActions = viewOnly ? (
    <SmartButton text="Close" onClick={() => onClose()} variant="contained" color="primary" />
  ) : (
    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
      <SmartButton text="Cancel" onClick={handleCancel} variant="outlined" color="inherit" disabled={isSaving} />
      <Box sx={{ display: "flex", gap: 1 }}>
        <SmartButton text="Reset" onClick={handleReset} variant="outlined" color="error" icon={Cancel} disabled={isSaving || (!isDirty && !formError)} />
        <SmartButton
          text={isAddMode ? "Create Room" : "Update Room"}
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
                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField
                        name="rlCode"
                        control={control}
                        label="Room Code"
                        type="text"
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
                      <FormField
                        name="rName"
                        control={control}
                        label="Room Name"
                        type="text"
                        required
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        helperText={errors.rName?.message}
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField
                        name="rgrpID"
                        control={control}
                        label="Room Group"
                        type="select"
                        required
                        disabled={viewOnly || (initialData?.rgrpID !== undefined && initialData.rgrpID !== 0 && !isAddMode)}
                        size="small"
                        fullWidth
                        options={roomGroups.map((group) => ({
                          value: group.rGrpID,
                          label: group.rGrpName,
                        }))}
                        helperText={errors.rgrpID?.message}
                      />
                    </Grid>
                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField
                        name="deptName"
                        control={control}
                        label="Department"
                        type="text"
                        disabled={true} // Always disabled as it's auto-populated
                        size="small"
                        fullWidth
                        helperText="Auto-populated from selected Room Group"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Location Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField
                        name="rLocationID"
                        control={control}
                        label="Floor/Location"
                        type="select"
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        options={
                          dropdownValues.floor
                            ? dropdownValues.floor.map((floor) => ({
                                value: floor.id, // Use numeric id instead of string value
                                label: floor.label,
                              }))
                            : []
                        }
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="dulID" control={control} label="Unit" type="select" disabled={viewOnly} size="small" fullWidth options={dropdownValues.unit || []} />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField
                        name="noOfBeds"
                        control={control}
                        label="Number of Beds"
                        type="number"
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        InputProps={{ inputProps: { min: 0 } }}
                      />
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
                        placeholder="Enter any additional information about this room"
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

export default RoomListForm;
