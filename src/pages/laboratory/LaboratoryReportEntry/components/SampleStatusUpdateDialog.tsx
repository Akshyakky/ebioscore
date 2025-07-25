// Create a new file: SampleStatusUpdateDialog.tsx
import SmartButton from "@/components/Button/SmartButton";
import DropdownSelect from "@/components/DropDown/DropdownSelect";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { InvStatusResponseDto, SampleStatusUpdateRequestDto } from "@/interfaces/Laboratory/LaboratoryReportEntry";
import { useAlert } from "@/providers/AlertProvider";
import { CheckCircle, Error as ErrorIcon, HourglassEmpty } from "@mui/icons-material";
import { Box, Chip, FormControl, Grid, Paper, Stack, TextField, Typography } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";

interface SampleStatusUpdateDialogProps {
  open: boolean;
  onClose: () => void;
  investigations: InvStatusResponseDto[];
  labRegNo: number;
  serviceTypeId: number;
  onUpdate: (updates: SampleStatusUpdateRequestDto[]) => Promise<{ success: boolean; message: string }>;
  loading?: boolean;
}

const sampleStatusUpdateOptions = [
  { value: "P", label: "Pending", icon: <HourglassEmpty /> },
  { value: "C", label: "Collected", icon: <CheckCircle /> },
  { value: "R", label: "Rejected", icon: <ErrorIcon /> },
];

const SampleStatusUpdateDialog: React.FC<SampleStatusUpdateDialogProps> = ({ open, onClose, investigations, labRegNo, serviceTypeId, onUpdate, loading = false }) => {
  const { showAlert } = useAlert();
  const [statusUpdates, setStatusUpdates] = useState<Record<number, { status: string; reason: string }>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});

  useEffect(() => {
    if (open && investigations.length > 0) {
      const initialStatuses: Record<number, { status: string; reason: string }> = {};
      investigations.forEach((inv) => {
        initialStatuses[inv.investigationId] = {
          status: inv.sampleStatus === "Pending" ? "P" : inv.sampleStatus === "Collected" ? "C" : inv.sampleStatus === "Rejected" ? "R" : "P",
          reason: "",
        };
      });
      setStatusUpdates(initialStatuses);
      setErrors({});
    }
  }, [open, investigations]);

  const handleStatusChange = useCallback((investigationId: number, status: string) => {
    setStatusUpdates((prev) => ({
      ...prev,
      [investigationId]: {
        ...prev[investigationId],
        status,
        reason: status !== "R" ? "" : prev[investigationId]?.reason || "",
      },
    }));
    // Clear error when status changes
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[investigationId];
      return newErrors;
    });
  }, []);

  const handleReasonChange = useCallback((investigationId: number, reason: string) => {
    setStatusUpdates((prev) => ({
      ...prev,
      [investigationId]: {
        ...prev[investigationId],
        reason,
      },
    }));
  }, []);

  const validateUpdates = useCallback(() => {
    const newErrors: Record<number, string> = {};
    let isValid = true;

    Object.entries(statusUpdates).forEach(([invId, update]) => {
      if (update.status === "R" && !update.reason.trim()) {
        newErrors[parseInt(invId)] = "Rejection reason is required";
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [statusUpdates]);

  const handleSubmit = useCallback(async () => {
    if (!validateUpdates()) {
      showAlert("Error", "Please provide rejection reasons for all rejected samples", "error");
      return;
    }

    const updates: SampleStatusUpdateRequestDto[] = Object.entries(statusUpdates).map(([invId, update]) => ({
      LabRegNo: labRegNo,
      ServiceTypeID: serviceTypeId,
      InvestigationID: parseInt(invId),
      SampleCollectionStatus: update.status as "Pending" | "Collected" | "Rejected",
      SampleCollectionDate: new Date(),
      SampleRejectionReason: update.reason,
    }));

    const result = await onUpdate(updates);
    if (result.success) {
      showAlert("Success", result.message, "success");
      onClose();
    } else {
      showAlert("Error", result.message, "error");
    }
  }, [statusUpdates, validateUpdates, labRegNo, serviceTypeId, onUpdate, showAlert, onClose]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "P":
        return "warning";
      case "C":
        return "success";
      case "R":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <GenericDialog
      open={open}
      onClose={onClose}
      title="Update Sample Collection Status"
      maxWidth="md"
      fullWidth
      showCloseButton={true}
      actions={
        <>
          <SmartButton text="Cancel" onClick={onClose} variant="outlined" size="small" disabled={loading} />
          <SmartButton
            text="Update Status"
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            size="small"
            disabled={loading || investigations.length === 0}
            loadingText="Updating..."
            asynchronous={true}
            showLoadingIndicator={true}
          />
        </>
      }
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Lab Reg No: {labRegNo} | Total Investigations: {investigations.length}
        </Typography>
      </Box>

      <Stack spacing={2}>
        {investigations.map((investigation) => (
          <Paper key={investigation.investigationId} elevation={1} sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="flex-start">
              <Grid size={{ xs: 12, sm: 5 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {investigation.investigationName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Code: {investigation.investigationCode}
                </Typography>
                <Chip
                  size="small"
                  label={`Current: ${investigation.sampleStatus}`}
                  color={getStatusColor(statusUpdates[investigation.investigationId]?.status || "P")}
                  sx={{ mt: 1 }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 3 }}>
                <FormControl fullWidth size="small" error={!!errors[investigation.investigationId]}>
                  <DropdownSelect
                    label="New Status"
                    name={`status-${investigation.investigationId}`}
                    value={statusUpdates[investigation.investigationId]?.status || "P"}
                    options={sampleStatusUpdateOptions}
                    onChange={(e) => handleStatusChange(investigation.investigationId, e.target.value)}
                    size="small"
                    defaultText="Select Status"
                  />
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                {statusUpdates[investigation.investigationId]?.status === "R" && (
                  <TextField
                    fullWidth
                    size="small"
                    label="Rejection Reason"
                    value={statusUpdates[investigation.investigationId]?.reason || ""}
                    onChange={(e) => handleReasonChange(investigation.investigationId, e.target.value)}
                    error={!!errors[investigation.investigationId]}
                    helperText={errors[investigation.investigationId]}
                    required
                    multiline
                    rows={2}
                  />
                )}
              </Grid>
            </Grid>
          </Paper>
        ))}
      </Stack>
    </GenericDialog>
  );
};

export default SampleStatusUpdateDialog;
