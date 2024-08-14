import React, { useMemo } from "react";
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
import { styled } from "@mui/material/styles";

interface DropdownSelectProps {
  label: string;
  name: string;
  value: string | string[];
  options: Array<{ value: string; label: string }>;
  onChange: (event: SelectChangeEvent<string | string[]>) => void;
  size?: "small" | "medium";
  disabled?: boolean;
  isMandatory?: boolean;
  defaultText?: string;
  className?: string;
  isSubmitted?: boolean;
  multiple?: boolean;
}

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  backgroundColor: "#fff",
  color: "#000",
  "&:hover": {
    backgroundColor: "var(--hover-color)",
  },
}));

const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
  color: "var(--primary-color)",
  "&.Mui-checked": {
    color: "var(--primary-color)",
  },
}));

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
  color: "#000",
}));

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
  multiple = false,
}) => {
  const isEmptyValue = useMemo(() => {
    return Array.isArray(value) ? value.length === 0 : value === "" || value === "0";
  }, [value]);

  const hasError = isMandatory && isSubmitted && isEmptyValue;

  const renderValue = useMemo(() => {
    return (selected: string | string[]) => {
      if (Array.isArray(selected)) {
        return selected
          .map((val) => options.find((option) => option.value === val)?.label || val)
          .join(", ");
      }
      return options.find((option) => option.value === selected)?.label || selected;
    };
  }, [options]);

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
        input={multiple ? <OutlinedInput label={label} /> : undefined}
        renderValue={renderValue}
      >
        {multiple && (
          <MenuItem disabled value="">
            <em>{defaultText || `Select ${label}`}</em>
          </MenuItem>
        )}
        {options.map((option) => (
          <StyledMenuItem key={option.value} value={option.value}>
            {multiple ? (
              <>
                <StyledCheckbox
                  checked={
                    Array.isArray(value) && value.indexOf(option.value) > -1
                  }
                />
                <StyledListItemText primary={option.label} />
              </>
            ) : (
              option.label
            )}
          </StyledMenuItem>
        ))}
      </Select>
      {hasError && <FormHelperText>{label} is required.</FormHelperText>}
    </FormControl>
  );
};

export default MultiSelectDropdown;
