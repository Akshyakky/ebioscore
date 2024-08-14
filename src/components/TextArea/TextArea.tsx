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
  label: string;
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
}

const TextArea: React.FC<TextAreaProps> = ({
  label,
  name,
  value,
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
}) => {
  const remainingChars = useMemo(() => {
    return maxLength ? maxLength - value.length : undefined;
  }, [value.length, maxLength]);

  return (
    <FormControl
      className={className}
      fullWidth
      margin="normal"
      style={style}
      required={isMandatory}
      disabled={disabled}
      error={error}
      sx={sx}
    >
      <TextField
        label={label}
        name={name}
        value={value}
        onChange={onChange}
        multiline
        rows={rows}
        disabled={disabled}
        InputProps={{
          readOnly: readOnly,
        }}
        placeholder={placeholder}
        variant="outlined"
        aria-required={isMandatory}
        aria-invalid={error}
        inputProps={{
          maxLength,
          "aria-describedby": helperText ? `${name}-helper-text` : undefined,
        }}
      />
      {(helperText || isMandatory || maxLength) && (
        <Box display="flex" justifyContent="space-between" mt={1}>
          <FormHelperText id={`${name}-helper-text`} error={error}>
            {helperText || (isMandatory && !value ? `${label} is required` : "")}
          </FormHelperText>
          {maxLength && (
            <Typography variant="caption" color="textSecondary">
              {remainingChars} characters remaining
            </Typography>
          )}
        </Box>
      )}
    </FormControl>
  );
};

export default TextArea;
