// src/frontOffice/components/AppointmentDetailsDialog.tsx
import { AppointBookingDto } from "@/interfaces/FrontOffice/AppointBookingDto";
import { Cancel as CancelIcon, Edit as EditIcon } from "@mui/icons-material";
import { Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, Stack, Typography } from "@mui/material";
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
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Appointment Details</Typography>
          <Chip label={appointment.abStatus} color={getStatusColor(appointment.abStatus) as any} size="small" />
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          <div>
            <Typography variant="subtitle1" fontWeight="bold">
              {appointment.abFName} {appointment.abLName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {appointment.pChartCode}
            </Typography>
          </div>

          <Divider />

          <Grid container spacing={2}>
            <Grid size={6}>
              <Typography variant="caption" color="text.secondary" display="block">
                Provider
              </Typography>
              <Typography variant="body2">{appointment.providerName}</Typography>
            </Grid>

            <Grid size={6}>
              <Typography variant="caption" color="text.secondary" display="block">
                Resource
              </Typography>
              <Typography variant="body2">{appointment.rlName}</Typography>
            </Grid>

            <Grid size={6}>
              <Typography variant="caption" color="text.secondary" display="block">
                Date & Time
              </Typography>
              <Typography variant="body2">
                {new Date(appointment.abDate).toLocaleDateString()}
                {" at "}
                {new Date(appointment.abTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Typography>
            </Grid>

            <Grid size={6}>
              <Typography variant="caption" color="text.secondary" display="block">
                Duration
              </Typography>
              <Typography variant="body2">{appointment.abDurDesc}</Typography>
            </Grid>

            {appointment.procNotes && (
              <Grid size={12}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Notes
                </Typography>
                <Typography variant="body2">{appointment.procNotes}</Typography>
              </Grid>
            )}
          </Grid>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Stack direction="row" spacing={1}>
          {onEdit && (
            <Button startIcon={<EditIcon />} size="small" onClick={() => onEdit(appointment)} variant="outlined">
              Edit
            </Button>
          )}
          {onCancel && (
            <Button startIcon={<CancelIcon />} color="warning" size="small" onClick={() => onCancel(appointment)} variant="outlined">
              Cancel
            </Button>
          )}
          <Button onClick={onClose} size="small" variant="contained">
            Close
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
