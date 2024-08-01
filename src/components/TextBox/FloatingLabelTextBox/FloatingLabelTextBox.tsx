// FloatingLabelTextBox.tsx
import React, { useMemo, useCallback } from "react";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import { TextBoxProps } from "../../../interfaces/Common/TextBoxProps";

export interface FloatingLabelTextBoxProps extends TextBoxProps {
  inputPattern?: RegExp; // Optional prop for input pattern
  name?: string;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void; // Add the onKeyPress prop
}

const FloatingLabelTextBox: React.FC<FloatingLabelTextBoxProps> = ({
  ControlID,
  title,
  value = "",
  onChange = () => {},
  placeholder,
  type = "text",
  className,
  style,
  size,
  isMandatory = false,
  disabled = false,
  readOnly = false,
  ariaLabel = "",
  maxLength,
  isSubmitted = false,
  errorMessage,
  max,
  autoComplete = "on",
  inputPattern,
  name,
  onKeyPress, // Add the onKeyPress prop
}) => {
  const controlId = useMemo(() => `txt${ControlID}`, [ControlID]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (!inputPattern || inputPattern.test(newValue)) {
        onChange(e);
      }
    },
    [onChange, inputPattern]
  );

  const isInvalid = useMemo(
    () => (isMandatory && isSubmitted && !value) || !!errorMessage,
    [isMandatory, isSubmitted, value, errorMessage]
  );

  const errorToShow = useMemo(
    () =>
      errorMessage || (isMandatory && !value ? `${title} is required.` : ""),
    [errorMessage, isMandatory, value, title]
  );

  return (
    <FormControl
      variant="outlined"
      fullWidth
      margin="normal"
      className={className}
      style={style}
    >
      <TextField
        id={controlId}
        name={name}
        label={title || ""}
        type={type}
        value={value}
        onChange={handleChange}
        onKeyPress={onKeyPress} // Pass the onKeyPress prop
        placeholder={placeholder || title}
        size={size}
        disabled={disabled}
        required={isMandatory}
        InputProps={{
          readOnly: readOnly,
          inputProps: {
            "aria-label": ariaLabel || title,
            maxLength: maxLength,
            max: max,
          },
        }}
        error={isInvalid}
        helperText={isInvalid ? errorToShow : ""}
        autoComplete={autoComplete}
        aria-describedby={isInvalid ? `${controlId}-error` : undefined}
      />
    </FormControl>
  );
};

export default FloatingLabelTextBox;
