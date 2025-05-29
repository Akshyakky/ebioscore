import React, { useState, useEffect } from "react";
import { Box, Grid, Typography, Divider, Card, CardContent, Alert, InputAdornment, CircularProgress } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { RoomGroupDto, RoomListDto, WrBedDto } from "@/interfaces/HospitalAdministration/Room-BedSetUpDto";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import SmartButton from "@/components/Button/SmartButton";
import { Save, Cancel, Refresh } from "@mui/icons-material";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import { useAlert } from "@/providers/AlertProvider";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { wrBedService } from "@/services/HospitalAdministrationServices/hospitalAdministrationService";

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
  const isAddMode = !initialData?.bedID;
  const isCradle = initialData?.key && initialData.key > 0;
  const dropdownValues = useDropdownValues(["bedCategory", "serviceType"]);

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
    key: isCradle && initialData ? initialData.key : 0,
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
      if (rlID && !filtered.some((room) => room.rlID === rlID)) {
        setValue("rlID", 0, { shouldValidate: true, shouldDirty: true });
      }
    } else {
      setFilteredRoomLists([]);
    }
  }, [rgrpID, roomLists, rlID, setValue]);

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
    if (initialData?.bedID) {
      reset({
        ...defaultValues,
        ...initialData,
      });
    } else {
      reset(defaultValues);
      if (initialData?.rgrpID) {
        setValue("rgrpID", initialData.rgrpID, { shouldValidate: true, shouldDirty: true });
      }
      if (initialData?.rlID) {
        setValue("rlID", initialData.rlID, { shouldValidate: true, shouldDirty: true });
      }
    }
  }, [initialData, reset, setValue]);

  const generateBedCode = async () => {
    if (!isAddMode) return;
    try {
      setIsGeneratingCode(true);
      if (rlID) {
        const selectedRoom = roomLists.find((room) => room.rlID === rlID);
        if (selectedRoom) {
          const existingBeds = await wrBedService.getAll();
          if (existingBeds.success && existingBeds.data) {
            const roomBeds = existingBeds.data.filter((bed: WrBedDto) => bed.rlID === rlID && bed.key === 0);
            const nextNumber = roomBeds.length + 1;
            const bedName = isCradle ? `CRADLE ${nextNumber}` : `${selectedRoom.rName.replace("ROOM", "BED")} ${nextNumber.toString().padStart(2, "0")}`;
            setValue("bedName", bedName, { shouldValidate: true, shouldDirty: true });
          }
        }
      }
    } catch (error) {
    } finally {
      setIsGeneratingCode(false);
    }
  };

  useEffect(() => {
    if (isAddMode && rlID) {
      generateBedCode();
    }
  }, [isAddMode, rlID]);

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
        wbCatID: data.wbCatID ? (typeof data.wbCatID === "string" ? parseInt(data.wbCatID, 10) : data.wbCatID) : null,
        bchID: data.bchID ? (typeof data.bchID === "string" ? parseInt(data.bchID, 10) : data.bchID) : null,
        rActiveYN: data.rActiveYN || "Y",
        blockBedYN: data.blockBedYN || "N",
        transferYN: data.transferYN || "N",
        key: isCradle && initialData ? initialData.key : 0,
        bedStatusValue: data.bedStatusValue || "AVLBL",
        bedStatus: data.bedStatus || "Available",
        bedName: data.bedName.trim(),
        rNotes: data.rNotes?.trim() || null,
        bedRemarks: data.bedRemarks?.trim() || null,
      };

      const response = await wrBedService.save(formData);
      if (response.success) {
        showAlert("Success", isAddMode ? "Bed created successfully" : "Bed updated successfully", "success");
        onClose(true);
      } else {
        throw new Error(response.errorMessage || "Failed to save bed");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save bed";
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  const performReset = () => {
    if (initialData?.bedID) {
      reset(initialData as BedFormData);
    } else {
      reset(defaultValues);
      if (initialData?.rgrpID) {
        setValue("rgrpID", initialData.rgrpID, { shouldValidate: true, shouldDirty: true });
      }
      if (initialData?.rlID) {
        setValue("rlID", initialData.rlID, { shouldValidate: true, shouldDirty: true });
      }
    }
    setFormError(null);

    if (isAddMode && rlID) {
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
    if (isAddMode && rlID) {
      generateBedCode();
    }
  };

  const dialogTitle = viewOnly ? "View Bed Details" : isAddMode ? (isCradle ? "Create New Cradle" : "Create New Bed") : `Edit Bed - ${initialData?.bedName}`;

  const dialogActions = viewOnly ? (
    <SmartButton text="Close" onClick={() => onClose()} variant="contained" color="primary" />
  ) : (
    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
      <SmartButton text="Cancel" onClick={handleCancel} variant="outlined" color="inherit" disabled={isSaving} />
      <Box sx={{ display: "flex", gap: 1 }}>
        <SmartButton text="Reset" onClick={handleReset} variant="outlined" color="error" icon={Cancel} disabled={isSaving || (!isDirty && !formError)} />
        <SmartButton
          text={isAddMode ? (isCradle ? "Create Cradle" : "Create Bed") : "Update Bed"}
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

            {isCradle && initialData?.key && (
              <Grid size={{ xs: 12 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  This cradle will be created under:{" "}
                  <strong>
                    {initialData.roomList?.roomGroup?.rGrpName} - {initialData.roomList?.rName}
                  </strong>
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
                        label="Bed Name"
                        type="text"
                        required
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        helperText={errors.bedName?.message}
                        InputProps={{
                          endAdornment:
                            isAddMode && !viewOnly && rlID ? (
                              <InputAdornment position="end">
                                {isGeneratingCode ? (
                                  <CircularProgress size={20} />
                                ) : (
                                  <SmartButton icon={Refresh} variant="text" size="small" onClick={handleRefreshName} tooltip="Generate name" sx={{ minWidth: "unset" }} />
                                )}
                              </InputAdornment>
                            ) : null,
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormField name="bedStatusValue" control={control} label="Bed Status" type="select" disabled={viewOnly} size="small" fullWidth options={bedStatusOptions} />
                    </Grid>

                    {!isCradle && (
                      <>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <FormField
                            name="rgrpID"
                            control={control}
                            label="Room Group"
                            type="select"
                            required
                            disabled={viewOnly || (initialData?.rgrpID && !isAddMode)}
                            size="small"
                            fullWidth
                            options={roomGroups.map((group) => ({
                              value: group.rGrpID.toString(),
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
                            disabled={viewOnly || (initialData?.rlID && !isAddMode) || !rgrpID}
                            size="small"
                            fullWidth
                            options={filteredRoomLists.map((room) => ({
                              value: room.rlID.toString(),
                              label: room.rName,
                            }))}
                            helperText={errors.rlID?.message || (!rgrpID && "Select a room group first")}
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
                    Bed Configuration
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormField
                        name="wbCatID"
                        control={control}
                        label="Bed Category"
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
                      <FormField name="blockBedYN" control={control} label="Block Bed" type="switch" disabled={viewOnly} size="small" />
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
                        label="Bed Remarks"
                        type="textarea"
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        rows={2}
                        placeholder="Enter any specific remarks about this bed"
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 12 }}>
                      <FormField
                        name="rNotes"
                        control={control}
                        label="Notes"
                        type="textarea"
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        rows={4}
                        placeholder="Enter any additional information about this bed"
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
