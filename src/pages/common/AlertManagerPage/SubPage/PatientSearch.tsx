import React, { useState, useEffect } from "react";
import { TextField, Autocomplete, Box, CircularProgress, Typography } from "@mui/material";
import { RegistrationService } from "@/services/PatientAdministrationServices/RegistrationService/RegistrationService";
import { debounce } from "@/utils/Common/debounceUtils";

interface PatientOption {
  pChartID: number;
  pChartCode: string;
  pfName: string;
  plName: string;
  pAddPhone1?: string;
  pDob?: Date;
  fullName: string; // Derived field
}

interface PatientSearchProps {
  onPatientSelect: (patient: { pChartID: number; pChartCode: string; fullName: string } | null) => void;
}

const PatientSearch: React.FC<PatientSearchProps> = ({ onPatientSelect }) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [options, setOptions] = useState<PatientOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(null);

  // Create a debounced function to avoid excessive API calls
  const debouncedSearch = React.useCallback(
    debounce(async (searchTerm: string) => {
      if (searchTerm.length < 2) {
        setOptions([]);
        return;
      }

      try {
        setLoading(true);
        const response = await RegistrationService.searchPatients(searchTerm);

        if (response.success && response.data) {
          // Format the patient data for display
          const patientOptions: PatientOption[] = response.data.map((patient: any) => ({
            pChartID: patient.pChartID,
            pChartCode: patient.pChartCode,
            pfName: patient.pfName || "",
            plName: patient.plName || "",
            pAddPhone1: patient.pAddPhone1,
            pDob: patient.pDob,
            fullName: `${patient.pfName || ""} ${patient.plName || ""}`.trim(),
          }));

          setOptions(patientOptions);
        } else {
          setOptions([]);
        }
      } catch (error) {
        console.error("Error searching for patients:", error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    debouncedSearch(inputValue);

    return () => {
      debouncedSearch.cancel();
    };
  }, [inputValue, debouncedSearch]);

  const handlePatientSelect = (patient: PatientOption | null) => {
    setSelectedPatient(patient);

    if (patient) {
      onPatientSelect({
        pChartID: patient.pChartID,
        pChartCode: patient.pChartCode,
        fullName: patient.fullName,
      });
    } else {
      onPatientSelect(null);
    }
  };

  return (
    <Autocomplete
      id="patient-search-autocomplete"
      options={options}
      loading={loading}
      value={selectedPatient}
      onChange={(_, newValue) => handlePatientSelect(newValue)}
      onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
      getOptionLabel={(option) => option.fullName || ""}
      isOptionEqualToValue={(option, value) => option.pChartID === value.pChartID}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search Patient"
          variant="outlined"
          placeholder="Enter name, chart code or phone number"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props}>
          <Box>
            <Typography variant="body1">
              {option.fullName} ({option.pChartCode})
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {option.pAddPhone1 ? `Phone: ${option.pAddPhone1}` : ""}
              {option.pDob ? ` • DOB: ${new Date(option.pDob).toLocaleDateString()}` : ""}
            </Typography>
          </Box>
        </li>
      )}
      noOptionsText="No patients found"
      fullWidth
      size="small"
    />
  );
};

export default PatientSearch;
