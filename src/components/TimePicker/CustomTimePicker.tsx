import React, { useMemo } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker, TimeView } from "@mui/x-date-pickers";
import { FormControl, SxProps, Theme } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export interface TimeSteps {
  minutes?: number;
}

export interface CustomTimePickerProps {
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
  minTime?: Date;
  maxTime?: Date;
  InputProps?: Record<string, any>;
  InputLabelProps?: Record<string, any>;
  disableFuture?: boolean;
  disablePast?: boolean;
  sx?: SxProps<Theme>;
  format?: string;
  ampm?: boolean;
  views?: Array<"hours" | "minutes" | "seconds">;
  shouldDisableTime?: (value: Date) => boolean;
  minutesStep?: number;
  clearable?: boolean;
  showToolbar?: boolean;
  timezone?: string;
  onError?: (error: string | null) => void;
  onAccept?: (date: Date | null) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

const CustomTimePicker: React.FC<CustomTimePickerProps> = ({
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
  minTime,
  maxTime,
  InputProps,
  InputLabelProps,
  disableFuture,
  disablePast,
  sx,
  format = "hh:mm A",
  ampm = true,
  views = ["hours", "minutes"],
  shouldDisableTime,
  minutesStep = 5,
  clearable = true,
  showToolbar = true,
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
  onError,
  onAccept,
  onOpen,
  onClose,
}) => {
  const controlId = useMemo(() => `time${ControlID}`, [ControlID]);

  const handleChange = (newValue: Dayjs | Date | null, context: any) => {
    if (!newValue) {
      onChange(null);
      return;
    }

    try {
      const dayjsValue = dayjs.isDayjs(newValue) ? newValue : dayjs(newValue);
      const date = dayjsValue.tz(timezone).toDate();
      onChange(date);
      onError?.(null);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : "Invalid date");
    }
  };

  const timeValue = useMemo(() => {
    if (!value) return null;
    return dayjs(value).tz(timezone);
  }, [value, timezone]);

  const minTimeValue = useMemo(() => {
    if (!minTime) return undefined;
    return dayjs(minTime).tz(timezone);
  }, [minTime, timezone]);

  const maxTimeValue = useMemo(() => {
    if (!maxTime) return undefined;
    return dayjs(maxTime).tz(timezone);
  }, [maxTime, timezone]);

  const shouldDisableTimeSlot = useMemo(() => {
    if (!shouldDisableTime) return undefined;
    return (value: Date | Dayjs, view: TimeView): boolean => {
      const dayjsValue = dayjs.isDayjs(value) ? value : dayjs(value);
      return shouldDisableTime(dayjsValue.toDate());
    };
  }, [shouldDisableTime]);

  return (
    <FormControl variant="outlined" fullWidth margin="normal" className={className} style={style} sx={sx}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <TimePicker
          label={title}
          value={timeValue}
          onChange={handleChange}
          disabled={disabled}
          readOnly={readOnly}
          minTime={minTimeValue}
          maxTime={maxTimeValue}
          format={format}
          disableFuture={disableFuture}
          disablePast={disablePast}
          ampm={ampm}
          views={views}
          shouldDisableTime={shouldDisableTimeSlot}
          minutesStep={minutesStep}
          closeOnSelect={!showToolbar}
          skipDisabled
          onAccept={(date) => onAccept?.(dayjs.isDayjs(date) ? date.toDate() : date || null)}
          onError={(error) => onError?.(error)}
          onOpen={onOpen}
          onClose={onClose}
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
              InputLabelProps: {
                ...InputLabelProps,
                shrink: true,
              },
            },
            actionBar: {
              actions: showToolbar ? (clearable ? ["clear", "accept"] : ["accept"]) : [],
            },
          }}
        />
      </LocalizationProvider>
    </FormControl>
  );
};

export default React.memo(CustomTimePicker);
