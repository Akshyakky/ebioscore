import React from "react";
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup as MuiRadioGroup,
  FormLabel,
} from "@mui/material";

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
}) => {
  return (
    <FormControl component="fieldset" className={className}>
      {label && <FormLabel>{label}</FormLabel>}
      <MuiRadioGroup
        name={name}
        value={selectedValue}
        onChange={onChange}
        row={inline}
      >
        {options.map((option, index) => (
          <FormControlLabel
            key={`${name}-${index}`}
            value={option.value}
            control={<Radio />}
            label={option.label}
            disabled={disabled}
            required={isMandatory}
            sx={{ mb: -2 }}
          />
        ))}
      </MuiRadioGroup>
    </FormControl>
  );
};

export default RadioGroup;
