// src/pages/frontOffice/Appointment/components/SchedulerHeader.tsx
import { CalendarMonth, LocationOn, NavigateBefore, NavigateNext, Person, Warning as WarningIcon } from "@mui/icons-material";
import { Autocomplete, Box, Button, Chip, FormControl, Grid, IconButton, MenuItem, Paper, Select, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
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
  { value: "physician", label: "Physician", icon: <Person fontSize="small" /> },
  { value: "resource", label: "Resource", icon: <LocationOn fontSize="small" /> },
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
        const weekStart = getWeekDates(currentDate)[0];
        const weekEnd = getWeekDates(currentDate)[6];
        return `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${weekEnd.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`;
      default:
        return currentDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    }
  };

  const getCurrentSelectionValue = () => {
    return bookingMode === "physician" ? selectedProvider : selectedResource;
  };

  const handleSelectionChange = (value: string) => {
    if (bookingMode === "physician") {
      onProviderChange(value);
    } else {
      onResourceChange(value);
    }
  };

  const getCurrentOptions = () => {
    const baseOptions = bookingMode === "physician" ? providers : resources;
    const allOption = {
      value: 0,
      label: bookingMode === "physician" ? "All Providers" : "All Resources",
      type: "all",
    };
    return [allOption, ...baseOptions];
  };

  const getCurrentLabel = () => {
    return bookingMode === "physician" ? "Provider" : "Resource";
  };

  const isSelectionRequired = () => {
    return (bookingMode === "physician" && !selectedProvider) || (bookingMode === "resource" && !selectedResource);
  };

  const handleDatePickerChange = (newValue: Dayjs | null) => {
    if (newValue && newValue.isValid()) {
      onDateChange(newValue.toDate());
    }
  };

  const getSelectedOption = () => {
    const currentValue = getCurrentSelectionValue();
    const options = getCurrentOptions();

    if (!currentValue) {
      return options[0];
    }

    return options.find((option) => option.value.toString() === currentValue) || null;
  };

  const handleAutocompleteChange = (event: any, newValue: any) => {
    if (newValue) {
      handleSelectionChange(newValue.value === 0 ? "" : newValue.value.toString());
    } else {
      handleSelectionChange("");
    }
  };

  return (
    <Paper
      elevation={1}
      sx={{
        borderRadius: 1,
        overflow: "hidden",
        mb: 1,
      }}
    >
      {/* Compact Header Bar */}
      <Box
        sx={{
          background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          px: 2,
          py: 0.8,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2} alignItems="center">
            <CalendarMonth fontSize="small" />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
              Appointments
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: "0.8rem" }}>
              {getDateDisplay()}
            </Typography>
          </Stack>

          <Button
            variant="contained"
            onClick={onBookingClick}
            disabled={!isBookingAllowed}
            size="small"
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.2)",
              color: "white",
              fontWeight: 600,
              fontSize: "0.8rem",
              px: 2,
              py: 0.5,
              minHeight: "auto",
              textTransform: "none",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.3)",
              },
              "&:disabled": {
                bgcolor: "rgba(255, 255, 255, 0.1)",
                color: "rgba(255, 255, 255, 0.5)",
              },
            }}
          >
            + New
          </Button>
        </Stack>
      </Box>

      {/* Compact Controls */}
      <Box sx={{ px: 2, py: 1.2 }}>
        <Grid container spacing={1.5} alignItems="center">
          {/* Date Navigation */}
          <Grid size={{ xs: 12, md: 3.5 }}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={dayjs(currentDate)}
                  onChange={handleDatePickerChange}
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: {
                      size: "small",
                      sx: {
                        minWidth: 110,
                        "& .MuiInputBase-input": {
                          fontSize: "0.8rem",
                          py: 0.6,
                        },
                        "& .MuiOutlinedInput-root": {
                          height: 32,
                        },
                      },
                    },
                  }}
                />
              </LocalizationProvider>
              <IconButton
                onClick={() => onNavigate("prev")}
                size="small"
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "rgba(103, 126, 234, 0.08)",
                  "&:hover": { bgcolor: "rgba(103, 126, 234, 0.15)" },
                }}
              >
                <NavigateBefore fontSize="small" />
              </IconButton>
              <IconButton
                onClick={() => onNavigate("next")}
                size="small"
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "rgba(103, 126, 234, 0.08)",
                  "&:hover": { bgcolor: "rgba(103, 126, 234, 0.15)" },
                }}
              >
                <NavigateNext fontSize="small" />
              </IconButton>
              <Button
                variant="outlined"
                onClick={() => onNavigate("today")}
                size="small"
                sx={{
                  minWidth: "auto",
                  px: 1,
                  py: 0.3,
                  height: 32,
                  fontSize: "0.75rem",
                  textTransform: "none",
                  borderColor: "rgba(103, 126, 234, 0.3)",
                }}
              >
                Today
              </Button>
            </Stack>
          </Grid>

          {/* View Mode */}
          <Grid size={{ xs: 12, md: 2.5 }}>
            <Tabs
              value={viewMode}
              onChange={(_, value) => onViewModeChange(value)}
              variant="fullWidth"
              sx={{
                minHeight: 32,
                bgcolor: "rgba(103, 126, 234, 0.05)",
                borderRadius: 0.8,
                "& .MuiTab-root": {
                  minHeight: 32,
                  py: 0.3,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  textTransform: "none",
                  color: "text.secondary",
                  "&.Mui-selected": {
                    color: "white",
                    bgcolor: "primary.main",
                    borderRadius: 0.8,
                  },
                },
                "& .MuiTabs-indicator": {
                  display: "none",
                },
              }}
            >
              <Tab value="day" label="Day" />
              <Tab value="week" label="Week" />
              <Tab value="month" label="Month" />
            </Tabs>
          </Grid>

          {/* Booking Mode */}
          <Grid size={{ xs: 6, md: 2 }}>
            <FormControl size="small" fullWidth>
              <Select
                value={bookingMode}
                onChange={(e) => onBookingModeChange(e.target.value)}
                displayEmpty
                sx={{
                  height: 32,
                  fontSize: "0.8rem",
                  "& .MuiSelect-select": {
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    py: 0.5,
                  },
                }}
              >
                {bookingModeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value} sx={{ fontSize: "0.8rem" }}>
                    <Stack direction="row" spacing={0.8} alignItems="center">
                      {option.icon}
                      <Typography fontSize="0.8rem">{option.label}</Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Provider/Resource Selection */}
          <Grid size={{ xs: 6, md: 4 }}>
            <Autocomplete
              size="small"
              value={getSelectedOption()}
              onChange={handleAutocompleteChange}
              options={getCurrentOptions()}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.value === value.value}
              filterOptions={(options, { inputValue }) => {
                return options.filter((option) => option.label.toLowerCase().includes(inputValue.toLowerCase()));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={`Select ${getCurrentLabel()}`}
                  error={isSelectionRequired()}
                  sx={{
                    "& .MuiInputBase-root": {
                      height: 32,
                      fontSize: "0.8rem",
                    },
                    "& .MuiInputBase-input": {
                      py: 0.5,
                    },
                  }}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: isSelectionRequired() ? (
                      <WarningIcon
                        fontSize="small"
                        sx={{
                          color: "warning.main",
                          mr: 0.5,
                          fontSize: "1rem",
                        }}
                      />
                    ) : null,
                  }}
                />
              )}
              renderOption={(props, option) => (
                <li {...props} key={option.value} style={{ fontSize: "0.8rem" }}>
                  <Stack direction="row" spacing={1} alignItems="center" width="100%">
                    <Typography variant="body2" fontSize="0.8rem">
                      {option.label}
                    </Typography>
                    {option.type && option.type !== "all" && (
                      <Chip
                        label={option.type}
                        size="small"
                        variant="outlined"
                        sx={{
                          marginLeft: "auto",
                          fontSize: "0.65rem",
                          height: 18,
                        }}
                      />
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
      </Box>
    </Paper>
  );
};
