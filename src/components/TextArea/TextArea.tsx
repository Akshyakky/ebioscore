import React, { useMemo } from "react";
import {
  FormControl,
  TextField,
  FormHelperText,
  Box,
  Typography,
} from "@mui/material";
import { SxProps } from "@mui/system";
import { Theme } from "@mui/material/styles";

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
  helperText?: string;
  error?: boolean;
  sx?: SxProps<Theme>;
  isSubmitted?: boolean;
  errorMessage?: string;
}

const TextArea: React.FC<TextAreaProps> = ({
  label = '',
  name,
  value = '',
  onChange,
  rows = 3,
  isMandatory = false,
  disabled = false,
  readOnly = false,
  className,
  placeholder,
  style,
  maxLength,
  helperText = "",
  error = false,
  sx = {},
  isSubmitted = false,
  errorMessage,
}) => {

  const remainingChars = useMemo(() => {
    if (!maxLength || !value) return undefined;
    return maxLength - value.toString().length;
  }, [value, maxLength]);

  const showError = useMemo(() => {
    return error || (isSubmitted && isMandatory && !value);
  }, [error, isSubmitted, isMandatory, value]);

  const displayHelperText = useMemo(() => {
    if (errorMessage) return errorMessage;
    if (showError && isMandatory) return `${label || 'Field'} is required`;
    return helperText;
  }, [errorMessage, showError, isMandatory, label, helperText]);

  return (
    <FormControl
      className={className}
      fullWidth
      margin="normal"
      style={style}
      required={isMandatory}
      disabled={disabled}
      error={showError}
      sx={sx}
    >
      <TextField
        label={label}
        name={name}
        value={value || ''}
        onChange={onChange}
        multiline
        rows={rows}
        disabled={disabled}
        InputProps={{
          readOnly,
        }}
        placeholder={placeholder}
        variant="outlined"
        aria-required={isMandatory}
        aria-invalid={showError}
        error={showError}
        inputProps={{
          maxLength,
          'aria-describedby': `${name}-helper-text`,
        }}
      />
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        mt={0.5}
      >
        {displayHelperText && (
          <FormHelperText
            id={`${name}-helper-text`}
            error={showError}
            sx={{ margin: 0 }}
          >
            {displayHelperText}
          </FormHelperText>
        )}
        {maxLength && (
          <Typography
            variant="caption"
            color="textSecondary"
            sx={{ marginLeft: 'auto' }}
          >
            {remainingChars} characters remaining
          </Typography>
        )}
      </Box>
    </FormControl>
  );
};

export default React.memo(TextArea);
