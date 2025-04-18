import React, { useMemo, useCallback, forwardRef, useState, useEffect, useRef } from "react";
import TextField from "@mui/material/TextField";
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
    // Memoize control ID to avoid recreating on each render
    const controlId = useMemo(() => `txt${ControlID}`, [ControlID]);

    // Use local state for immediate UI updates
    const [localValue, setLocalValue] = useState(value);

    // Track if we're currently in a user-initiated update
    const isUserUpdate = useRef(false);

    // Sync local state with external value changes
    useEffect(() => {
      // Only update if the current change wasn't initiated by the user
      // This prevents the cursor from jumping around while typing
      if (!isUserUpdate.current && value !== localValue) {
        setLocalValue(value || "");
      } else {
        isUserUpdate.current = false;
      }
    }, [value, localValue]);

    // Memoize error states
    const isInvalid = useMemo(() => (isMandatory && isSubmitted && !value) || !!errorMessage, [isMandatory, isSubmitted, value, errorMessage]);

    const errorToShow = useMemo(() => errorMessage || (isMandatory && !value ? `${title} is required.` : ""), [errorMessage, isMandatory, value, title]);

    // Efficient change handler that doesn't recreate on every render
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;

        // Mark this as a user-initiated update
        isUserUpdate.current = true;

        // Immediately update local state for responsive UI
        setLocalValue(newValue);

        // Only validate and update parent if pattern matches or no pattern exists
        if (!inputPattern || inputPattern.test(newValue)) {
          // Use requestAnimationFrame to batch updates efficiently
          // This is more immediate than debouncing but still batches multiple keystrokes
          requestAnimationFrame(() => {
            onChange(e);
          });
        }
      },
      [onChange, inputPattern]
    );

    // Memoize input props to prevent unnecessary reconciliation
    const inputProps = useMemo(() => {
      const props: React.InputHTMLAttributes<HTMLInputElement> = {
        "aria-label": ariaLabel || title,
        maxLength: maxLength,
        ...InputProps.inputProps,
      };

      if (type === "number" || type === "date") {
        props.max = max;
        props.min = min;
        if (type === "number") {
          props.step = step;
        }
      }

      return props;
    }, [ariaLabel, title, maxLength, InputProps.inputProps, type, max, min, step]);

    // Memoize TextField props to minimize reconciliation
    const textFieldProps = useMemo(
      () => ({
        ref,
        id: controlId,
        name,
        label: title || "",
        type,
        value: localValue,
        onChange: handleChange,
        onBlur,
        onKeyPress,
        placeholder: placeholder || title,
        size,
        disabled,
        required: isMandatory,
        error: isInvalid,
        helperText: isInvalid ? errorToShow : "",
        autoComplete,
        "aria-describedby": isInvalid ? `${controlId}-error` : undefined,
        multiline,
        rows,
        InputProps: {
          readOnly,
          ...InputProps,
          inputProps,
        },
        InputLabelProps: {
          shrink: type === "date" ? true : undefined,
          ...InputLabelProps,
        },
      }),
      [
        ref,
        controlId,
        name,
        title,
        type,
        localValue,
        handleChange,
        onBlur,
        onKeyPress,
        placeholder,
        size,
        disabled,
        isMandatory,
        isInvalid,
        errorToShow,
        autoComplete,
        multiline,
        rows,
        readOnly,
        InputProps,
        inputProps,
        InputLabelProps,
      ]
    );

    return (
      <FormControl variant="outlined" fullWidth margin="normal" className={className} style={style}>
        <TextField {...textFieldProps} />
      </FormControl>
    );
  }
);

FloatingLabelTextBox.displayName = "FloatingLabelTextBox";
export default React.memo(FloatingLabelTextBox);
