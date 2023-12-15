import React from "react";
import { Form } from "react-bootstrap";

interface TextAreaProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number; // Optional: number of rows for the text area
  isMandatory?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string; // For custom styling
  placeholder?: string; // Optional: placeholder text
}

const TextArea: React.FC<TextAreaProps> = ({
  label,
  name,
  value,
  onChange,
  rows = 3, // Default number of rows
  isMandatory = false,
  disabled = false,
  readOnly = false,
  className,
  placeholder,
}) => {
  return (
    <Form.Group className={className}>
      <Form.Label>
        {label}
        {isMandatory && <span className="text-danger">*</span>}
      </Form.Label>
      <Form.Control
        as="textarea"
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        disabled={disabled}
        readOnly={readOnly}
        placeholder={placeholder}
        aria-required={isMandatory}
      />
    </Form.Group>
  );
};

export default TextArea;
