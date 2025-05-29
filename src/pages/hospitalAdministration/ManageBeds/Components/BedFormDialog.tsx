// src/pages/hospitalAdministration/ManageBeds/Components/BedFormDialog.tsx
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Box, Grid, Divider, Alert, Typography } from "@mui/material";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import { Save as SaveIcon, Clear as ClearIcon, Key as KeyIcon } from "@mui/icons-material";
import { WrBedDto, RoomListDto, RoomGroupDto } from "@/interfaces/HospitalAdministration/Room-BedSetUpDto";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";

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
}

interface BedFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<WrBedDto>) => Promise<void>;
  bed?: WrBedDto | null;
  rooms: RoomListDto[];
  roomGroups: RoomGroupDto[];
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

// Zod validation schema
const validationSchema = z
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
    key: z.number().min(1, "Cradle key must be a positive number").optional(),
  })
  .required({
    bedName: true,
    rlID: true,
    rActiveYN: true,
    bedStatus: true,
    bedStatusValue: true,
  });

type BedFormSchema = z.infer<typeof validationSchema>;

const BedFormDialog: React.FC<BedFormDialogProps> = ({ open, onClose, onSubmit, bed, rooms, roomGroups }) => {
  const isEditMode = !!bed;

  // Load dropdown values
  const { bedCategory = [], serviceType = [] } = useDropdownValues(["bedCategory", "serviceType"]);

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
    },
  });

  // Watch room selection and dropdown selections
  const selectedRoomId = watch("rlID");
  const watchedBedStatus = watch("bedStatus");
  const watchedBedCategoryId = watch("wbCatID");
  const watchedServiceTypeId = watch("bchID");

  // Get selected room details
  const selectedRoom = useMemo(() => {
    return rooms.find((room) => room.rlID === selectedRoomId);
  }, [rooms, selectedRoomId]);

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

  // Effect to populate form when editing
  useEffect(() => {
    if (open) {
      if (isEditMode && bed) {
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
        });
      } else {
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
        });
      }
    }
  }, [open, isEditMode, bed, reset]);

  // Form submission handler
  const handleFormSubmit = async (data: BedFormData) => {
    // Ensure names are populated from dropdown selections if IDs are provided
    const formattedData: Partial<WrBedDto> = {
      ...data,
      // Only include key if it has a value (for cradle association)
      key: data.key && data.key > 0 ? data.key : undefined,
    };

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
    });
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

  // Bed status options (using full text for display)
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

  return (
    <GenericDialog
      open={open}
      onClose={handleClose}
      title={isEditMode ? "Edit Bed" : "Add New Bed"}
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
            text={isEditMode ? "Update Bed" : "Save Bed"}
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
            {/* Basic Information */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ mb: 2, fontWeight: "bold", color: "primary.main" }}>Basic Information</Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <EnhancedFormField
                name="bedName"
                control={control}
                type="text"
                label="Bed Name"
                placeholder="Enter bed name (e.g., B001, Room1-Bed1)"
                required
                disabled={isSubmitting}
                helperText="Unique identifier for the bed"
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
                helperText="Select the room where this bed is located"
                defaultText="Select a room"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <EnhancedFormField
                name="key"
                control={control}
                type="number"
                label="Cradle Key"
                placeholder="Enter cradle identifier"
                disabled={isSubmitting}
                helperText="Unique key to associate a cradle with this bed (leave empty if no cradle)"
                min={1}
                //icon={<KeyIcon />}
              />
            </Grid>

            {/* Room Information Display */}
            {selectedRoom && (
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: "grey.50",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "grey.300",
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box>
                        <strong>Room Group:</strong> {selectedRoom.roomGroup?.rGrpName || "N/A"}
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box>
                        <strong>Department:</strong> {selectedRoom.deptName || "N/A"}
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box>
                        <strong>Total Beds:</strong> {selectedRoom.noOfBeds}
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            )}

            {/* Cradle Information Alert */}
            <Grid size={{ xs: 12 }}>
              <Alert severity="info" icon={<KeyIcon />}>
                <Typography variant="body2">
                  <strong>Cradle Association:</strong> The cradle key field allows you to associate a cradle with this bed. When a key is provided, it serves as the unique
                  identifier for the cradle linked to this specific bed. Leave this field empty if no cradle is associated with this bed.
                </Typography>
              </Alert>
            </Grid>

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
                label="Bed Category"
                options={bedCategoryOptions}
                disabled={isSubmitting}
                helperText="Select the category of this bed"
                defaultText="Select bed category"
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
                helperText="Select the service type for this bed"
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
                label="Bed Status"
                options={bedStatusOptions}
                required
                disabled={isSubmitting}
                helperText="Current operational status of the bed"
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
                helperText="Whether this bed is active in the system"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <EnhancedFormField
                name="blockBedYN"
                control={control}
                type="select"
                label="Block Bed"
                options={yesNoOptions}
                disabled={isSubmitting}
                helperText="Temporarily block this bed from use"
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
                helperText="Whether transfers are allowed for this bed"
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
                placeholder="Enter any additional notes or comments about this bed"
                rows={3}
                disabled={isSubmitting}
                helperText="Optional notes about the bed (max 500 characters)"
              />
            </Grid>
          </Grid>
        </Box>
      </form>
    </GenericDialog>
  );
};

export default BedFormDialog;
