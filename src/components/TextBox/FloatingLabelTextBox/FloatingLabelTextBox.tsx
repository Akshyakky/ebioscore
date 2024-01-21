import React from "react";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import { TextBoxProps } from "../../../interfaces/Common/TextBoxProps";

const FloatingLabelTextBox: React.FC<TextBoxProps> = ({
  ControlID,
  title,
  value = "",
  onChange,
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
}) => {
  const controlId = `txt${ControlID}`;
  const isInvalid = (isMandatory && isSubmitted && !value) || !!errorMessage;
  const errorToShow =
    errorMessage || (isMandatory && !value ? `${title} is required.` : "");

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
        label={title || ""}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder || title}
        size={size}
        disabled={disabled}
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
      />
      {/* {isInvalid && <FormHelperText error>{errorToShow}</FormHelperText>} */}
    </FormControl>
  );
};

export default FloatingLabelTextBox;
