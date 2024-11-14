import React, { useMemo, useCallback, useState } from "react";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import { TextBoxProps } from "../../interfaces/Common/TextBoxProps";

interface FloatingLabelFileUploadProps extends TextBoxProps {
  accept?: string; // Optional prop for accepted file types
  multiple?: boolean; // Optional prop for multiple file selection
  preview?: boolean; // Optional prop to enable/disable preview of uploaded files
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
  preview = true, // Enable preview by default
}) => {
  const [filePath, setFilePath] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const controlId = useMemo(() => `file${ControlID}`, [ControlID]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        setFilePath(URL.createObjectURL(file));
        setFileName(file.name);
        onChange(e);
      }
    },
    [onChange, multiple]
  );

  const handleClear = () => {
    setFilePath(null);
    setFileName(null);
    const input = document.getElementById(controlId) as HTMLInputElement;
    if (input) {
      input.value = ""; // Clear the file input
    }
    onChange({ target: { files: null } } as React.ChangeEvent<HTMLInputElement>);
  };

  const hasError = isMandatory && isSubmitted && !filePath;

  return (
    <FormControl variant="outlined" fullWidth margin="normal" className={className} style={style} error={hasError}>
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
      {filePath && preview && (
        <>
          {accept?.includes("image/") ? (
            <img src={filePath} alt={fileName || "Uploaded File"} style={{ display: "block", marginTop: "10px", maxWidth: "100%" }} />
          ) : (
            <p style={{ marginTop: "10px" }}>{fileName}</p>
          )}
          <Button variant="text" color="secondary" onClick={handleClear} style={{ marginTop: "10px" }}>
            Clear
          </Button>
        </>
      )}
      {hasError && <FormHelperText error>{errorMessage || `${title} is required.`}</FormHelperText>}
    </FormControl>
  );
};

export default FloatingLabelFileUpload;
