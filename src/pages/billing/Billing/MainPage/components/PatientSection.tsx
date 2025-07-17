// src/pages/billing/Billing/MainPage/components/PatientSection.tsx
import { PatientSearchResult } from "@/interfaces/PatientAdministration/Patient/PatientSearch.interface";
import { PatientDemographics } from "@/pages/patientAdministration/CommonPage/Patient/PatientDemographics/PatientDemographics";
import { PatientSearch } from "@/pages/patientAdministration/CommonPage/Patient/PatientSearch/PatientSearch";
import { Box, Card, CardContent, Divider, Grid, Typography } from "@mui/material";
import React from "react";

interface PatientSectionProps {
  selectedPChartID: number;
  clearSearchTrigger: number;
  onPatientSelect: (patient: PatientSearchResult) => void;
}

export const PatientSection: React.FC<PatientSectionProps> = ({ selectedPChartID, clearSearchTrigger, onPatientSelect }) => {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Patient Information
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid size={{ sm: 12, md: 6 }}>
            <PatientSearch onPatientSelect={onPatientSelect} clearTrigger={clearSearchTrigger} placeholder="Enter name, UHID or phone number" disabled={selectedPChartID > 0} />
          </Grid>
        </Grid>

        {selectedPChartID > 0 && (
          <Box mt={2}>
            <PatientDemographics pChartID={selectedPChartID} />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
