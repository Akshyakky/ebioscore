import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { RoomGroupDto, RoomListDto, WrBedDto } from "@/interfaces/HospitalAdministration/Room-BedSetUpDto";
import { useAlert } from "@/providers/AlertProvider";
import { wrBedService } from "@/services/HospitalAdministrationServices/hospitalAdministrationService";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Cancel,
  FolderSpecial as FolderSpecialIcon,
  MeetingRoom as MeetingRoomIcon,
  Refresh,
  Save,
  SubdirectoryArrowRight as SubdirectoryArrowRightIcon,
} from "@mui/icons-material";
import { Alert, Box, Card, CardContent, CircularProgress, Divider, Grid, InputAdornment, TextField, Tooltip, Typography } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface BedFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  initialData: WrBedDto | null;
  viewOnly?: boolean;
  roomGroups: RoomGroupDto[];
  roomLists: RoomListDto[];
}

const schema = z.object({
  bedID: z.number(),
  bedName: z.string().nonempty("Bed name is required"),
  rlID: z.number().min(1, "Room is required"),
  rgrpID: z.number().min(1, "Room group is required"),
  rActiveYN: z.string(),
  rNotes: z.string().optional().nullable(),
  bchID: z.number().optional().nullable(),
  bchName: z.string().optional().nullable(),
  bedRemarks: z.string().optional().nullable(),
  blockBedYN: z.string(),
  key: z.number(),
  transferYN: z.string(),
  wbCatID: z.number().optional().nullable(),
  wbCatName: z.string().optional().nullable(),
  bedStatusValue: z.string().optional().nullable(),
  bedStatus: z.string().optional().nullable(),
});

type BedFormData = z.infer<typeof schema>;

const bedStatusOptions = [
  { value: "AVLBL", label: "Available" },
  { value: "OCCPD", label: "Occupied" },
  { value: "MAINT", label: "Under Maintenance" },
  { value: "RSRVD", label: "Reserved" },
];

const BedForm: React.FC<BedFormProps> = ({ open, onClose, initialData, viewOnly = false, roomGroups, roomLists }) => {
  const { setLoading } = useLoading();
  const { showAlert } = useAlert();
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [filteredRoomLists, setFilteredRoomLists] = useState<RoomListDto[]>([]);
  const [isInitializing, setIsInitializing] = useState(false);
  const isAddMode = !initialData?.bedID;
  const isCradle = initialData?.key && initialData.key > 0;
  const dropdownValues = useDropdownValues(["bedCategory", "serviceType"]);

  const roomInfo = useMemo(() => {
    if (!initialData?.rlID) {
      return { roomName: "Unknown Room", roomGroupName: "Unknown Group" };
    }
    const selectedRoom = roomLists.find((room) => room.rlID === initialData.rlID);
    if (selectedRoom) {
      const roomGroupId = initialData.rgrpID || selectedRoom.rgrpID;
      const selectedRoomGroup = roomGroups.find((group) => group.rGrpID === roomGroupId);
      const result = {
        roomName: selectedRoom.rName || "Unknown Room",
        roomGroupName: selectedRoomGroup?.rGrpName || "Unknown Group",
      };
      return result;
    }

    if (initialData.roomList && initialData.roomList.rName !== "Unknown Room") {
      const fallbackResult = {
        roomName: initialData.roomList.rName,
        roomGroupName: initialData.roomList.roomGroup?.rGrpName || "Unknown Group",
      };
      return fallbackResult;
    }
    return { roomName: "Unknown Room", roomGroupName: "Unknown Group" };
  }, [initialData?.rlID, initialData?.rgrpID, initialData?.roomList, roomLists, roomGroups]);

  const defaultValues: BedFormData = {
    bedID: 0,
    bedName: "",
    rlID: initialData?.rlID || 0,
    rgrpID: initialData?.rgrpID || 0,
    rActiveYN: "Y",
    rNotes: "",
    bchID: null,
    bchName: "",
    bedRemarks: "",
    blockBedYN: "N",
    key: 0,
    transferYN: "N",
    wbCatID: null,
    wbCatName: "",
    bedStatusValue: "AVLBL",
    bedStatus: "Available",
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isDirty, isValid, errors },
  } = useForm<BedFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const rgrpID = watch("rgrpID");
  const rlID = watch("rlID");
  const bedStatusValue = watch("bedStatusValue");
  const wbCatID = watch("wbCatID");
  const bchID = watch("bchID");

  useEffect(() => {
    if (rgrpID) {
      const filtered = roomLists.filter((room) => room.rgrpID === rgrpID);
      setFilteredRoomLists(filtered);
      if (!isInitializing && rlID) {
        const isEditMode = initialData?.bedID && initialData.bedID > 0;
        const currentRoomValid = filtered.some((room) => room.rlID === rlID);
        if (!isEditMode && !currentRoomValid) {
          setValue("rlID", 0, { shouldValidate: true, shouldDirty: true });
        } else if (isEditMode && !currentRoomValid) {
        }
      }
    } else {
      setFilteredRoomLists([]);
    }
  }, [rgrpID, roomLists, rlID, setValue, isInitializing, initialData?.bedID]);

  useEffect(() => {
    if (bedStatusValue) {
      const selectedStatus = bedStatusOptions.find((s) => s.value === bedStatusValue);
      if (selectedStatus) {
        setValue("bedStatus", selectedStatus.label, { shouldValidate: true, shouldDirty: true });
      }
    }
  }, [bedStatusValue, setValue]);

  useEffect(() => {
    if (wbCatID && dropdownValues.bedCategory) {
      const selectedCategory = dropdownValues.bedCategory.find((c) => c.value.toString() === wbCatID.toString());
      if (selectedCategory) {
        setValue("wbCatName", selectedCategory.label, { shouldValidate: true, shouldDirty: true });
      }
    }
  }, [wbCatID, dropdownValues.bedCategory, setValue]);

  useEffect(() => {
    if (bchID && dropdownValues.serviceType) {
      const selectedService = dropdownValues.serviceType.find((s) => s.value.toString() === bchID.toString());
      if (selectedService) {
        setValue("bchName", selectedService.label, { shouldValidate: true, shouldDirty: true });
      }
    }
  }, [bchID, dropdownValues.serviceType, setValue]);

  useEffect(() => {
    setIsInitializing(true);
    if (initialData?.bedID) {
      const formData = {
        ...defaultValues,
        ...initialData,
      };
      reset(formData);
      if (initialData.rgrpID) {
        setValue("rgrpID", initialData.rgrpID, { shouldValidate: true, shouldDirty: false });
      }
    } else {
      const newFormData = { ...defaultValues };
      if (isCradle && initialData) {
        newFormData.key = initialData.key || 0;
        newFormData.rgrpID = initialData.rgrpID || 0;
        newFormData.rlID = initialData.rlID || 0;
        if (!newFormData.rgrpID && newFormData.rlID) {
          const selectedRoom = roomLists.find((room) => room.rlID === newFormData.rlID);
          if (selectedRoom) {
            newFormData.rgrpID = selectedRoom.rgrpID;
          }
        }
        if (initialData.parentBedName) {
          newFormData.rNotes = `Cradle under bed: ${initialData.parentBedName}`;
        }
      } else if (initialData) {
        newFormData.rgrpID = initialData.rgrpID || 0;
        newFormData.rlID = initialData.rlID || 0;
      }
      reset(newFormData);
      if (isCradle && initialData?.rlID) {
        setValue("rlID", initialData.rlID, { shouldValidate: true, shouldDirty: true });
        let roomGroupId = initialData.rgrpID;
        if (!roomGroupId) {
          const selectedRoom = roomLists.find((room) => room.rlID === initialData.rlID);
          roomGroupId = selectedRoom?.rgrpID;
        }
        if (roomGroupId) {
          setValue("rgrpID", roomGroupId, { shouldValidate: true, shouldDirty: true });
        }
        setIsInitializing(false);
      } else if (initialData?.rgrpID) {
        setValue("rgrpID", initialData.rgrpID, { shouldValidate: true, shouldDirty: true });
      } else {
        setIsInitializing(false);
      }
    }
  }, [initialData, reset, setValue, isCradle, roomLists]);

  useEffect(() => {
    if (isAddMode && rlID && !isInitializing) {
      generateBedCode();
    }
  }, [isAddMode, rlID, isInitializing]);

  const onSubmit = async (data: BedFormData) => {
    if (viewOnly) return;
    setFormError(null);
    try {
      setIsSaving(true);
      setLoading(true);
      const formData: WrBedDto = {
        ...data,
        bedID: typeof data.bedID === "string" ? parseInt(data.bedID, 10) : data.bedID ?? 0,
        rlID: typeof data.rlID === "string" ? parseInt(data.rlID, 10) : data.rlID,
        rgrpID: typeof data.rgrpID === "string" ? parseInt(data.rgrpID, 10) : data.rgrpID,
        wbCatID: data.wbCatID ? (typeof data.wbCatID === "string" ? parseInt(data.wbCatID, 10) : data.wbCatID) : 0,
        bchID: data.bchID ? (typeof data.bchID === "string" ? parseInt(data.bchID, 10) : data.bchID) : 0,
        rActiveYN: data.rActiveYN || "Y",
        blockBedYN: data.blockBedYN || "N",
        transferYN: data.transferYN || "N",
        key: isCradle ? initialData?.key || 0 : 0,
        bedStatusValue: data.bedStatusValue || "AVLBL",
        bedStatus: data.bedStatus || "Available",
        bedName: data.bedName.trim(),
        rNotes: data.rNotes?.trim() || "",
        bedRemarks: data.bedRemarks?.trim() || "",
        bchName: data.bchName?.trim() || "",
        wbCatName: data.wbCatName?.trim() || "",
      };

      const response = await wrBedService.save(formData);
      if (response.success) {
        const actionType = isAddMode ? "created" : "updated";
        const itemType = isCradle ? "Cradle" : "Bed";
        const parentInfo = isCradle && initialData?.parentBedName ? ` under bed ${initialData.parentBedName}` : "";

        showAlert("Success", `${itemType} ${actionType} successfully${parentInfo}`, "success");
        onClose(true);
      } else {
        throw new Error(response.errorMessage || `Failed to save ${isCradle ? "cradle" : "bed"}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to save ${isCradle ? "cradle" : "bed"}`;
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  const generateBedCode = async () => {
    if (!isAddMode) return;
    try {
      setIsGeneratingCode(true);
      if (rlID) {
        const selectedRoom = roomLists.find((room) => room.rlID === rlID);
        if (selectedRoom) {
          const existingBeds = await wrBedService.getAll();
          if (existingBeds.success && existingBeds.data) {
            const roomBeds = existingBeds.data.filter((bed) => bed.rlID === rlID);
            let generatedName = "";
            if (isCradle && initialData?.parentBedName && initialData?.key) {
              const parentBedName = initialData.parentBedName;
              const existingCradles = roomBeds.filter((bed) => bed.key === initialData.key && bed.bedName.startsWith(parentBedName));
              const cradleNumber = existingCradles.length + 1;
              generatedName = `${parentBedName}-C${cradleNumber.toString().padStart(2, "0")}`;
              showAlert("Info", `Generated cradle name: ${generatedName} for bed: ${parentBedName}`, "info");
            } else {
              const regularBeds = roomBeds.filter((bed) => !bed.key || bed.key === 0);
              const bedNumber = regularBeds.length + 1;
              generatedName = `${selectedRoom.rName}-B${bedNumber.toString().padStart(3, "0")}`;
            }

            setValue("bedName", generatedName, { shouldValidate: true, shouldDirty: true });
          }
        }
      }
    } catch (error) {
      showAlert("Error", "Failed to generate bed name", "error");
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const performReset = () => {
    setIsInitializing(true);
    if (initialData?.bedID) {
      const formData = initialData as BedFormData;
      reset(formData);
      if (initialData.rgrpID) {
        setValue("rgrpID", initialData.rgrpID, { shouldValidate: true, shouldDirty: false });
        const filtered = roomLists.filter((room) => room.rgrpID === initialData.rgrpID);
        setFilteredRoomLists(filtered);
      }
    } else {
      const resetData = { ...defaultValues };

      if (initialData) {
        resetData.rgrpID = initialData.rgrpID || 0;
        resetData.rlID = initialData.rlID || 0;
        if (isCradle) {
          resetData.key = initialData.key || 0;
          if (initialData.parentBedName) {
            resetData.rNotes = `Cradle under bed: ${initialData.parentBedName}`;
          }
        }
      }
      reset(resetData);
      if (initialData?.rgrpID) {
        setValue("rgrpID", initialData.rgrpID, { shouldValidate: true, shouldDirty: true });
      }
      if (initialData?.rlID) {
        setValue("rlID", initialData.rlID, { shouldValidate: true, shouldDirty: true });
      }
      setIsInitializing(false);
    }
    setFormError(null);

    if (isAddMode && rlID && !isInitializing) {
      generateBedCode();
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

  const handleRefreshName = () => {
    if (isAddMode && rlID && !isInitializing) {
      generateBedCode();
    }
  };

  const dialogTitle = viewOnly
    ? isCradle
      ? `View Cradle Details${initialData?.parentBedName ? ` (Under: ${initialData.parentBedName})` : ""}`
      : "View Bed Details"
    : isAddMode
    ? isCradle
      ? `Create New Cradle${initialData?.parentBedName ? ` for ${initialData.parentBedName}` : ""}`
      : "Create New Bed"
    : `Edit ${isCradle ? "Cradle" : "Bed"} - ${initialData?.bedName}`;

  const dialogActions = viewOnly ? (
    <SmartButton text="Close" onClick={() => onClose()} variant="contained" color="primary" />
  ) : (
    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
      <SmartButton text="Cancel" onClick={handleCancel} variant="outlined" color="inherit" disabled={isSaving} />
      <Box sx={{ display: "flex", gap: 1 }}>
        <SmartButton text="Reset" onClick={handleReset} variant="outlined" color="error" icon={Cancel} disabled={isSaving || (!isDirty && !formError)} />
        <SmartButton
          text={isAddMode ? (isCradle ? `Create Cradle for ${initialData?.parentBedName || "Bed"}` : "Create Bed") : isCradle ? "Update Cradle" : "Update Bed"}
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          color="primary"
          icon={Save}
          asynchronous={true}
          showLoadingIndicator={true}
          loadingText={isAddMode ? (isCradle ? "Creating Cradle..." : "Creating Bed...") : isCradle ? "Updating Cradle..." : "Updating Bed..."}
          successText={isAddMode ? (isCradle ? "Cradle Created!" : "Bed Created!") : isCradle ? "Cradle Updated!" : "Bed Updated!"}
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
          {process.env.NODE_ENV === "development" && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Debug Info:</strong>
                <br />
                isValid: {isValid ? "true" : "false"}
                <br />
                isDirty: {isDirty ? "true" : "false"}
                <br />
                isSaving: {isSaving ? "true" : "false"}
                <br />
                rgrpID: {watch("rgrpID")}
                <br />
                rlID: {watch("rlID")}
                <br />
                bedName: {watch("bedName")}
                <br />
                Errors: {JSON.stringify(errors, null, 2)}
              </Typography>
            </Alert>
          )}

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

            {isCradle && initialData && (
              <Grid size={{ xs: 12 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="body1" component="div" sx={{ fontWeight: 500, mb: 1 }}>
                      {isAddMode ? "Creating Cradle Under:" : "Cradle Information:"}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Box sx={{ bgcolor: "rgba(25, 118, 210, 0.1)", p: 1.5, borderRadius: 1 }}>
                          <Typography variant="caption" color="primary" sx={{ fontWeight: 500 }}>
                            Parent Bed
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {initialData.parentBedName || "Unknown Bed"}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Box sx={{ bgcolor: "rgba(76, 175, 80, 0.1)", p: 1.5, borderRadius: 1 }}>
                          <Typography variant="caption" color="success.main" sx={{ fontWeight: 500 }}>
                            Room
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {roomInfo.roomName}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Box sx={{ bgcolor: "rgba(255, 152, 0, 0.1)", p: 1.5, borderRadius: 1 }}>
                          <Typography variant="caption" color="warning.main" sx={{ fontWeight: 500 }}>
                            Room Group
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {roomInfo.roomGroupName}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    {isAddMode && (
                      <Typography variant="body2" sx={{ mt: 1, fontStyle: "italic", color: "text.secondary" }}>
                        The cradle will inherit the room and group settings from the parent bed.
                      </Typography>
                    )}
                  </Box>
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
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormField
                        name="bedName"
                        control={control}
                        label={isCradle ? "Cradle Name" : "Bed Name"}
                        type="text"
                        required
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        helperText={errors.bedName?.message || (isCradle ? `Cradle name for bed: ${initialData?.parentBedName || "Unknown"}` : "Enter a unique bed name")}
                        InputProps={{
                          startAdornment: isCradle ? (
                            <InputAdornment position="start">
                              <Tooltip title={`Cradle under: ${initialData?.parentBedName}`}>
                                <Box sx={{ display: "flex", alignItems: "center", mr: 1 }}>
                                  <SubdirectoryArrowRightIcon
                                    sx={{
                                      fontSize: "1rem",
                                      color: "secondary.main",
                                      opacity: 0.7,
                                    }}
                                  />
                                </Box>
                              </Tooltip>
                            </InputAdornment>
                          ) : null,
                          endAdornment:
                            isAddMode && !viewOnly && rlID ? (
                              <InputAdornment position="end">
                                {isGeneratingCode ? (
                                  <CircularProgress size={20} />
                                ) : (
                                  <SmartButton
                                    icon={Refresh}
                                    variant="text"
                                    size="small"
                                    onClick={handleRefreshName}
                                    tooltip={isCradle ? `Generate cradle name for ${initialData?.parentBedName}` : "Generate bed name"}
                                    sx={{ minWidth: "unset" }}
                                  />
                                )}
                              </InputAdornment>
                            ) : null,
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormField
                        name="bedStatusValue"
                        control={control}
                        label={isCradle ? "Cradle Status" : "Bed Status"}
                        type="select"
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        options={bedStatusOptions}
                        helperText={isCradle ? "Current status of the cradle" : "Current status of the bed"}
                      />
                    </Grid>

                    {!isCradle ? (
                      <>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <FormField
                            name="rgrpID"
                            control={control}
                            label="Room Group"
                            type="select"
                            required
                            disabled={viewOnly || (Boolean(isCradle) && !isAddMode)}
                            size="small"
                            fullWidth
                            options={roomGroups.map((group) => ({
                              value: group.rGrpID,
                              label: group.rGrpName,
                            }))}
                            helperText={errors.rgrpID?.message}
                          />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                          <FormField
                            name="rlID"
                            control={control}
                            label="Room"
                            type="select"
                            required
                            disabled={viewOnly || (Boolean(isCradle) && !isAddMode) || !rgrpID}
                            size="small"
                            fullWidth
                            options={filteredRoomLists.map((room) => ({
                              value: room.rlID,
                              label: room.rName,
                            }))}
                            helperText={errors.rlID?.message || (!rgrpID && "Select a room group first")}
                          />
                        </Grid>
                      </>
                    ) : (
                      <>
                        <Box sx={{ display: "none" }}>
                          <FormField
                            name="rgrpID"
                            control={control}
                            label="Room Group"
                            type="select"
                            required
                            options={roomGroups.map((group) => ({
                              value: group.rGrpID,
                              label: group.rGrpName,
                            }))}
                          />
                          <FormField
                            name="rlID"
                            control={control}
                            label="Room"
                            type="select"
                            required
                            options={filteredRoomLists.map((room) => ({
                              value: room.rlID,
                              label: room.rName,
                            }))}
                          />
                        </Box>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            label="Room Group (Inherited)"
                            value={roomInfo.roomGroupName}
                            disabled
                            size="small"
                            fullWidth
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <FolderSpecialIcon sx={{ fontSize: "1rem", color: "text.disabled" }} />
                                </InputAdornment>
                              ),
                            }}
                            helperText="Inherited from parent bed"
                          />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            label="Room (Inherited)"
                            value={roomInfo.roomName}
                            disabled
                            size="small"
                            fullWidth
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <MeetingRoomIcon sx={{ fontSize: "1rem", color: "text.disabled" }} />
                                </InputAdornment>
                              ),
                            }}
                            helperText="Inherited from parent bed"
                          />
                        </Grid>
                      </>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {isCradle ? "Cradle Configuration" : "Bed Configuration"}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormField
                        name="wbCatID"
                        control={control}
                        label={isCradle ? "Cradle Category" : "Bed Category"}
                        type="select"
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        options={dropdownValues.bedCategory || []}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormField
                        name="bchID"
                        control={control}
                        label="Service Type"
                        type="select"
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        options={dropdownValues.serviceType || []}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormField name="blockBedYN" control={control} label={isCradle ? "Block Cradle" : "Block Bed"} type="switch" disabled={viewOnly} size="small" />
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
                    <Grid size={{ xs: 12, md: 12 }}>
                      <FormField
                        name="bedRemarks"
                        control={control}
                        label={isCradle ? "Cradle Remarks" : "Bed Remarks"}
                        type="textarea"
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        rows={2}
                        placeholder={`Enter any specific remarks about this ${isCradle ? "cradle" : "bed"}`}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 12 }}>
                      <FormField
                        name="rNotes"
                        control={control}
                        label={isCradle ? "Cradle Notes" : "Notes"}
                        type="textarea"
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        rows={4}
                        placeholder={
                          isCradle ? `Enter notes about this cradle under bed: ${initialData?.parentBedName || "Unknown"}` : "Enter any additional information about this bed"
                        }
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

export default BedForm;
