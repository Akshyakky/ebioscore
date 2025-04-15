import React, { useMemo } from "react";
import { FormControl, InputLabel, Select, MenuItem, FormHelperText, OutlinedInput, Checkbox, ListItemText, SelectChangeEvent } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { DropdownOption } from "../../interfaces/Common/DropdownOption";

interface MultiSelectDropdownProps {
  label: string;
  name: string;
  value: string[];
  options: DropdownOption[];
  onChange: (event: SelectChangeEvent<string[]>, child: React.ReactNode) => void;
  size?: "small" | "medium";
  disabled?: boolean;
  isMandatory?: boolean;
  defaultText?: string;
  className?: string;
  isSubmitted?: boolean;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
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
  const theme = useTheme();

  const backgroundColor = theme.palette.mode === "dark" ? theme.palette.background.paper : "#fff";
  const textColor = theme.palette.mode === "dark" ? theme.palette.text.primary : "#000";

  const isEmptyValue = useMemo(() => {
    return Array.isArray(value) ? value.length === 0 : value === "" || value === "0";
  }, [value]);

  const hasError = isMandatory && isSubmitted && isEmptyValue;

  const renderValue = useMemo(() => {
    return (selected: string | string[]) => {
      if (Array.isArray(selected)) {
        return selected.map((val) => options.find((option) => option.value === val)?.label || val).join(", ");
      }
      return options.find((option) => option.value === selected)?.label || selected;
    };
  }, [options]);

  const StyledMenuItem = styled(MenuItem)(() => ({
    backgroundColor: backgroundColor,
    color: textColor,
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  }));

  const StyledCheckbox = styled(Checkbox)(() => ({
    color: theme.palette.primary.main,
    "&.Mui-checked": {
      color: theme.palette.primary.main,
    },
  }));

  const StyledListItemText = styled(ListItemText)(() => ({
    color: textColor,
  }));

  return (
    <FormControl variant="outlined" size={size} fullWidth className={className} error={hasError} margin="normal">
      <InputLabel id={`ddl-label-${name}`} htmlFor={`ddl${name}`}>
        {label}
      </InputLabel>
      <Select
        multiple
        labelId={`ddl-label-${name}`}
        id={`ddl${name}`}
        name={name}
        value={value}
        onChange={onChange}
        label={label}
        disabled={disabled}
        input={<OutlinedInput label={label} />}
        renderValue={renderValue}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 300, // 👈 limit dropdown height
              backgroundColor: backgroundColor,
              color: textColor,
            },
          },
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            backgroundColor: backgroundColor,
            color: textColor,
          },
        }}
      >
        <MenuItem disabled value="">
          <em>{defaultText || `Select ${label}`}</em>
        </MenuItem>
        {options.map((option) => (
          <StyledMenuItem key={option.value} value={option.value}>
            <StyledCheckbox checked={Array.isArray(value) && value.indexOf(option.value) > -1} />
            <StyledListItemText primary={option.label} />
          </StyledMenuItem>
        ))}
      </Select>
      {hasError && <FormHelperText>{label} is required.</FormHelperText>}
    </FormControl>
  );
};

export default MultiSelectDropdown;
