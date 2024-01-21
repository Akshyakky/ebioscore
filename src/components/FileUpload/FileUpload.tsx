import React from "react";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Input from "@mui/material/Input";
import FormHelperText from "@mui/material/FormHelperText";

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
    <FormControl className={className}>
      <InputLabel htmlFor={name}>
        {label}
        {isMandatory && <span className="text-danger">*</span>}
      </InputLabel>
      <Input
        id={name}
        type="file"
        inputProps={{
          multiple,
          disabled,
          "aria-required": isMandatory ? true : undefined,
        }}
        onChange={onChange}
        disabled={disabled}
      />
      {isMandatory && <FormHelperText error={true}>Required</FormHelperText>}
    </FormControl>
  );
};

export default FileUpload;
