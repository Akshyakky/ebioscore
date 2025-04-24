// src/pages/patientAdministration/commonPage/patient/PatientSearch.tsx
import React, { useEffect } from "react";
import { TextField, Autocomplete, Box, CircularProgress, Typography } from "@mui/material";
import { PatientSearchProps } from "./PatientSearchProps";
import { PatientOption } from "@/interfaces/PatientAdministration/Patient/PatientSearch.interface";
import { usePatientSearch } from "@/hooks/PatientAdminstration/patient/usePatientSearch";

/**
 * Reusable patient search component with autocomplete
 */
export const PatientSearch: React.FC<PatientSearchProps> = ({
  onPatientSelect,
  clearTrigger = 0,
  minSearchLength = 2,
  label = "Search Patient",
  placeholder = "Enter name, chart code or phone number",
  disabled = false,
  initialSelection = null,
  className,
}) => {
  const { inputValue, setInputValue, options, loading, selectedPatient, setSelectedPatient, clearSearch } = usePatientSearch({ minSearchLength });

  // Handle external clear trigger
  useEffect(() => {
    if (clearTrigger > 0) {
      clearSearch();
    }
  }, [clearTrigger, clearSearch]);

  // Handle initial selection if provided
  useEffect(() => {
    if (initialSelection && !selectedPatient) {
      setSelectedPatient(initialSelection);
    }
  }, [initialSelection, selectedPatient, setSelectedPatient]);

  // Handle patient selection and propagate to parent
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
      inputValue={inputValue}
      onChange={(_, newValue) => handlePatientSelect(newValue)}
      onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
      getOptionLabel={(option) => option.fullName || ""}
      isOptionEqualToValue={(option, value) => option.pChartID === value.pChartID}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          variant="outlined"
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
          disabled={disabled}
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
      disabled={disabled}
      className={className}
    />
  );
};
