import React from "react";
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup as MuiRadioGroup,
  FormLabel,
  FormHelperText,
  Box,
} from "@mui/material";
import { SxProps } from "@mui/system";
import { Theme } from "@mui/material/styles";

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  selectedValue: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>, value: string) => void;
  isMandatory?: boolean;
  disabled?: boolean;
  className?: string;
  inline?: boolean;
  label?: string;
  error?: boolean;
  helperText?: string;
  sx?: SxProps<Theme>;
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  selectedValue,
  onChange,
  isMandatory = false,
  disabled = false,
  className,
  inline = false,
  label = "",
  error = false,
  helperText = "",
  sx = {},
}) => {
  return (
    <FormControl
      component="fieldset"
      className={className}
      required={isMandatory}
      disabled={disabled}
      error={error}
      sx={sx}
    >
      {label && <FormLabel component="legend">{label}</FormLabel>}
      <MuiRadioGroup
        name={name}
        value={selectedValue}
        onChange={onChange}
        row={inline}
        aria-required={isMandatory}
      >
        {options.map((option, index) => (
          <FormControlLabel
            key={`${name}-${index}`}
            value={option.value}
            control={<Radio />}
            label={option.label}
            disabled={disabled}
            sx={{ mb: inline ? 0 : 1 }}
          />
        ))}
      </MuiRadioGroup>
      {helperText && (
        <FormHelperText>{helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

export default RadioGroup;
