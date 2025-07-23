// src/frontOffice/components/SchedulerHeader.tsx
import { NavigateBefore, NavigateNext, Today, ViewDay, ViewModule, ViewWeek } from "@mui/icons-material";
import { Button, Grid, IconButton, Paper, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import React from "react";

interface SchedulerHeaderProps {
  currentDate: Date;
  viewMode: string;
  onDateChange: (date: Date) => void;
  onViewModeChange: (mode: string) => void;
  onNavigate: (direction: "prev" | "next" | "today") => void;
  getWeekDates: (date: Date) => Date[];
}

export const SchedulerHeader: React.FC<SchedulerHeaderProps> = ({ currentDate, viewMode, onDateChange, onViewModeChange, onNavigate, getWeekDates }) => {
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

  return (
    <Paper sx={{ p: 1, mb: 1 }}>
      <Grid container spacing={1} alignItems="center">
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h6" component="h1" sx={{ fontSize: "1.1rem", mb: 0.5 }}>
            Appointment Scheduler
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {getDateDisplay()}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Stack direction="row" spacing={0.5} justifyContent="flex-end" flexWrap="wrap" alignItems="center">
            <TextField type="date" size="small" value={currentDate.toISOString().split("T")[0]} onChange={(e) => onDateChange(new Date(e.target.value))} sx={{ minWidth: 140 }} />

            <Button variant="outlined" startIcon={<Today />} onClick={() => onNavigate("today")} size="small" sx={{ minWidth: "auto", px: 1 }}>
              Today
            </Button>

            <IconButton onClick={() => onNavigate("prev")} size="small">
              <NavigateBefore />
            </IconButton>

            <IconButton onClick={() => onNavigate("next")} size="small">
              <NavigateNext />
            </IconButton>

            <Tabs value={viewMode} onChange={(_, value) => onViewModeChange(value)} variant="scrollable">
              <Tab icon={<ViewDay />} value="day" label="Day" sx={{ minWidth: "auto", px: 1 }} />
              <Tab icon={<ViewWeek />} value="week" label="Week" sx={{ minWidth: "auto", px: 1 }} />
              <Tab icon={<ViewModule />} value="month" label="Month" sx={{ minWidth: "auto", px: 1 }} />
            </Tabs>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
};
