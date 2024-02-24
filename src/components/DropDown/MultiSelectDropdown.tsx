import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  OutlinedInput,
  Checkbox,
  ListItemText,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";

interface DropdownSelectProps {
  label: string;
  name: string;
  value: string | string[]; // Adjusted to accept an array for multiple selections
  options: Array<{ value: string; label: string }>;
  onChange: (event: SelectChangeEvent<unknown>) => void; // Simplified type for event
  size?: "small" | "medium";
  disabled?: boolean;
  isMandatory?: boolean;
  defaultText?: string;
  className?: string;
  isSubmitted?: boolean;
  multiple?: boolean;
}

const MultiSelectDropdown: React.FC<DropdownSelectProps> = ({
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
  multiple = false, // Default to false to maintain backward compatibility
}) => {
  const isEmptyValue = (val: string | string[]) => {
    return Array.isArray(val) ? val.length === 0 : val === "" || val === "0";
  };
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
      <InputLabel id={`ddl-label-${name}`} htmlFor={`ddl${name}`}>
        {label}
      </InputLabel>
      <Select
        multiple={multiple}
        labelId={`ddl-label-${name}`}
        id={`ddl${name}`}
        name={name}
        value={value}
        onChange={onChange}
        label={label}
        disabled={disabled}
        displayEmpty
        input={multiple ? <OutlinedInput label={label} /> : undefined}
        renderValue={
          multiple
            ? (selected) => {
                return Array.isArray(selected)
                  ? selected
                      .map(
                        (val) =>
                          options.find((option) => option.value === val)
                            ?.label || val
                      )
                      .join(", ")
                  : selected;
              }
            : undefined
        }
      >
        {multiple && (
          <MenuItem disabled value="">
            <em>{defaultText || `Select ${label}`}</em>
          </MenuItem>
        )}
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {multiple ? (
              <>
                <Checkbox
                  checked={
                    Array.isArray(value) && value.indexOf(option.value) > -1
                  }
                />
                <ListItemText primary={option.label} />
              </>
            ) : (
              option.label
            )}
          </MenuItem>
        ))}
      </Select>
      {hasError && <FormHelperText>{label} is required.</FormHelperText>}
    </FormControl>
  );
};

export default MultiSelectDropdown;
