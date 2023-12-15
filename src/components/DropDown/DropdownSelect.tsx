import React from "react";
import { Form, FloatingLabel } from "react-bootstrap";

interface DropdownSelectProps {
  label: string;
  name: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  size?: "sm" | "lg";
  disabled?: boolean;
  isMandatory?: boolean;
  defaultText?: string;
  className?: string; // Added for custom styling
}

const DropdownSelect: React.FC<DropdownSelectProps> = ({
  label,
  name,
  value,
  options,
  onChange,
  size,
  disabled,
  isMandatory = false,
  defaultText,
  className,
}) => {
  return (
    <FloatingLabel controlId={`ddl${name}`} label={label} className={className}>
      <Form.Select
        name={name}
        value={value}
        onChange={onChange}
        size={size}
        disabled={disabled}
        aria-label={label}
        aria-required={isMandatory}
        className={isMandatory && !value ? "is-invalid" : ""}
      >
        <option value="" disabled={value !== ""}>
          {defaultText || label}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Form.Select>
      {isMandatory && !value && (
        <Form.Control.Feedback type="invalid">
          {label} is required.
        </Form.Control.Feedback>
      )}
    </FloatingLabel>
  );
};

export default DropdownSelect;
