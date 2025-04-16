import React, { useMemo, useCallback, forwardRef, useState, useEffect } from "react";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import { TextBoxProps } from "../../../interfaces/Common/TextBoxProps";

const FloatingLabelTextBox = forwardRef<HTMLInputElement, TextBoxProps>(
  (
    {
      ControlID,
      title,
      value = "",
      onChange = () => {},
      onBlur,
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
      step,
      autoComplete = "on",
      inputPattern,
      name,
      onKeyPress,
      multiline = false,
      rows = 0,
      InputProps = {},
      InputLabelProps = {},
    },
    ref
  ) => {
    const controlId = useMemo(() => `txt${ControlID}`, [ControlID]);

    // Use local state to immediately update UI without waiting for parent rerender
    const [localValue, setLocalValue] = useState(value);

    // Sync local state with prop value when it changes externally
    useEffect(() => {
      setLocalValue(value);
    }, [value]);

    // Handle direct typing with improved performance
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;

        // Update local state immediately for responsive UI
        setLocalValue(newValue);

        // Only validate and update parent if pattern matches or no pattern exists
        if (!inputPattern || inputPattern.test(newValue)) {
          // Use requestAnimationFrame to defer the parent state update
          // This prevents blocking the UI thread during rapid key presses
          requestAnimationFrame(() => {
            onChange(e);
          });
        }
      },
      [onChange, inputPattern]
    );

    const isInvalid = useMemo(() => (isMandatory && isSubmitted && !value) || !!errorMessage, [isMandatory, isSubmitted, value, errorMessage]);

    const errorToShow = useMemo(() => errorMessage || (isMandatory && !value ? `${title} is required.` : ""), [errorMessage, isMandatory, value, title]);

    const inputProps: React.InputHTMLAttributes<HTMLInputElement> = {
      "aria-label": ariaLabel || title,
      maxLength: maxLength,
      ...InputProps.inputProps,
    };

    if (type === "number" || type === "date") {
      inputProps.max = max;
      inputProps.min = min;
      if (type === "number") {
        inputProps.step = step;
      }
    }

    return (
      <FormControl variant="outlined" fullWidth margin="normal" className={className} style={style}>
        <TextField
          ref={ref}
          id={controlId}
          name={name}
          label={title || ""}
          type={type}
          // Use localValue for UI rendering to ensure responsiveness
          value={localValue}
          onChange={handleChange}
          onBlur={onBlur}
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
  }
);
FloatingLabelTextBox.displayName = "FloatingLabelTextBox";
export default FloatingLabelTextBox;
