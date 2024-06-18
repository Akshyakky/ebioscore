import React from "react";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import { TextBoxProps } from "../../../interfaces/Common/TextBoxProps";

const NormalTextBox: React.FC<TextBoxProps> = ({
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
}) => {
  const controlId = `txt${ControlID}`;
  const isInvalid = (isMandatory && isSubmitted && !value) || !!errorMessage;
  const errorToShow =
    errorMessage || (isMandatory && !value ? `${title} is required.` : "");

  return (
    <FormControl
      fullWidth
      variant="outlined"
      className={className}
      style={style}
    >
      <TextField
        id={controlId}
        label={title}
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
        helperText={isInvalid && errorToShow}
      />
      {isInvalid && <FormHelperText error>{errorToShow}</FormHelperText>}
    </FormControl>
  );
};

export default NormalTextBox;
