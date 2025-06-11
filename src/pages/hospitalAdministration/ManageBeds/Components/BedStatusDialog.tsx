// src/pages/hospitalAdministration/ManageBeds/Components/BedStatusDialog.tsx
import CustomButton from "@/components/Button/CustomButton";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { WrBedDto } from "@/interfaces/HospitalAdministration/Room-BedSetUpDto";
import { CheckCircle as AvailableIcon, Block as BlockIcon, Build as MaintenanceIcon, Person as OccupiedIcon, Bed as ReservedIcon } from "@mui/icons-material";
import { Alert, Box, Chip, FormControlLabel, Grid, Paper, Radio, RadioGroup, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";

interface BedStatusDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (bedId: number, status: string, remarks?: string) => Promise<void>;
  bed?: WrBedDto | null;
  statusOptions: string[];
}

interface StatusConfig {
  icon: React.ReactNode;
  color: string;
  description: string;
  requiresReason: boolean;
}

const BedStatusDialog: React.FC<BedStatusDialogProps> = ({ open, onClose, onSubmit, bed, statusOptions }) => {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  // Status configuration with icons and descriptions
  const statusConfig: Record<string, StatusConfig> = {
    Available: {
      icon: <AvailableIcon sx={{ color: "#4caf50" }} />,
      color: "#4caf50",
      description: "Bed is ready for patient assignment",
      requiresReason: false,
    },
    Occupied: {
      icon: <OccupiedIcon sx={{ color: "#f44336" }} />,
      color: "#f44336",
      description: "Bed is currently occupied by a patient",
      requiresReason: false,
    },
    Blocked: {
      icon: <BlockIcon sx={{ color: "#ff9800" }} />,
      color: "#ff9800",
      description: "Bed is temporarily unavailable",
      requiresReason: true,
    },
    Maintenance: {
      icon: <MaintenanceIcon sx={{ color: "#9c27b0" }} />,
      color: "#9c27b0",
      description: "Bed is under maintenance or repair",
      requiresReason: true,
    },
    Reserved: {
      icon: <ReservedIcon sx={{ color: "#2196f3" }} />,
      color: "#2196f3",
      description: "Bed is reserved for specific patient",
      requiresReason: false,
    },
  };

  // Initialize form when dialog opens
  useEffect(() => {
    if (open && bed) {
      setSelectedStatus(bed.bedStatusValue || "Available");
      setRemarks(bed.bedRemarks || "");
      setError("");
    }
  }, [open, bed]);

  // Handle status change
  const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newStatus = event.target.value;
    setSelectedStatus(newStatus);
    setError("");

    // Clear remarks if new status doesn't require reason
    if (!statusConfig[newStatus]?.requiresReason) {
      setRemarks("");
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!bed || !selectedStatus) return;

    // Validate required remarks for certain statuses
    const config = statusConfig[selectedStatus];
    if (config?.requiresReason && !remarks.trim()) {
      setError(`Please provide a reason for setting status to ${selectedStatus}`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(bed.bedID, selectedStatus, remarks.trim() || undefined);
    } catch (error) {
      setError("Failed to update bed status. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle dialog close
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  // Check if status has changed
  const hasStatusChanged = selectedStatus !== bed?.bedStatusValue;
  const hasRemarksChanged = remarks !== (bed?.bedRemarks || "");
  const hasChanges = hasStatusChanged || hasRemarksChanged;

  return (
    <GenericDialog
      open={open}
      onClose={handleClose}
      title="Update Bed Status"
      maxWidth="md"
      fullWidth
      disableBackdropClick={isSubmitting}
      disableEscapeKeyDown={isSubmitting}
      actions={
        <>
          <CustomButton variant="outlined" text="Cancel" onClick={handleClose} disabled={isSubmitting} />
          <CustomButton variant="contained" text={isSubmitting ? "Updating..." : "Update Status"} onClick={handleSubmit} disabled={isSubmitting || !hasChanges} color="primary" />
        </>
      }
    >
      <Box sx={{ p: 2 }}>
        {bed && (
          <>
            {/* Current Bed Information */}
            <Paper sx={{ p: 2, mb: 3, backgroundColor: "grey.50" }}>
              <Typography variant="h6" gutterBottom>
                Bed Information
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Bed Name
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {bed.bedName}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Room
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {bed.roomList?.rName || "Unknown Room"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Current Status
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    {statusConfig[bed.bedStatusValue || "Available"]?.icon}
                    <Chip
                      label={bed.bedStatusValue || "Available"}
                      size="small"
                      sx={{
                        backgroundColor: statusConfig[bed.bedStatusValue || "Available"]?.color,
                        color: "white",
                      }}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Room Group
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {bed.roomList?.roomGroup?.rGrpName || "Unknown Group"}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Status Selection */}
            <Typography variant="h6" gutterBottom>
              Select New Status
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <RadioGroup value={selectedStatus} onChange={handleStatusChange} sx={{ mb: 3 }}>
              {statusOptions.map((status) => {
                const config = statusConfig[status];
                if (!config) return null;

                return (
                  <Paper
                    key={status}
                    sx={{
                      p: 2,
                      mb: 1,
                      border: selectedStatus === status ? 2 : 1,
                      borderColor: selectedStatus === status ? config.color : "grey.300",
                      backgroundColor: selectedStatus === status ? `${config.color}08` : "white",
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: `${config.color}08`,
                      },
                    }}
                    onClick={() => setSelectedStatus(status)}
                  >
                    <FormControlLabel
                      value={status}
                      control={<Radio sx={{ color: config.color }} />}
                      label={
                        <Box display="flex" alignItems="center" gap={2} width="100%">
                          {config.icon}
                          <Box flex={1}>
                            <Typography variant="body1" fontWeight="medium">
                              {status}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {config.description}
                            </Typography>
                            {config.requiresReason && (
                              <Typography variant="caption" color="warning.main">
                                * Reason required
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      }
                      sx={{ margin: 0, width: "100%" }}
                    />
                  </Paper>
                );
              })}
            </RadioGroup>

            {/* Remarks/Reason Field */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                {statusConfig[selectedStatus]?.requiresReason ? "Reason *" : "Remarks (Optional)"}
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder={statusConfig[selectedStatus]?.requiresReason ? `Please provide a reason for ${selectedStatus} status...` : "Add any additional notes or comments..."}
                disabled={isSubmitting}
                error={Boolean(statusConfig[selectedStatus]?.requiresReason && !remarks.trim() && error)}
                helperText={
                  statusConfig[selectedStatus]?.requiresReason ? "This field is required for the selected status" : "Optional additional information about the status change"
                }
                sx={{ mb: 2 }}
              />
            </Box>

            {/* Change Summary */}
            {hasChanges && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Changes to be made:</strong>
                </Typography>
                {hasStatusChanged && (
                  <Typography variant="body2">
                    • Status: {bed.bedStatusValue || "Available"} → {selectedStatus}
                  </Typography>
                )}
                {hasRemarksChanged && <Typography variant="body2">• Remarks: {remarks ? "Updated" : "Cleared"}</Typography>}
              </Alert>
            )}
          </>
        )}
      </Box>
    </GenericDialog>
  );
};

export default BedStatusDialog;
