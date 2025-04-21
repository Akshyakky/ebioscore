import React, { useMemo, useCallback, forwardRef, useState, useEffect, useRef } from "react";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import { TextBoxProps } from "../../../interfaces/Common/TextBoxProps";

/**
 * FloatingLabelTextBox - A performance-optimized text input component with floating label
 *
 * This component handles controlled input with efficient state management,
 * properly memoized callbacks, and optimized rendering.
 */
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
    // Create stable ID for the input
    const controlId = useMemo(() => `txt${ControlID}`, [ControlID]);

    // Use local state for immediate UI updates
    const [localValue, setLocalValue] = useState(value?.toString() || "");

    // Track if we're currently in a user-initiated update
    const isUserUpdate = useRef(false);

    // Sync local state with external value changes
    useEffect(() => {
      if (!isUserUpdate.current && String(value) !== localValue) {
        setLocalValue(value?.toString() || "");
      } else {
        isUserUpdate.current = false;
      }
    }, [value, localValue]);

    // Memoize error states for better performance
    const isInvalid = useMemo(() => (isMandatory && isSubmitted && !value) || !!errorMessage, [isMandatory, isSubmitted, value, errorMessage]);

    const errorToShow = useMemo(() => errorMessage || (isMandatory && !value ? `${title} is required.` : ""), [errorMessage, isMandatory, value, title]);

    // Efficient change handler with pattern validation
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;

        // Mark this as a user-initiated update
        isUserUpdate.current = true;

        // Immediately update local state for responsive UI
        setLocalValue(newValue);

        // Only update parent if pattern matches or no pattern exists
        if (!inputPattern || inputPattern.test(newValue)) {
          // Use animation frame for efficient batching while maintaining responsiveness
          requestAnimationFrame(() => {
            onChange(e);
          });
        }
      },
      [onChange, inputPattern]
    );

    // Memoize input props to prevent unnecessary re-renders
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

    // Memoize TextField props for optimal rendering
    const textFieldProps = useMemo(
      () => ({
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
        rows: rows || undefined,
        InputProps: {
          readOnly,
          ...InputProps,
          inputProps,
        },
        InputLabelProps: {
          shrink: type === "date" || Boolean(value) ? true : undefined,
          ...InputLabelProps,
        },
        fullWidth: true,
      }),
      [
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
        value,
      ]
    );

    return (
      <FormControl variant="outlined" fullWidth margin="normal" className={className} style={style}>
        <TextField {...textFieldProps} ref={ref} />
      </FormControl>
    );
  }
);

FloatingLabelTextBox.displayName = "FloatingLabelTextBox";
export default React.memo(FloatingLabelTextBox);
