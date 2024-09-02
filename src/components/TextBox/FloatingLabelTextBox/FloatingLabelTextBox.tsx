import React, { useMemo, useCallback } from "react";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";

export interface TextBoxProps {
  ControlID: string;
  title?: string;
  value?: any;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  style?: React.CSSProperties;
  size?: "small" | "medium";
  isMandatory?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  ariaLabel?: string;
  maxLength?: number;
  isSubmitted?: boolean;
  errorMessage?: string;
  max?: number | string;
  min?: number | string;
  autoComplete?: string;
  inputPattern?: RegExp;
  name?: string;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  multiline?: boolean;
  rows?: number;
  InputProps?: TextFieldProps['InputProps'];
  InputLabelProps?: TextFieldProps['InputLabelProps'];
}

const FloatingLabelTextBox: React.FC<TextBoxProps> = ({
  ControlID,
  title,
  value = "",
  onChange = () => { },
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
  min,
  autoComplete = "on",
  inputPattern,
  name,
  onKeyPress,
  multiline = false,
  rows = 0,
  InputProps = {},
  InputLabelProps = {},
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

  const inputProps: React.InputHTMLAttributes<HTMLInputElement> = {
    "aria-label": ariaLabel || title,
    maxLength: maxLength,
    ...InputProps.inputProps,
  };

  if (type === "number" || type === "date") {
    inputProps.max = max;
    inputProps.min = min;
  }

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
        onKeyPress={onKeyPress}
        placeholder={placeholder || title}
        size={size}
        disabled={disabled}
        required={isMandatory}
        InputProps={{
          readOnly: readOnly,
          ...InputProps,
          inputProps: inputProps,
        }}
        error={isInvalid}
        helperText={isInvalid ? errorToShow : ""}
        autoComplete={autoComplete}
        aria-describedby={isInvalid ? `${controlId}-error` : undefined}
        multiline={multiline}
        rows={rows}
        InputLabelProps={{
          shrink: type === "date" ? true : undefined,
          ...InputLabelProps,
        }}
      />
    </FormControl>
  );
};

export default FloatingLabelTextBox;