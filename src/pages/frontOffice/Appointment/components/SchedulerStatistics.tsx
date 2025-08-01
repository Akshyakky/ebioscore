// src/frontOffice/components/SchedulerStatistics.tsx
import { AppointBookingDto } from "@/interfaces/FrontOffice/AppointBookingDto";
import { BreakListData } from "@/interfaces/FrontOffice/BreakListDto";
import { CheckCircle, Event as EventIcon, AccessTime as TimeIcon, Warning } from "@mui/icons-material";
import { Avatar, Card, CardContent, Grid, Paper, Stack, Typography } from "@mui/material";
import React from "react";

interface SchedulerStatisticsProps {
  appointments: AppointBookingDto[];
  breaks: BreakListData[];
}

export const SchedulerStatistics: React.FC<SchedulerStatisticsProps> = ({ appointments, breaks }) => {
  const confirmedCount = appointments.filter((apt) => apt.abStatus === "Confirmed").length;
  const scheduledCount = appointments.filter((apt) => apt.abStatus === "Scheduled").length;

  const StatisticCard = ({ title, count, icon, color }: { title: string; count: number; icon: React.ReactNode; color: string }) => (
    <Card variant="outlined" elevation={1}>
      <CardContent style={{ textAlign: "center", padding: 8 }}>
        <Stack spacing={0.5} alignItems="center">
          <Avatar style={{ backgroundColor: color, width: 32, height: 32 }}>{icon}</Avatar>
          <Typography variant="h6" component="div" style={{ fontSize: "1rem" }}>
            {count}
          </Typography>
          <Typography variant="caption" color="text.secondary" style={{ fontSize: "0.7rem" }}>
            {title}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Paper variant="outlined" style={{ padding: 8 }}>
      <Typography variant="subtitle2" gutterBottom style={{ fontSize: "0.9rem" }}>
        Today's Statistics
      </Typography>
      <Grid container spacing={1}>
        <Grid size={{ xs: 3 }}>
          <StatisticCard title="Total" count={appointments.length} icon={<EventIcon fontSize="small" />} color="#1976d2" />
        </Grid>

        <Grid size={{ xs: 3 }}>
          <StatisticCard title="Confirmed" count={confirmedCount} icon={<CheckCircle fontSize="small" />} color="#2e7d32" />
        </Grid>

        <Grid size={{ xs: 3 }}>
          <StatisticCard title="Pending" count={scheduledCount} icon={<Warning fontSize="small" />} color="#ed6c02" />
        </Grid>

        <Grid size={{ xs: 3 }}>
          <StatisticCard title="Breaks" count={breaks.length} icon={<TimeIcon fontSize="small" />} color="#0288d1" />
        </Grid>
      </Grid>
    </Paper>
  );
};
