import React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers";
import { FormControl } from "@mui/material";
import dayjs from "dayjs";

interface CustomDatePickerProps {
  ControlID: string;
  title: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  size?: "small" | "medium";
  isMandatory?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  errorMessage?: string;
  minDate?: Date;
  maxDate?: Date;
  InputProps?: Record<string, any>;
  InputLabelProps?: Record<string, any>;
  disableFuture?: boolean;
  disablePast?: boolean;
  sx?: Record<string, any>;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  ControlID,
  title,
  value,
  onChange,
  placeholder,
  className,
  style,
  size = "small",
  isMandatory = false,
  disabled = false,
  readOnly = false,
  errorMessage,
  minDate,
  maxDate,
  InputProps,
  InputLabelProps,
  disableFuture,
  disablePast,
  sx,
}) => {
  const controlId = `date${ControlID}`;
  return (
    <FormControl variant="outlined" fullWidth margin="normal" className={className} style={style} sx={sx}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label={title}
          value={value ? dayjs(value) : null}
          onChange={(newValue) => onChange(newValue ? newValue.toDate() : null)}
          disabled={disabled || readOnly}
          minDate={minDate ? dayjs(minDate) : undefined}
          maxDate={maxDate ? dayjs(maxDate) : undefined}
          format="DD/MM/YYYY"
          disableFuture={disableFuture}
          disablePast={disablePast}
          slotProps={{
            textField: {
              id: controlId,
              size,
              fullWidth: true,
              error: !!errorMessage,
              helperText: errorMessage,
              placeholder: placeholder || title,
              required: isMandatory,
              InputProps: {
                readOnly,
                ...InputProps,
              },
              InputLabelProps,
            },
          }}
        />
      </LocalizationProvider>
    </FormControl>
  );
};

export default CustomDatePicker;
