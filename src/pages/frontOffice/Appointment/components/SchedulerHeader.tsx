// src/pages/frontOffice/Appointment/components/SchedulerHeader.tsx
import { NavigateBefore, NavigateNext, Today, Warning as WarningIcon } from "@mui/icons-material";
import { Autocomplete, Button, FormControl, Grid, IconButton, InputLabel, MenuItem, Paper, Select, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";
import React from "react";

interface SchedulerHeaderProps {
  currentDate: Date;
  viewMode: string;
  bookingMode: string;
  selectedProvider: string;
  selectedResource: string;
  isBookingAllowed?: boolean;
  onDateChange: (date: Date) => void;
  onViewModeChange: (mode: string) => void;
  onNavigate: (direction: "prev" | "next" | "today") => void;
  onBookingModeChange: (mode: string) => void;
  onProviderChange: (provider: string) => void;
  onResourceChange: (resource: string) => void;
  onBookingClick: () => void;
  providers: Array<{ value: number; label: string; type: string }>;
  resources: Array<{ value: number; label: string; type: string }>;
  getWeekDates: (date: Date) => Date[];
}

const bookingModeOptions = [
  { value: "physician", label: "Physician" },
  { value: "resource", label: "Resource" },
];

export const SchedulerHeader: React.FC<SchedulerHeaderProps> = ({
  currentDate,
  viewMode,
  bookingMode,
  selectedProvider,
  selectedResource,
  isBookingAllowed = true,
  onDateChange,
  onViewModeChange,
  onNavigate,
  onBookingModeChange,
  onProviderChange,
  onResourceChange,
  onBookingClick,
  providers,
  resources,
  getWeekDates,
}) => {
  const getDateDisplay = () => {
    switch (viewMode) {
      case "month":
        return currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      case "week":
        return `Week of ${getWeekDates(currentDate)[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
      default:
        return currentDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    }
  };

  // Get the current selection value based on booking mode
  const getCurrentSelectionValue = () => {
    return bookingMode === "physician" ? selectedProvider : selectedResource;
  };

  // Handle selection change based on booking mode
  const handleSelectionChange = (value: string) => {
    if (bookingMode === "physician") {
      onProviderChange(value);
    } else {
      onResourceChange(value);
    }
  };

  // Get the appropriate options based on booking mode
  const getCurrentOptions = () => {
    const baseOptions = bookingMode === "physician" ? providers : resources;
    const allOption = {
      value: 0,
      label: bookingMode === "physician" ? "All Providers" : "All Resources",
      type: "all",
    };
    return [allOption, ...baseOptions];
  };

  // Get the appropriate label based on booking mode
  const getCurrentLabel = () => {
    return bookingMode === "physician" ? "Provider" : "Resource";
  };

  // Check if current selection is required but missing
  const isSelectionRequired = () => {
    return (bookingMode === "physician" && !selectedProvider) || (bookingMode === "resource" && !selectedResource);
  };

  // Get tooltip text for disabled booking button
  const getBookingButtonTooltip = () => {
    if (!isBookingAllowed) {
      if (bookingMode === "physician" && !selectedProvider) {
        return "Please select a provider before booking appointments";
      }
      if (bookingMode === "resource" && !selectedResource) {
        return "Please select a resource before booking appointments";
      }
    }
    return "Book new appointment";
  };

  // Handle date picker change
  const handleDatePickerChange = (newValue: Dayjs | null) => {
    if (newValue && newValue.isValid()) {
      onDateChange(newValue.toDate());
    }
  };

  // Get the currently selected option object for Autocomplete
  const getSelectedOption = () => {
    const currentValue = getCurrentSelectionValue();
    const options = getCurrentOptions();

    if (!currentValue) {
      return options[0]; // Return "All" option when nothing is selected
    }

    return options.find((option) => option.value.toString() === currentValue) || null;
  };

  // Handle Autocomplete change
  const handleAutocompleteChange = (event: any, newValue: any) => {
    if (newValue) {
      handleSelectionChange(newValue.value === 0 ? "" : newValue.value.toString());
    } else {
      handleSelectionChange("");
    }
  };

  return (
    <Paper variant="outlined" style={{ padding: 8, marginBottom: 8 }}>
      <Grid container spacing={1} alignItems="center">
        {/* Date Display and Navigation */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Typography variant="caption" color="text.secondary" display="block" marginBottom={0.5}>
            {getDateDisplay()}
          </Typography>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                value={dayjs(currentDate)}
                onChange={handleDatePickerChange}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    size: "small",
                    style: { minWidth: 120 },
                    InputProps: {
                      style: { fontSize: "0.8rem" },
                    },
                  },
                }}
              />
            </LocalizationProvider>
            <IconButton onClick={() => onNavigate("prev")} size="small">
              <NavigateBefore />
            </IconButton>
            <IconButton onClick={() => onNavigate("next")} size="small">
              <NavigateNext />
            </IconButton>
            <Button variant="outlined" startIcon={<Today />} onClick={() => onNavigate("today")} size="small" style={{ minWidth: "auto", fontSize: "0.7rem" }}>
              Today
            </Button>
          </Stack>
        </Grid>

        {/* View Mode Tabs */}
        <Grid size={{ xs: 12, md: 2 }}>
          <Tabs
            value={viewMode}
            onChange={(_, value) => onViewModeChange(value)}
            variant="fullWidth"
            style={{
              minHeight: 36,
            }}
          >
            <Tab
              value="day"
              label="Day"
              style={{
                fontSize: "0.75rem",
                minHeight: 36,
                minWidth: "auto",
                padding: "4px 8px",
              }}
            />
            <Tab
              value="week"
              label="Week"
              style={{
                fontSize: "0.75rem",
                minHeight: 36,
                minWidth: "auto",
                padding: "4px 8px",
              }}
            />
            <Tab
              value="month"
              label="Month"
              style={{
                fontSize: "0.75rem",
                minHeight: 36,
                minWidth: "auto",
                padding: "4px 8px",
              }}
            />
          </Tabs>
        </Grid>

        {/* Booking Mode Selection */}
        <Grid size={{ xs: 6, md: 1.5 }}>
          <FormControl size="small" fullWidth>
            <InputLabel style={{ fontSize: "0.8rem" }}>Mode</InputLabel>
            <Select value={bookingMode} onChange={(e) => onBookingModeChange(e.target.value)} label="Mode" style={{ fontSize: "0.8rem" }}>
              {bookingModeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Searchable Provider/Resource Selection */}
        <Grid size={{ xs: 6, md: 3.5 }}>
          <Autocomplete
            size="small"
            value={getSelectedOption()}
            onChange={handleAutocompleteChange}
            options={getCurrentOptions()}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.value === value.value}
            filterOptions={(options, { inputValue }) => {
              const filtered = options.filter((option) => option.label.toLowerCase().includes(inputValue.toLowerCase()));
              return filtered;
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    {getCurrentLabel()}
                    {isSelectionRequired() && <WarningIcon fontSize="small" />}
                  </Stack>
                }
                error={isSelectionRequired()}
                InputProps={{
                  ...params.InputProps,
                  style: { fontSize: "0.8rem" },
                }}
                InputLabelProps={{
                  ...params.InputLabelProps,
                  style: {
                    fontSize: "0.8rem",
                    color: isSelectionRequired() ? "#ed6c02" : undefined,
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-error": {
                      "& fieldset": {
                        borderColor: "warning.main",
                      },
                    },
                  },
                }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props} key={option.value}>
                <Stack direction="row" spacing={1} alignItems="center" width="100%">
                  <Typography variant="body2" style={{ fontSize: "0.8rem" }}>
                    {option.label}
                  </Typography>
                  {option.type && option.type !== "all" && (
                    <Typography variant="caption" color="text.secondary" style={{ fontSize: "0.7rem", marginLeft: "auto" }}>
                      {option.type}
                    </Typography>
                  )}
                </Stack>
              </li>
            )}
            noOptionsText="No options found"
            clearOnBlur
            selectOnFocus
            handleHomeEndKeys
          />
        </Grid>
      </Grid>
    </Paper>
  );
};
