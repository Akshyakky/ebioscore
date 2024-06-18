import React, { useMemo, useCallback, useState } from "react";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import { FloatingLabelTextBoxProps } from "../TextBox/FloatingLabelTextBox/FloatingLabelTextBox"; 

interface FloatingLabelFileUploadProps extends FloatingLabelTextBoxProps {
  accept?: string; // Optional prop for accepted file types
  multiple?: boolean; // Optional prop for multiple file selection
}

const FloatingLabelFileUpload: React.FC<FloatingLabelFileUploadProps> = ({
  ControlID,
  title,
  onChange = () => {},
  className,
  style,
  isMandatory = false,
  disabled = false,
  readOnly = false,
  ariaLabel = "",
  isSubmitted = false,
  errorMessage,
  accept,
  multiple = false,
  name,
}) => {
  const [fileName, setFileName] = useState("");
  const controlId = useMemo(() => `file${ControlID}`, [ControlID]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        setFileName(multiple ? Array.from(files).map(file => file.name).join(", ") : files[0].name);
        onChange(e);
      }
    },
    [onChange, multiple]
  );

  const isInvalid = useMemo(
    () => (isMandatory && isSubmitted && !fileName) || !!errorMessage,
    [isMandatory, isSubmitted, fileName, errorMessage]
  );

  const errorToShow = useMemo(
    () =>
      errorMessage || (isMandatory && !fileName ? `${title} is required.` : ""),
    [errorMessage, isMandatory, fileName, title]
  );

  return (
    <FormControl
      variant="outlined"
      fullWidth
      margin="normal"
      className={className}
      style={style}
    >
      <input
        accept={accept}
        style={{ display: "none" }}
        id={controlId}
        type="file"
        onChange={handleChange}
        disabled={disabled || readOnly}
        multiple={multiple}
        aria-label={ariaLabel || title}
        name={name}
      />
      <label htmlFor={controlId}>
        <Button variant="contained" component="span" disabled={disabled || readOnly}>
          {title}
        </Button>
      </label>
      <TextField
        value={fileName}
        placeholder={title}
        InputProps={{
          readOnly: true,
        }}
        error={isInvalid}
        helperText={isInvalid ? errorToShow : ""}
        aria-describedby={isInvalid ? `${controlId}-error` : undefined}
      />
    </FormControl>
  );
};

export default FloatingLabelFileUpload;
