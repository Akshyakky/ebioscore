// src/frontOffice/components/SchedulerFilters.tsx
import { Add as AddIcon } from "@mui/icons-material";
import { Button, FormControl, Grid, InputLabel, MenuItem, Paper, Select } from "@mui/material";
import React from "react";

interface SchedulerFiltersProps {
  bookingMode: string;
  selectedProvider: string;
  selectedResource: string;
  onBookingModeChange: (mode: string) => void;
  onProviderChange: (provider: string) => void;
  onResourceChange: (resource: string) => void;
  onBookingClick: () => void;
  providers: Array<{ value: number; label: string; type: string }>;
  resources: Array<{ value: number; label: string; type: string }>;
}

const bookingModeOptions = [
  { value: "physician", label: "Physician" },
  { value: "resource", label: "Resource" },
];

export const SchedulerFilters: React.FC<SchedulerFiltersProps> = ({
  bookingMode,
  selectedProvider,
  selectedResource,
  onBookingModeChange,
  onProviderChange,
  onResourceChange,
  onBookingClick,
  providers,
  resources,
}) => {
  return (
    <Paper variant="outlined" style={{ padding: 8, marginBottom: 8 }}>
      <Grid container spacing={1} alignItems="center">
        <Grid size={{ xs: 6, sm: 3 }}>
          <FormControl size="small" fullWidth>
            <InputLabel>Mode</InputLabel>
            <Select value={bookingMode} onChange={(e) => onBookingModeChange(e.target.value)} label="Mode">
              {bookingModeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <FormControl size="small" fullWidth>
            <InputLabel>Provider</InputLabel>
            <Select value={selectedProvider} onChange={(e) => onProviderChange(e.target.value)} label="Provider">
              <MenuItem value="">All Providers</MenuItem>
              {providers.map((provider) => (
                <MenuItem key={provider.value} value={provider.value.toString()}>
                  {provider.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <FormControl size="small" fullWidth>
            <InputLabel>Resource</InputLabel>
            <Select value={selectedResource} onChange={(e) => onResourceChange(e.target.value)} label="Resource">
              <MenuItem value="">All Resources</MenuItem>
              {resources.map((resource) => (
                <MenuItem key={resource.value} value={resource.value.toString()}>
                  {resource.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={onBookingClick} fullWidth size="small">
            Book
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};
