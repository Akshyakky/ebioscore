// src/pages/hospitalAdministration/ManageBeds/Components/BedFormDialog.tsx
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"; // Import zodResolver
import { z } from "zod"; // Import z from zod
import { Box, Grid, Divider } from "@mui/material";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import FormSaveClearButton from "@/components/Button/FormSaveClearButton";
import { Save as SaveIcon, Clear as ClearIcon } from "@mui/icons-material";
import { WrBedDto, RoomListDto, RoomGroupDto } from "@/interfaces/HospitalAdministration/Room-BedSetUpDto";

interface BedFormData {
  bedID?: number;
  bedName: string;
  rlID: number;
  rActiveYN: "Y" | "N";
  bedRemarks?: string;
  blockBedYN?: "Y" | "N";
  wbCatID?: number;
  bedStatusValue?: "Available" | "Occupied" | "Blocked" | "Maintenance" | "Reserved";
  transferYN?: "Y" | "N";
}

interface BedFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<WrBedDto>) => Promise<void>;
  bed?: WrBedDto | null;
  rooms: RoomListDto[];
  roomGroups: RoomGroupDto[];
}

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
    wbCatID: z.number().optional(),
    bedStatusValue: z.enum(["Available", "Occupied", "Blocked", "Maintenance", "Reserved"], { required_error: "Bed status is required" }),
    transferYN: z.enum(["Y", "N"], { required_error: "Transfer status must be Y or N" }).optional(),
  })
  .required({
    bedName: true,
    rlID: true,
    rActiveYN: true,
    bedStatusValue: true,
  });

type BedFormSchema = z.infer<typeof validationSchema>;

const BedFormDialog: React.FC<BedFormDialogProps> = ({ open, onClose, onSubmit, bed, rooms, roomGroups }) => {
  const isEditMode = !!bed;

  // Form setup
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<BedFormSchema>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      bedName: "",
      rlID: 0,
      rActiveYN: "Y" as const,
      bedRemarks: "",
      blockBedYN: "N" as const,
      bedStatusValue: "Available" as const,
      transferYN: "N" as const,
    },
  });

  // Watch room selection to show room group info
  const selectedRoomId = watch("rlID");

  // Get selected room details
  const selectedRoom = useMemo(() => {
    return rooms.find((room) => room.rlID === selectedRoomId);
  }, [rooms, selectedRoomId]);

  // Effect to populate form when editing
  useEffect(() => {
    if (open) {
      if (isEditMode && bed) {
        reset({
          bedID: bed.bedID,
          bedName: bed.bedName,
          rlID: bed.rlID,
          rActiveYN: bed.rActiveYN as "Y" | "N",
          bedRemarks: bed.bedRemarks || "",
          blockBedYN: (bed.blockBedYN || "N") as "Y" | "N",
          wbCatID: bed.wbCatID || undefined,
          bedStatusValue: (bed.bedStatusValue || "Available") as "Available" | "Occupied" | "Blocked" | "Maintenance" | "Reserved",
          transferYN: (bed.transferYN || "N") as "Y" | "N",
        });
      } else {
        reset({
          bedName: "",
          rlID: 0,
          rActiveYN: "Y" as const,
          bedRemarks: "",
          blockBedYN: "N" as const,
          bedStatusValue: "Available" as const,
          transferYN: "N" as const,
        });
      }
    }
  }, [open, isEditMode, bed, reset]);

  // Form submission
  const onFormSubmit = async (data: BedFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  // Clear form
  const handleClear = () => {
    reset();
  };

  // Close dialog
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

  return (
    <GenericDialog
      open={open}
      onClose={handleClose}
      title={isEditMode ? "Edit Bed" : "Add New Bed"}
      maxWidth="md"
      fullWidth
      disableBackdropClick={isSubmitting}
      disableEscapeKeyDown={isSubmitting}
    >
      <form onSubmit={handleSubmit(onFormSubmit)}>
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

            <Grid size={{ xs: 12 }}>
              <Divider />
            </Grid>

            {/* Status Information */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ mb: 2, fontWeight: "bold", color: "primary.main" }}>Status Information</Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <EnhancedFormField
                name="bedStatusValue"
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

        {/* Form Actions */}
        <FormSaveClearButton
          clearText="Clear"
          saveText={isEditMode ? "Update Bed" : "Save Bed"}
          onClear={handleClear}
          onSave={handleSubmit(onFormSubmit)}
          clearIcon={ClearIcon}
          saveIcon={SaveIcon}
          isLoading={isSubmitting}
          clearVariant="outlined"
          saveVariant="contained"
        />
      </form>
    </GenericDialog>
  );
};

export default BedFormDialog;
