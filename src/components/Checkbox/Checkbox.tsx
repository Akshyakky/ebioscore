import React from "react";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";

interface CheckboxProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isMandatory?: boolean;
  disabled?: boolean;
  className?: string; // For custom styling
}

const CustomCheckbox: React.FC<CheckboxProps> = ({
  label,
  name,
  checked,
  onChange,
  isMandatory = false,
  disabled = false,
  className,
  ...props // for additional FormControlLabelProps
}) => {
  return (
    <FormGroup className={className}>
      <FormControlLabel
        control={
          <Checkbox
            checked={checked}
            onChange={onChange}
            name={name}
            disabled={disabled}
            color="primary" // You can customize the color
          />
        }
        label={
          <>
            {label}
            {isMandatory && <span className="text-danger">*</span>}
          </>
        }
        {...props} // Spread any additional props
      />
    </FormGroup>
  );
};

export default CustomCheckbox;
