import React from "react";
import { FormControl, TextField, FormHelperText } from "@mui/material";

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
  style?: React.CSSProperties;
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
  style
}) => {
  return (
    <FormControl className={className} fullWidth margin="normal" style={style}>
      <TextField
        label={label}
        name={name}
        value={value}
        onChange={onChange}
        multiline
        rows={rows}
        disabled={disabled}
        InputProps={{
          readOnly: readOnly,
        }}
        placeholder={placeholder}
        required={isMandatory}
        variant="outlined"
      />
      {isMandatory && (
        <FormHelperText error>{label} is required</FormHelperText>
      )}
    </FormControl>
  );
};

export default TextArea;
