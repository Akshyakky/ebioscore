// src/pages/common/AlertManagerPage/SubPage/PatientSelector.tsx
import React, { useState, useCallback, useEffect } from "react";
import { Grid, Paper, Typography, Box, Chip } from "@mui/material";
import FormField from "@/components/FormField/FormField";
import PatientDemographics from "@/pages/patientAdministration/CommonPage/Demograph/PatientDemographics";
import { usePatientAutocomplete } from "@/hooks/PatientAdminstration/usePatientAutocomplete";
import extractNumbers from "@/utils/PatientAdministration/extractNumbers";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";

interface PatientSelectorProps {
  pChartID: number;
  onPatientSelect: (pChartID: number, pChartCode: string) => void;
  disabled?: boolean;
  isSubmitted?: boolean;
}

const PatientSelector: React.FC<PatientSelectorProps> = ({ pChartID, onPatientSelect, disabled = false, isSubmitted = false }) => {
  const [pChartCode, setPChartCode] = useState<string>("");
  const { fetchPatientSuggestions } = usePatientAutocomplete();

  useEffect(() => {
    if (!pChartID) {
      setPChartCode("");
    }
  }, [pChartID]);

  const handlePatientSelect = useCallback(
    async (selectedSuggestion: string) => {
      const numbersArray = extractNumbers(selectedSuggestion);
      const extractedPChartID = numbersArray.length > 0 ? numbersArray[0] : null;

      if (extractedPChartID) {
        const pChartCode = selectedSuggestion.split("|")[0].trim();
        setPChartCode(pChartCode);
        onPatientSelect(extractedPChartID, pChartCode);
      }
    },
    [onPatientSelect]
  );

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
      <Box sx={{ mb: 2, display: "flex", alignItems: "center" }}>
        <PersonSearchIcon sx={{ mr: 1, color: "primary.main" }} />
        <Typography variant="h6">Patient Selection</Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <FormField
            ControlID="UHID"
            label="Patient UHID"
            name="pChartCode"
            type="autocomplete"
            placeholder="Search by UHID, Name, DOB, Phone..."
            value={pChartCode}
            onChange={(e) => setPChartCode(e.target.value)}
            fetchSuggestions={fetchPatientSuggestions}
            isMandatory
            onSelectSuggestion={handlePatientSelect}
            isSubmitted={isSubmitted}
            disabled={disabled}
            gridProps={{ xs: 12 }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={8} lg={9}>
          {pChartID > 0 ? (
            <PatientDemographics pChartID={pChartID} />
          ) : (
            <Box
              sx={{
                display: "flex",
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 1,
                p: 2,
                backgroundColor: "background.default",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Select a patient to manage their alerts
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default React.memo(PatientSelector);
