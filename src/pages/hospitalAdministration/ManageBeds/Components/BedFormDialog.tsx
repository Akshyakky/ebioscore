// src/pages/hospitalAdministration/ManageBeds/Components/BedFormDialog.tsx
import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { RoomGroupDto, RoomListDto, WrBedDto } from "@/interfaces/HospitalAdministration/Room-BedSetUpDto";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bed as BedIcon, Clear as ClearIcon, Crib as CradleIcon, Save as SaveIcon } from "@mui/icons-material";
import { Alert, Box, Chip, Divider, FormControlLabel, Grid, Paper, Switch, Typography } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import BedSelectionDialog from "../BedSelection/BedSelectionDialog";

interface BedFormData {
  bedID?: number;
  bedName: string;
  rlID: number;
  rActiveYN: "Y" | "N";
  bedRemarks?: string;
  blockBedYN?: "Y" | "N";
  wbCatID?: number;
  wbCatName?: string;
  bchID?: number;
  bchName?: string;
  bedStatus?: "Available" | "Occupied" | "Blocked" | "Maintenance" | "Reserved";
  bedStatusValue?: "AVLBL" | "OCCUP" | "BLOCK" | "MNTN" | "RSRV";
  transferYN?: "Y" | "N";
  key?: number;
  isCradle?: boolean; // New field to indicate if this is a cradle
}

interface BedFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<WrBedDto>) => Promise<void>;
  bed?: WrBedDto | null;
  beds: WrBedDto[]; // All beds for cradle selection
  rooms: RoomListDto[];
  roomGroups: RoomGroupDto[];
  mode?: "bed" | "cradle"; // New prop to specify mode
  preselectedBedForCradle?: WrBedDto; // Pre-selected bed when adding cradle
}

// Mapping between bedStatus and bedStatusValue
const bedStatusMapping = {
  Available: "AVLBL",
  Occupied: "OCCUP",
  Blocked: "BLOCK",
  Maintenance: "MNTN",
  Reserved: "RSRV",
} as const;

const bedStatusValueMapping = {
  AVLBL: "Available",
  OCCUP: "Occupied",
  BLOCK: "Blocked",
  MNTN: "Maintenance",
  RSRV: "Reserved",
} as const;

// Enhanced validation schema with cradle validation
const createValidationSchema = (beds: WrBedDto[], isEditMode: boolean, currentBedId?: number) => {
  return z
    .object({
      bedID: z.number().optional(),
      bedName: z
        .string()
        .min(1, "Bed name must be at least 1 character")
        .max(50, "Bed name must not exceed 50 characters")
        .regex(/^[a-zA-Z0-9\s\-_]+$/, "Bed name can only contain letters, numbers, spaces, hyphens, and underscores"),
      rlID: z.number().min(1, "Please select a valid room"),
      rActiveYN: z.enum(["Y", "N"], { required_error: "Active status is required" }),
      bedRemarks: z.string().max(500, "Remarks must not exceed 500 characters").optional(),
      blockBedYN: z.enum(["Y", "N"], { required_error: "Block bed status must be Y or N" }).optional(),
      wbCatID: z.number().min(1, "Please select a bed category").optional(),
      wbCatName: z.string().optional(),
      bchID: z.number().min(1, "Please select a service type").optional(),
      bchName: z.string().optional(),
      bedStatus: z.enum(["Available", "Occupied", "Blocked", "Maintenance", "Reserved"], { required_error: "Bed status is required" }),
      bedStatusValue: z.enum(["AVLBL", "OCCUP", "BLOCK", "MNTN", "RSRV"], { required_error: "Bed status value is required" }),
      transferYN: z.enum(["Y", "N"], { required_error: "Transfer status must be Y or N" }).optional(),
      key: z.number().optional(),
      isCradle: z.boolean().optional(),
    })
    .required({
      bedName: true,
      rlID: true,
      rActiveYN: true,
      bedStatus: true,
      bedStatusValue: true,
    })
    .refine(
      (data) => {
        // If this is a cradle (key > 0), validate that the key corresponds to a valid bed
        if (data.key && data.key > 0) {
          const associatedBed = beds.find((bed) => bed.bedID === data.key);
          if (!associatedBed) {
            return false;
          }
          // Cannot associate cradle with itself
          if (isEditMode && data.key === currentBedId) {
            return false;
          }
          // Cannot associate cradle with another cradle
          if (associatedBed.key && associatedBed.key > 0) {
            return false;
          }
        }
        return true;
      },
      {
        message: "Invalid bed selection for cradle association",
        path: ["key"],
      }
    )
    .refine(
      (data) => {
        // Ensure unique bed names within the same room
        if (beds && data.rlID) {
          const bedsInSameRoom = beds.filter((bed) => bed.rlID === data.rlID && bed.bedID !== currentBedId);
          const nameExists = bedsInSameRoom.some((bed) => bed.bedName.toLowerCase() === data.bedName.toLowerCase());
          return !nameExists;
        }
        return true;
      },
      {
        message: "Bed name must be unique within the same room",
        path: ["bedName"],
      }
    );
};

type BedFormSchema = z.infer<ReturnType<typeof createValidationSchema>>;

const BedFormDialog: React.FC<BedFormDialogProps> = ({ open, onClose, onSubmit, bed, beds = [], rooms, roomGroups, mode = "bed", preselectedBedForCradle }) => {
  const isEditMode = !!bed;
  const isCradleMode = mode === "cradle";

  // State for bed selection dialog
  const [isBedSelectionOpen, setIsBedSelectionOpen] = useState(false);
  const [selectedBedForCradle, setSelectedBedForCradle] = useState<WrBedDto | null>(preselectedBedForCradle || null);

  // Load dropdown values
  const { bedCategory = [], serviceType = [] } = useDropdownValues(["bedCategory", "serviceType"]);

  // Create validation schema with current beds data
  const validationSchema = useMemo(() => {
    return createValidationSchema(beds, isEditMode, bed?.bedID);
  }, [beds, isEditMode, bed?.bedID]);

  // Form setup
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<BedFormSchema>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      bedName: "",
      rlID: 0,
      rActiveYN: "Y" as const,
      bedRemarks: "",
      blockBedYN: "N" as const,
      wbCatID: undefined,
      wbCatName: "",
      bchID: undefined,
      bchName: "",
      bedStatus: "Available" as const,
      bedStatusValue: "AVLBL" as const,
      transferYN: "N" as const,
      key: undefined,
      isCradle: isCradleMode,
    },
  });

  // Watch form values
  const selectedRoomId = watch("rlID");
  const watchedBedStatus = watch("bedStatus");
  const watchedBedCategoryId = watch("wbCatID");
  const watchedServiceTypeId = watch("bchID");
  const watchedKey = watch("key");
  const watchedIsCradle = watch("isCradle");

  // Get selected room details
  const selectedRoom = useMemo(() => {
    return rooms.find((room) => room.rlID === selectedRoomId);
  }, [rooms, selectedRoomId]);

  // Get associated bed details for cradle
  const associatedBed = useMemo(() => {
    if (watchedKey && watchedKey > 0) {
      return beds.find((bed) => bed.bedID === watchedKey);
    }
    return null;
  }, [beds, watchedKey]);

  // Effect to sync bedStatus and bedStatusValue
  useEffect(() => {
    if (watchedBedStatus) {
      const correspondingValue = bedStatusMapping[watchedBedStatus];
      setValue("bedStatusValue", correspondingValue, { shouldValidate: true });
    }
  }, [watchedBedStatus, setValue]);

  // Effect to sync bed category name when category ID changes
  useEffect(() => {
    if (watchedBedCategoryId) {
      const selectedCategory = bedCategory.find((cat) => Number(cat.value) === watchedBedCategoryId);
      setValue("wbCatName", selectedCategory?.label || "", { shouldValidate: true });
    } else {
      setValue("wbCatName", "", { shouldValidate: true });
    }
  }, [watchedBedCategoryId, bedCategory, setValue]);

  // Effect to sync service type name when service type ID changes
  useEffect(() => {
    if (watchedServiceTypeId) {
      const selectedService = serviceType.find((svc) => Number(svc.value) === watchedServiceTypeId);
      setValue("bchName", selectedService?.label || "", { shouldValidate: true });
    } else {
      setValue("bchName", "", { shouldValidate: true });
    }
  }, [watchedServiceTypeId, serviceType, setValue]);

  // Effect to handle cradle mode changes
  useEffect(() => {
    if (watchedIsCradle) {
      // If switching to cradle mode, clear key if not already set
      if (!watchedKey && selectedBedForCradle) {
        setValue("key", selectedBedForCradle.bedID, { shouldValidate: true });
      }
    } else {
      // If switching to bed mode, clear key
      setValue("key", undefined, { shouldValidate: true });
      setSelectedBedForCradle(null);
    }
  }, [watchedIsCradle, watchedKey, selectedBedForCradle, setValue]);

  // Effect to populate form when editing or in cradle mode
  useEffect(() => {
    if (open) {
      if (isEditMode && bed) {
        // Determine if this is a cradle (has key > 0)
        const isCradle = !!(bed.key && bed.key > 0);

        // Determine bedStatus from bedStatusValue if bedStatus is not provided
        let bedStatus = bed.bedStatus;
        if (!bedStatus && bed.bedStatusValue) {
          bedStatus = bedStatusValueMapping[bed.bedStatusValue as keyof typeof bedStatusValueMapping];
        }

        // Determine bedStatusValue from bedStatus if bedStatusValue is not provided
        let bedStatusValue = bed.bedStatusValue;
        if (!bedStatusValue && bedStatus) {
          bedStatusValue = bedStatusMapping[bedStatus as keyof typeof bedStatusMapping];
        }

        reset({
          bedID: bed.bedID,
          bedName: bed.bedName,
          rlID: bed.rlID,
          rActiveYN: bed.rActiveYN as "Y" | "N",
          bedRemarks: bed.bedRemarks || "",
          blockBedYN: (bed.blockBedYN || "N") as "Y" | "N",
          wbCatID: bed.wbCatID || undefined,
          wbCatName: bed.wbCatName || "",
          bchID: bed.bchID || undefined,
          bchName: bed.bchName || "",
          bedStatus: (bedStatus || "Available") as "Available" | "Occupied" | "Blocked" | "Maintenance" | "Reserved",
          bedStatusValue: (bedStatusValue || "AVLBL") as "AVLBL" | "OCCUP" | "BLOCK" | "MNTN" | "RSRV",
          transferYN: (bed.transferYN || "N") as "Y" | "N",
          key: bed.key || undefined,
          isCradle: isCradle,
        });

        // Set selected bed for cradle if applicable
        if (isCradle && bed.key) {
          const associatedBed = beds.find((b) => b.bedID === bed.key);
          setSelectedBedForCradle(associatedBed || null);
        }
      } else {
        // New bed/cradle
        const initialValues = {
          bedName: "",
          rlID: 0,
          rActiveYN: "Y" as const,
          bedRemarks: "",
          blockBedYN: "N" as const,
          wbCatID: undefined,
          wbCatName: "",
          bchID: undefined,
          bchName: "",
          bedStatus: "Available" as const,
          bedStatusValue: "AVLBL" as const,
          transferYN: "N" as const,
          key: undefined,
          isCradle: isCradleMode,
        };

        // If creating cradle with preselected bed
        if (isCradleMode && preselectedBedForCradle) {
          initialValues.key = preselectedBedForCradle.bedID;
          initialValues.bedName = `CRADLE-${preselectedBedForCradle.bedName}`;
          initialValues.rlID = preselectedBedForCradle.rlID;
          setSelectedBedForCradle(preselectedBedForCradle);
        }

        reset(initialValues);
      }
    }
  }, [open, isEditMode, bed, beds, isCradleMode, preselectedBedForCradle, reset]);

  // Handle bed selection for cradle
  const handleBedSelectionForCradle = (selectedBed: WrBedDto) => {
    setSelectedBedForCradle(selectedBed);
    setValue("key", selectedBed.bedID, { shouldValidate: true });

    // Auto-populate cradle name and room if not already set
    if (!watch("bedName") || watch("bedName").startsWith("CRADLE-")) {
      setValue("bedName", `CRADLE-${selectedBed.bedName}`, { shouldValidate: true });
    }
    if (!watch("rlID") || watch("rlID") === 0) {
      setValue("rlID", selectedBed.rlID, { shouldValidate: true });
    }

    setIsBedSelectionOpen(false);
  };

  // Form submission handler
  const handleFormSubmit = async (data: BedFormData) => {
    // Format data for submission
    const formattedData: Partial<WrBedDto> = {
      ...data,
      // Only include key if it has a value (for cradle association)
      key: data.isCradle && data.key && data.key > 0 ? data.key : 0,
    };

    // Remove the isCradle field as it's not part of the DTO
    delete (formattedData as any).isCradle;

    await onSubmit(formattedData);
  };

  // Clear form handler
  const handleClear = () => {
    reset({
      bedName: "",
      rlID: 0,
      rActiveYN: "Y" as const,
      bedRemarks: "",
      blockBedYN: "N" as const,
      wbCatID: undefined,
      wbCatName: "",
      bchID: undefined,
      bchName: "",
      bedStatus: "Available" as const,
      bedStatusValue: "AVLBL" as const,
      transferYN: "N" as const,
      key: undefined,
      isCradle: isCradleMode,
    });
    setSelectedBedForCradle(null);
  };

  // Close dialog handler
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  // Room options for dropdown
  const roomOptions = useMemo(() => {
    return rooms.map((room) => ({
      value: room.rlID,
      label: `${room.rName} (${room.roomGroup?.rGrpName || "No Group"}) - ${room.noOfBeds} beds`,
    }));
  }, [rooms]);

  // Bed category options
  const bedCategoryOptions = useMemo(() => {
    return bedCategory.map((category) => ({
      value: category.value,
      label: category.label,
    }));
  }, [bedCategory]);

  // Service type options
  const serviceTypeOptions = useMemo(() => {
    return serviceType.map((service) => ({
      value: service.value,
      label: service.label,
    }));
  }, [serviceType]);

  // Bed status options
  const bedStatusOptions = [
    { value: "Available", label: "Available" },
    { value: "Occupied", label: "Occupied" },
    { value: "Blocked", label: "Blocked" },
    { value: "Maintenance", label: "Maintenance" },
    { value: "Reserved", label: "Reserved" },
  ];

  // Active status options
  const activeStatusOptions = [
    { value: "Y", label: "Yes" },
    { value: "N", label: "No" },
  ];

  // Yes/No options for other fields
  const yesNoOptions = [
    { value: "Y", label: "Yes" },
    { value: "N", label: "No" },
  ];

  // Check if form has changes
  const hasChanges = isDirty;

  // Get available beds for cradle selection (exclude self and other cradles)
  const availableBedsForCradle = useMemo(() => {
    return beds.filter((bed) => {
      // Exclude current bed if editing
      if (isEditMode && bed.bedID === watch("bedID")) return false;
      // Exclude beds that are already cradles
      if (bed.key && bed.key > 0) return false;
      // Only include active beds
      if (bed.rActiveYN !== "Y") return false;
      return true;
    });
  }, [beds, isEditMode, watch]);

  const dialogTitle = isEditMode ? (watchedIsCradle ? "Edit Cradle" : "Edit Bed") : isCradleMode ? "Add New Cradle" : "Add New Bed";

  return (
    <>
      <GenericDialog
        open={open}
        onClose={handleClose}
        title={dialogTitle}
        maxWidth="lg"
        fullWidth
        disableBackdropClick={isSubmitting}
        disableEscapeKeyDown={isSubmitting}
        actions={
          <>
            <CustomButton variant="outlined" text="Clear" icon={ClearIcon} onClick={handleClear} disabled={isSubmitting || !hasChanges} color="inherit" />
            <CustomButton variant="outlined" text="Cancel" onClick={handleClose} disabled={isSubmitting} />
            <SmartButton
              variant="contained"
              text={isEditMode ? (watchedIsCradle ? "Update Cradle" : "Update Bed") : isCradleMode ? "Save Cradle" : "Save Bed"}
              icon={SaveIcon}
              onAsyncClick={handleSubmit(handleFormSubmit)}
              asynchronous
              disabled={!hasChanges}
              color="primary"
              loadingText={isEditMode ? "Updating..." : "Saving..."}
              successText={isEditMode ? "Updated!" : "Saved!"}
            />
          </>
        }
      >
        <form>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              {/* Bed/Cradle Type Selection */}
              {!isEditMode && (
                <Grid size={{ xs: 12 }}>
                  <Paper sx={{ p: 2, backgroundColor: "primary.50", border: "1px solid", borderColor: "primary.200" }}>
                    <FormControlLabel
                      control={<Switch checked={watchedIsCradle} onChange={(e) => setValue("isCradle", e.target.checked, { shouldValidate: true })} disabled={isSubmitting} />}
                      label={
                        <Box display="flex" alignItems="center" gap={1}>
                          {watchedIsCradle ? <CradleIcon color="primary" /> : <BedIcon color="primary" />}
                          <Typography variant="subtitle1" fontWeight="medium">
                            {watchedIsCradle ? "Create as Cradle" : "Create as Bed"}
                          </Typography>
                        </Box>
                      }
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 5 }}>
                      {watchedIsCradle ? "A cradle is associated with a specific bed and shares its location" : "A bed is a primary sleeping unit in a room"}
                    </Typography>
                  </Paper>
                </Grid>
              )}

              {/* Basic Information */}
              <Grid size={{ xs: 12 }}>
                <Box sx={{ mb: 2, fontWeight: "bold", color: "primary.main" }}>Basic Information</Box>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <EnhancedFormField
                  name="bedName"
                  control={control}
                  type="text"
                  label={watchedIsCradle ? "Cradle Name" : "Bed Name"}
                  placeholder={watchedIsCradle ? "Enter cradle name (e.g., CRADLE-B001)" : "Enter bed name (e.g., B001, Room1-Bed1)"}
                  required
                  disabled={isSubmitting}
                  helperText={watchedIsCradle ? "Unique identifier for the cradle" : "Unique identifier for the bed"}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <EnhancedFormField
                  name="rlID"
                  control={control}
                  type="select"
                  label="Room"
                  options={roomOptions}
                  required
                  disabled={isSubmitting}
                  helperText={watchedIsCradle ? "Room where this cradle is located (usually same as associated bed)" : "Select the room where this bed is located"}
                  defaultText="Select a room"
                />
              </Grid>

              {/* Cradle Association Section */}
              {watchedIsCradle && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <Divider />
                    <Box sx={{ my: 2, fontWeight: "bold", color: "secondary.main" }}>Cradle Association</Box>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Typography variant="subtitle1">Associated Bed:</Typography>
                      {selectedBedForCradle ? (
                        <Chip
                          icon={<BedIcon />}
                          label={`${selectedBedForCradle.bedName} (${selectedBedForCradle.roomList?.rName || "Unknown Room"})`}
                          color="primary"
                          onDelete={() => {
                            setSelectedBedForCradle(null);
                            setValue("key", undefined, { shouldValidate: true });
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No bed selected
                        </Typography>
                      )}
                    </Box>
                    <CustomButton variant="outlined" text="Select Bed for Cradle" icon={BedIcon} onClick={() => setIsBedSelectionOpen(true)} disabled={isSubmitting} />
                    {errors.key && (
                      <Typography variant="caption" color="error.main" sx={{ mt: 1, display: "block" }}>
                        {errors.key.message}
                      </Typography>
                    )}
                  </Grid>

                  {/* Associated Bed Information */}
                  {associatedBed && (
                    <Grid size={{ xs: 12 }}>
                      <Paper sx={{ p: 2, backgroundColor: "grey.50", border: "1px solid", borderColor: "grey.300" }}>
                        <Typography variant="subtitle2" gutterBottom color="primary.main">
                          Associated Bed Information
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, md: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                              Bed Name
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {associatedBed.bedName}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 12, md: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                              Room
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {associatedBed.roomList?.rName || "Unknown"}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 12, md: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                              Room Group
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {associatedBed.roomList?.roomGroup?.rGrpName || "Unknown"}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 12, md: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                              Status
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {associatedBed.bedStatusValue || "Unknown"}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  )}
                </>
              )}

              {/* Room Information Display */}
              {selectedRoom && (
                <Grid size={{ xs: 12 }}>
                  <Paper sx={{ p: 2, backgroundColor: "grey.50", border: "1px solid", borderColor: "grey.300" }}>
                    <Typography variant="subtitle2" gutterBottom color="primary.main">
                      Room Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          Room Group
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {selectedRoom.roomGroup?.rGrpName || "N/A"}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          Department
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {selectedRoom.deptName || "N/A"}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          Total Beds
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {selectedRoom.noOfBeds}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              )}

              {/* Cradle Information Alert */}
              {watchedIsCradle && (
                <Grid size={{ xs: 12 }}>
                  <Alert severity="info" icon={<CradleIcon />}>
                    <Typography variant="body2">
                      <strong>Cradle Association:</strong> A cradle is associated with a specific bed through the bed selection above. The cradle will share the same room location
                      as the associated bed and serves as an additional sleeping unit for that bed. Each bed can have only one associated cradle.
                    </Typography>
                  </Alert>
                </Grid>
              )}

              <Grid size={{ xs: 12 }}>
                <Divider />
              </Grid>

              {/* Classification Information */}
              <Grid size={{ xs: 12 }}>
                <Box sx={{ mb: 2, fontWeight: "bold", color: "primary.main" }}>Classification & Service Information</Box>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <EnhancedFormField
                  name="wbCatID"
                  control={control}
                  type="select"
                  label={watchedIsCradle ? "Cradle Category" : "Bed Category"}
                  options={bedCategoryOptions}
                  disabled={isSubmitting}
                  helperText={watchedIsCradle ? "Select the category of this cradle" : "Select the category of this bed"}
                  defaultText={watchedIsCradle ? "Select cradle category" : "Select bed category"}
                  clearable
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <EnhancedFormField
                  name="bchID"
                  control={control}
                  type="select"
                  label="Service Type"
                  options={serviceTypeOptions}
                  disabled={isSubmitting}
                  helperText={watchedIsCradle ? "Select the service type for this cradle" : "Select the service type for this bed"}
                  defaultText="Select service type"
                  clearable
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Divider />
              </Grid>

              {/* Status Information */}
              <Grid size={{ xs: 12 }}>
                <Box sx={{ mb: 2, fontWeight: "bold", color: "primary.main" }}>Status Information</Box>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <EnhancedFormField
                  name="bedStatus"
                  control={control}
                  type="select"
                  label={watchedIsCradle ? "Cradle Status" : "Bed Status"}
                  options={bedStatusOptions}
                  required
                  disabled={isSubmitting}
                  helperText={watchedIsCradle ? "Current operational status of the cradle" : "Current operational status of the bed"}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <EnhancedFormField
                  name="rActiveYN"
                  control={control}
                  type="select"
                  label="Active Status"
                  options={activeStatusOptions}
                  required
                  disabled={isSubmitting}
                  helperText={watchedIsCradle ? "Whether this cradle is active in the system" : "Whether this bed is active in the system"}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <EnhancedFormField
                  name="blockBedYN"
                  control={control}
                  type="select"
                  label={watchedIsCradle ? "Block Cradle" : "Block Bed"}
                  options={yesNoOptions}
                  disabled={isSubmitting}
                  helperText={watchedIsCradle ? "Temporarily block this cradle from use" : "Temporarily block this bed from use"}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <EnhancedFormField
                  name="transferYN"
                  control={control}
                  type="select"
                  label="Transfer Allowed"
                  options={yesNoOptions}
                  disabled={isSubmitting}
                  helperText={watchedIsCradle ? "Whether transfers are allowed for this cradle" : "Whether transfers are allowed for this bed"}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Divider />
              </Grid>

              {/* Additional Information */}
              <Grid size={{ xs: 12 }}>
                <Box sx={{ mb: 2, fontWeight: "bold", color: "primary.main" }}>Additional Information</Box>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <EnhancedFormField
                  name="bedRemarks"
                  control={control}
                  type="textarea"
                  label="Remarks"
                  placeholder={watchedIsCradle ? "Enter any additional notes or comments about this cradle" : "Enter any additional notes or comments about this bed"}
                  rows={3}
                  disabled={isSubmitting}
                  helperText={`Optional notes about the ${watchedIsCradle ? "cradle" : "bed"} (max 500 characters)`}
                />
              </Grid>
            </Grid>
          </Box>
        </form>
      </GenericDialog>

      {/* Bed Selection Dialog for Cradle */}
      <BedSelectionDialog
        open={isBedSelectionOpen}
        onClose={() => setIsBedSelectionOpen(false)}
        onSelect={handleBedSelectionForCradle}
        beds={availableBedsForCradle}
        rooms={rooms}
        roomGroups={roomGroups}
        title="Select Bed for Cradle Association"
        filters={{ availableOnly: false }}
        allowOccupied={true}
      />
    </>
  );
};

export default BedFormDialog;
