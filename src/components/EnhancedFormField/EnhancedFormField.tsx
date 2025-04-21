// src/components/EnhancedFormField/EnhancedFormField.tsx
import React from "react";
import { TextField, Switch, FormControlLabel, Grid, Radio, RadioGroup, FormControl, FormLabel, InputLabel, Select, MenuItem, Typography, Tooltip, Box } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

interface EnhancedFormFieldProps {
  type: "text" | "textarea" | "switch" | "radio" | "select";
  label: string;
  name: string;
  value: string | number | boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  isMandatory?: boolean;
  isSubmitted?: boolean;
  error?: string;
  helperText?: string;
  tooltip?: string;
  options?: Array<{ label: string; value: string | number }>;
  disabled?: boolean;
  maxLength?: number;
  rows?: number;
  checked?: boolean;
  fullWidth?: boolean;
}

const EnhancedFormField: React.FC<EnhancedFormFieldProps> = ({
  type,
  label,
  name,
  value,
  onChange,
  placeholder,
  isMandatory = false,
  isSubmitted = false,
  error,
  helperText,
  tooltip,
  options = [],
  disabled = false,
  maxLength,
  rows = 4,
  checked,
  fullWidth = true,
}) => {
  const showError = isSubmitted && isMandatory && !value && !error;
  const errorMessage = error || (showError ? `${label} is required` : "");

  const labelWithAsterisk = isMandatory ? `${label} *` : label;

  const renderLabelWithTooltip = () => {
    if (!tooltip) return labelWithAsterisk;

    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        {labelWithAsterisk}
        <Tooltip title={tooltip} arrow placement="top">
          <InfoIcon fontSize="small" color="action" />
        </Tooltip>
      </Box>
    );
  };

  switch (type) {
    case "text":
      return (
        <TextField
          fullWidth={fullWidth}
          label={renderLabelWithTooltip()}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          error={!!errorMessage}
          helperText={errorMessage || helperText}
          disabled={disabled}
          inputProps={{ maxLength }}
          size="small"
          variant="outlined"
        />
      );

    case "textarea":
      return (
        <TextField
          fullWidth={fullWidth}
          label={renderLabelWithTooltip()}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          error={!!errorMessage}
          helperText={errorMessage || helperText || (maxLength ? `${String(value).length}/${maxLength} characters` : "")}
          disabled={disabled}
          multiline
          rows={rows}
          inputProps={{ maxLength }}
          size="small"
          variant="outlined"
        />
      );

    case "switch":
      return (
        <FormControlLabel
          control={<Switch name={name} checked={checked || value === "Y" || value === true} onChange={onChange} disabled={disabled} color="primary" />}
          label={
            <Typography variant="body2" color={disabled ? "text.disabled" : "text.primary"}>
              {label}
            </Typography>
          }
        />
      );

    case "radio":
      return (
        <FormControl component="fieldset" error={!!errorMessage} disabled={disabled}>
          <FormLabel component="legend">{renderLabelWithTooltip()}</FormLabel>
          <RadioGroup name={name} value={value} onChange={onChange} row>
            {options.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio size="small" />}
                label={
                  <Typography variant="body2" color={disabled ? "text.disabled" : "text.primary"}>
                    {option.label}
                  </Typography>
                }
              />
            ))}
          </RadioGroup>
          {errorMessage && (
            <Typography variant="caption" color="error">
              {errorMessage}
            </Typography>
          )}
        </FormControl>
      );

    case "select":
      return (
        <FormControl fullWidth={fullWidth} error={!!errorMessage} disabled={disabled} size="small">
          <InputLabel>{renderLabelWithTooltip()}</InputLabel>
          <Select name={name} value={value} onChange={onChange as any} label={renderLabelWithTooltip()}>
            <MenuItem value="">
              <em>Select {label}</em>
            </MenuItem>
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {errorMessage && (
            <Typography variant="caption" color="error">
              {errorMessage}
            </Typography>
          )}
        </FormControl>
      );

    default:
      return null;
  }
};

export default EnhancedFormField;
