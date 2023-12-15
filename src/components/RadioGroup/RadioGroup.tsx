import React from "react";
import { Form } from "react-bootstrap";

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  selectedValue: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isMandatory?: boolean;
  disabled?: boolean;
  className?: string; // For custom styling
  inline?: boolean; // To render the radio buttons inline
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
    <Form.Group className={className}>
      {label && <Form.Label className="radio-group-label">{label}</Form.Label>}
      {options.map((option, index) => {
        const id = `${name}-${index}`;
        return (
          <Form.Check
            key={id}
            id={id}
            type="radio"
            inline={inline}
            name={name}
            label={option.label}
            value={option.value}
            checked={selectedValue === option.value}
            onChange={onChange}
            disabled={disabled}
            aria-required={isMandatory}
            className="form-check-inline"
          />
        );
      })}
    </Form.Group>
  );
};

export default RadioGroup;
