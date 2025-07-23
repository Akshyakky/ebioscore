// src/frontOffice/components/BookingDialog.tsx
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import { BookingFormData } from "../types";

interface BookingDialogProps {
  open: boolean;
  bookingForm: BookingFormData;
  isRegisteredPatient: boolean;
  providers: Array<{ value: number; label: string; type: string }>;
  resources: Array<{ value: number; label: string; type: string }>;
  onClose: () => void;
  onSubmit: () => void;
  onFormChange: (form: BookingFormData) => void;
  onRegisteredPatientChange: (isRegistered: boolean) => void;
}

const durationOptions = [
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
];

export const BookingDialog: React.FC<BookingDialogProps> = ({
  open,
  bookingForm,
  isRegisteredPatient,
  providers,
  resources,
  onClose,
  onSubmit,
  onFormChange,
  onRegisteredPatientChange,
}) => {
  const handleFieldChange = (field: keyof BookingFormData, value: any) => {
    onFormChange({ ...bookingForm, [field]: value });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" sx={{ fontSize: "1rem" }}>
          Book Appointment
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Create a new appointment
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={<Switch checked={isRegisteredPatient} onChange={(e) => onRegisteredPatientChange(e.target.checked)} size="small" />}
              label={<Typography sx={{ fontSize: "0.8rem" }}>Registered Patient</Typography>}
            />
          </Grid>

          {isRegisteredPatient ? (
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                size="small"
                label="Search Patient"
                placeholder="Enter name or ID"
                value={bookingForm.patientSearch}
                onChange={(e) => handleFieldChange("patientSearch", e.target.value)}
              />
            </Grid>
          ) : (
            <>
              <Grid size={{ xs: 6 }}>
                <TextField fullWidth size="small" label="First Name" required value={bookingForm.firstName} onChange={(e) => handleFieldChange("firstName", e.target.value)} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField fullWidth size="small" label="Last Name" value={bookingForm.lastName} onChange={(e) => handleFieldChange("lastName", e.target.value)} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField fullWidth size="small" label="Phone" required value={bookingForm.phone} onChange={(e) => handleFieldChange("phone", e.target.value)} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField fullWidth size="small" label="Email" type="email" value={bookingForm.email} onChange={(e) => handleFieldChange("email", e.target.value)} />
              </Grid>
            </>
          )}

          <Grid size={{ xs: 6 }}>
            <FormControl fullWidth size="small" required>
              <InputLabel>Provider</InputLabel>
              <Select value={bookingForm.provider} onChange={(e) => handleFieldChange("provider", e.target.value)} label="Provider">
                {providers.map((provider) => (
                  <MenuItem key={provider.value} value={provider.value}>
                    {provider.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <FormControl fullWidth size="small" required>
              <InputLabel>Resource</InputLabel>
              <Select value={bookingForm.resource} onChange={(e) => handleFieldChange("resource", e.target.value)} label="Resource">
                {resources.map((resource) => (
                  <MenuItem key={resource.value} value={resource.value}>
                    {resource.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="Date"
              type="date"
              required
              value={bookingForm.appointmentDate.toISOString().split("T")[0]}
              onChange={(e) => handleFieldChange("appointmentDate", new Date(e.target.value))}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="Time"
              type="time"
              required
              value={bookingForm.appointmentTime}
              onChange={(e) => handleFieldChange("appointmentTime", e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 4 }}>
            <FormControl fullWidth size="small" required>
              <InputLabel>Duration</InputLabel>
              <Select value={bookingForm.duration} onChange={(e) => handleFieldChange("duration", Number(e.target.value))} label="Duration">
                {durationOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField fullWidth size="small" label="Notes" multiline rows={2} value={bookingForm.notes} onChange={(e) => handleFieldChange("notes", e.target.value)} />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ pt: 1 }}>
        <Button onClick={onClose} size="small">
          Cancel
        </Button>
        <Button variant="contained" onClick={onSubmit} size="small">
          Book
        </Button>
      </DialogActions>
    </Dialog>
  );
};
