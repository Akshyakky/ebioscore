import React, { useMemo, useCallback, useState } from "react";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
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
  const [filePath, setFilePath] = useState("");
  const controlId = useMemo(() => `file${ControlID}`, [ControlID]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        setFilePath(URL.createObjectURL(file));
        onChange(e);
      }
    },
    [onChange, multiple]
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
      {filePath && (
        <img
          src={filePath}
          alt="Uploaded File"
          style={{ display: "block", marginTop: "10px", maxWidth: "100%" }}
        />
      )}
    </FormControl>
  );
};

export default FloatingLabelFileUpload;
