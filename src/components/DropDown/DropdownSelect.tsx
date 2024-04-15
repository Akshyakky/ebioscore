import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";

interface DropdownSelectProps {
  label: string;
  name: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (event: SelectChangeEvent<unknown>, child: React.ReactNode) => void;
  size?: "small" | "medium";
  disabled?: boolean;
  isMandatory?: boolean;
  defaultText?: string;
  className?: string;
  isSubmitted?: boolean;
}

const DropdownSelect: React.FC<DropdownSelectProps> = ({
  label,
  name,
  value,
  options,
  onChange,
  size = "medium",
  disabled,
  isMandatory = false,
  defaultText,
  className,
  isSubmitted = false,
}) => {
  const isEmptyValue = (val: string) => val === "" || val === "0";
  const hasError = isMandatory && isSubmitted && isEmptyValue(value);

  return (
    <FormControl
      variant="outlined"
      size={size}
      fullWidth
      className={className}
      error={hasError}
      margin="normal"
    >
      <InputLabel
        id={`ddl-label-${name}`}
        htmlFor={`ddl${name}`}

      >
        {label}
      </InputLabel>
      <Select
        labelId={`ddl-label-${name}`}
        id={`ddl${name}`}
        name={name}
        value={value}
        onChange={onChange}
        label={label}
        disabled={disabled}
        displayEmpty
      >
        {/* disabled={value !== ""} */}
        <MenuItem value={""}>{defaultText || `${label}`}</MenuItem>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {hasError && <FormHelperText>{label} is required.</FormHelperText>}
    </FormControl>
  );
};

export default DropdownSelect;
