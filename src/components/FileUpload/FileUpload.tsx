import React from "react";
import { Form } from "react-bootstrap";

interface FileUploadProps {
  label: string;
  name: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  multiple?: boolean;
  isMandatory?: boolean;
  disabled?: boolean;
  className?: string; // For custom styling
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  name,
  onChange,
  multiple = false,
  isMandatory = false,
  disabled = false,
  className,
}) => {
  return (
    <Form.Group className={className}>
      <Form.Label>
        {label}
        {isMandatory && <span className="text-danger">*</span>}
      </Form.Label>
      <Form.Control
        type="file"
        name={name}
        onChange={onChange}
        multiple={multiple}
        disabled={disabled}
        aria-required={isMandatory}
      />
    </Form.Group>
  );
};

export default FileUpload;
