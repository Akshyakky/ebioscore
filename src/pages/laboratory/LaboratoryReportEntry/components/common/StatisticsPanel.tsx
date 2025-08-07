import { Grid, Paper, Typography } from "@mui/material";
import React from "react";
import { LabStatistics } from "../../hooks/useLabStatistics";

interface StatisticsPanelProps {
  stats: LabStatistics;
}

const StatItem: React.FC<{ title: string; value: number; color?: string }> = ({ title, value, color }) => (
  <Grid size={{ xs: 12, sm: 2 }}>
    <Typography variant="h6">{title}</Typography>
    <Typography variant="h4" color={color}>
      {value}
    </Typography>
  </Grid>
);

export const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ stats }) => {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <StatItem title="Total Registers" value={stats.totalRegisters} />
        <StatItem title="Pending Samples" value={stats.pendingSamples} color="error.main" />
        <StatItem title="Collected Samples" value={stats.collectedSamples} color="warning.main" />
        <StatItem title="Completed Results" value={stats.completedResults} color="info.main" />
        <StatItem title="Approved Results" value={stats.approvedResults} color="success.main" />
        <StatItem title="Total Tests" value={stats.totalInvestigations} color="secondary.main" />
      </Grid>
    </Paper>
  );
};
