import React from "react";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import clsx from "clsx";

interface CheckboxProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isMandatory?: boolean;
  disabled?: boolean;
  className?: string;
  size?: "small" | "medium";
}

const CustomCheckbox: React.FC<CheckboxProps> = ({ label, name, checked, onChange, isMandatory = false, disabled = false, className, size = "medium", ...props }) => {
  return (
    <FormGroup className={clsx(className)}>
      <FormControlLabel
        control={<Checkbox checked={checked} onChange={onChange} name={name} disabled={disabled} color="primary" size={size} inputProps={{ "aria-required": isMandatory }} />}
        label={
          <>
            {label}
            {isMandatory && <span className="text-danger">*</span>}
          </>
        }
        {...props}
      />
    </FormGroup>
  );
};

export default CustomCheckbox;
