import { usePatientSearch } from "@/hooks/PatientAdminstration/patient/usePatientSearch";
import { PatientOption } from "@/interfaces/PatientAdministration/Patient/PatientSearch.interface";
import { formatDt } from "@/utils/Common/dateUtils";
import { Autocomplete, Box, CircularProgress, TextField, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { PatientSearchProps } from "./PatientSearchProps";

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
  const { inputValue, setInputValue, options, isLoading, selectedPatient, setSelectedPatient, clearSearch } = usePatientSearch({ minSearchLength });

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
      loading={isLoading}
      value={selectedPatient}
      inputValue={inputValue}
      onChange={(_, newValue) => handlePatientSelect(newValue)}
      onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
      getOptionLabel={(option) => `${option.fullName} (${option.pChartCode})`}
      isOptionEqualToValue={(option, value) => option.pChartID === value.pChartID}
      filterOptions={(options, state) => {
        return options;
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          inputProps={params.inputProps}
          InputLabelProps={{ className: "" }}
          label={label}
          variant="outlined"
          placeholder={placeholder}
          size="small"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
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
              {option.pDob ? ` • DOB: ${formatDt(option.pDob)}` : ""}
            </Typography>
          </Box>
        </li>
      )}
      noOptionsText="No patients found"
      fullWidth
      size="small"
      disabled={disabled}
      className={className || ""}
    />
  );
};
