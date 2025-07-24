// src/frontOffice/components/AppointmentDetailsDialog.tsx
import { AppointBookingDto } from "@/interfaces/FrontOffice/AppointBookingDto";
import { Cancel as CancelIcon, Edit as EditIcon } from "@mui/icons-material";
import { Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Typography } from "@mui/material";
import React from "react";
import { getStatusColor } from "../utils/appointmentUtils";

interface AppointmentDetailsDialogProps {
  appointment: AppointBookingDto | null;
  onClose: () => void;
  onEdit?: (appointment: AppointBookingDto) => void;
  onCancel?: (appointment: AppointBookingDto) => void;
}

export const AppointmentDetailsDialog: React.FC<AppointmentDetailsDialogProps> = ({ appointment, onClose, onEdit, onCancel }) => {
  if (!appointment) return null;

  return (
    <Dialog open={!!appointment} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" sx={{ fontSize: "1rem" }}>
          Appointment Details
        </Typography>
        <Chip label={appointment.abStatus} color={getStatusColor(appointment.abStatus) as any} size="small" />
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Grid container spacing={1}>
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" sx={{ fontSize: "0.9rem", fontWeight: "bold" }}>
              {appointment.abFName} {appointment.abLName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {appointment.pChartCode}
            </Typography>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Provider
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
              {appointment.providerName}
            </Typography>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Resource
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
              {appointment.rlName}
            </Typography>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Date & Time
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
              {new Date(appointment.abDate).toLocaleDateString()}
              {" at "}
              {new Date(appointment.abTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Typography>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Duration
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
              {appointment.abDurDesc}
            </Typography>
          </Grid>

          {appointment.procNotes && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" color="text.secondary">
                Notes
              </Typography>
              <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                {appointment.procNotes}
              </Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ pt: 1 }}>
        {onEdit && (
          <Button startIcon={<EditIcon />} size="small" onClick={() => onEdit(appointment)}>
            Edit
          </Button>
        )}
        {onCancel && (
          <Button startIcon={<CancelIcon />} color="warning" size="small" onClick={() => onCancel(appointment)}>
            Cancel
          </Button>
        )}
        <Button onClick={onClose} size="small">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
