import React from "react";
import { Form } from "react-bootstrap";

interface CheckboxProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isMandatory?: boolean;
  disabled?: boolean;
  className?: string; // For custom styling
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  name,
  checked,
  onChange,
  isMandatory = false,
  disabled = false,
  className,
}) => {
  return (
    <Form.Group className={className}>
      <Form.Check
        type="checkbox"
        name={name}
        label={
          <>
            {label}
            {isMandatory && <span className="text-danger">*</span>}
          </>
        }
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        aria-required={isMandatory}
      />
    </Form.Group>
  );
};

export default Checkbox;
