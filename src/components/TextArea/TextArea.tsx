import React, { useMemo, memo, forwardRef, useCallback } from "react";
import { FormControl, TextField, FormHelperText, Box, Typography, TextFieldProps } from "@mui/material";
import { Theme, SxProps } from "@mui/material/styles";

interface TextAreaProps {
  label?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  isMandatory?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  placeholder?: string;
  style?: React.CSSProperties;
  maxLength?: number;
  minRows?: number;
  maxRows?: number;
  helperText?: string;
  error?: boolean;
  sx?: SxProps<Theme>;
  isSubmitted?: boolean;
  errorMessage?: string;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  InputProps?: TextFieldProps["InputProps"];
  id?: string;
}

/**
 * TextArea - An enhanced textarea component with character counter and optimized rendering
 *
 * Features:
 * - Character counter with remaining characters display
 * - Automatic validation
 * - Efficient memo usage
 * - Support for min/max rows
 */
const TextArea = forwardRef<HTMLDivElement, TextAreaProps>((props, ref) => {
  const {
    label = "",
    name,
    value = "",
    onChange,
    rows = 3,
    isMandatory = false,
    disabled = false,
    readOnly = false,
    className,
    placeholder,
    style,
    maxLength,
    minRows,
    maxRows,
    helperText = "",
    error = false,
    sx = {},
    isSubmitted = false,
    errorMessage,
    onBlur,
    InputProps,
    id,
  } = props;

  // Calculate remaining characters efficiently
  const remainingChars = useMemo(() => {
    if (!maxLength || !value) return undefined;
    return maxLength - String(value).length;
  }, [value, maxLength]);

  // Determine whether to show error state
  const showError = useMemo(() => {
    return error || (isSubmitted && isMandatory && !value);
  }, [error, isSubmitted, isMandatory, value]);

  // Get appropriate help text based on state
  const displayHelperText = useMemo(() => {
    if (errorMessage) return errorMessage;
    if (showError && isMandatory) return `${label || "Field"} is required`;
    return helperText;
  }, [errorMessage, showError, isMandatory, label, helperText]);

  // Generate unique id for accessibility linking
  const textareaId = useMemo(() => id || `textarea-${name}`, [id, name]);

  // Memoized text field props
  const textFieldProps = useMemo(
    () => ({
      id: textareaId,
      label,
      name,
      value: value || "",
      onChange,
      onBlur,
      multiline: true,
      rows,
      minRows,
      maxRows,
      disabled,
      placeholder,
      variant: "outlined" as const,
      error: showError,
      fullWidth: true,
      inputRef: ref,
      InputProps: {
        ...InputProps,
        readOnly,
        inputProps: {
          maxLength,
          "aria-required": isMandatory,
          "aria-invalid": showError,
          "aria-describedby": `${name}-helper-text`,
        },
      },
    }),
    [textareaId, label, name, value, onChange, onBlur, rows, minRows, maxRows, disabled, placeholder, showError, InputProps, readOnly, maxLength, isMandatory, name]
  );

  // Combined helper text and character counter
  const renderHelperContent = useCallback(() => {
    return (
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mt={0.5}>
        {displayHelperText && (
          <FormHelperText id={`${name}-helper-text`} error={showError} sx={{ margin: 0 }}>
            {displayHelperText}
          </FormHelperText>
        )}
        {maxLength && (
          <Typography variant="caption" color={remainingChars && remainingChars <= 10 ? "error" : "textSecondary"} sx={{ marginLeft: "auto" }}>
            {remainingChars} characters remaining
          </Typography>
        )}
      </Box>
    );
  }, [displayHelperText, showError, name, maxLength, remainingChars]);

  return (
    <FormControl className={className} fullWidth margin="normal" style={style} required={isMandatory} disabled={disabled} error={showError} sx={sx}>
      <TextField {...textFieldProps} />
      {(displayHelperText || maxLength) && renderHelperContent()}
    </FormControl>
  );
});

TextArea.displayName = "TextArea";
export default memo(TextArea);
