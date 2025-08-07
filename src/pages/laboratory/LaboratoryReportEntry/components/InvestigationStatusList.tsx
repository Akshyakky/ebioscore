import { GetLabRegistersListDto, InvStatusResponseDto } from "@/interfaces/Laboratory/LaboratoryReportEntry";
import { Box, CircularProgress, Grid, Paper, Stack, Typography } from "@mui/material";
import React from "react";
import { InvestigationCountChips } from "./common/InvestigationCountChips";
import { StatusChip } from "./common/StatusChip";

interface InvestigationStatusListProps {
  investigations: InvStatusResponseDto[];
  loading: boolean;
  selectedRegister: GetLabRegistersListDto | null;
}

export const InvestigationStatusList: React.FC<InvestigationStatusListProps> = ({ investigations, loading, selectedRegister }) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (investigations.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <Typography color="text.secondary">No investigation data available</Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      {investigations.map((investigation, index) => (
        <Paper key={index} elevation={1} sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 8 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {investigation.investigationName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Code: {investigation.investigationCode}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <StatusChip status={investigation.sampleStatus} />
            </Grid>
          </Grid>
        </Paper>
      ))}

      {selectedRegister && (
        <Box mt={2} p={2} borderRadius={1}>
          <Typography variant="subtitle2" gutterBottom>
            Summary
          </Typography>
          <InvestigationCountChips register={selectedRegister.labRegister} />
        </Box>
      )}
    </Stack>
  );
};
