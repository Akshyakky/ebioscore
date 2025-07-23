// src/frontOffice/components/SchedulerStatistics.tsx
import { AppointBookingDto } from "@/interfaces/FrontOffice/AppointBookingDto";
import { BreakListData } from "@/interfaces/FrontOffice/BreakListDto";
import { CheckCircle, Event as EventIcon, AccessTime as TimeIcon, Warning } from "@mui/icons-material";
import { Avatar, Card, Grid, Paper, Typography } from "@mui/material";
import React from "react";

interface SchedulerStatisticsProps {
  appointments: AppointBookingDto[];
  breaks: BreakListData[];
}

export const SchedulerStatistics: React.FC<SchedulerStatisticsProps> = ({ appointments, breaks }) => {
  const confirmedCount = appointments.filter((apt) => apt.abStatus === "Confirmed").length;
  const scheduledCount = appointments.filter((apt) => apt.abStatus === "Scheduled").length;

  return (
    <Paper sx={{ p: 1 }}>
      <Typography variant="subtitle2" gutterBottom sx={{ fontSize: "0.9rem" }}>
        Today's Statistics
      </Typography>
      <Grid container spacing={1}>
        <Grid size={{ xs: 3 }}>
          <Card sx={{ textAlign: "center", p: 1 }}>
            <Avatar sx={{ bgcolor: "primary.main", mx: "auto", mb: 0.5, width: 32, height: 32 }}>
              <EventIcon fontSize="small" />
            </Avatar>
            <Typography variant="h6" sx={{ fontSize: "1rem" }}>
              {appointments.length}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
              Total
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 3 }}>
          <Card sx={{ textAlign: "center", p: 1 }}>
            <Avatar sx={{ bgcolor: "success.main", mx: "auto", mb: 0.5, width: 32, height: 32 }}>
              <CheckCircle fontSize="small" />
            </Avatar>
            <Typography variant="h6" sx={{ fontSize: "1rem" }}>
              {confirmedCount}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
              Confirmed
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 3 }}>
          <Card sx={{ textAlign: "center", p: 1 }}>
            <Avatar sx={{ bgcolor: "warning.main", mx: "auto", mb: 0.5, width: 32, height: 32 }}>
              <Warning fontSize="small" />
            </Avatar>
            <Typography variant="h6" sx={{ fontSize: "1rem" }}>
              {scheduledCount}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
              Pending
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 3 }}>
          <Card sx={{ textAlign: "center", p: 1 }}>
            <Avatar sx={{ bgcolor: "info.main", mx: "auto", mb: 0.5, width: 32, height: 32 }}>
              <TimeIcon fontSize="small" />
            </Avatar>
            <Typography variant="h6" sx={{ fontSize: "1rem" }}>
              {breaks.length}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
              Breaks
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
};
