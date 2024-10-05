import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from "@mui/x-date-pickers";
import { FormControl } from '@mui/material';
import dayjs from "dayjs";

interface CustomDateTimePickerProps {
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
    minDateTime?: Date;
    maxDateTime?: Date;
    InputProps?: {};
    InputLabelProps?: {};
}

const CustomDateTimePicker: React.FC<CustomDateTimePickerProps> = ({
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
    minDateTime,
    maxDateTime,
    InputProps,
    InputLabelProps,
}) => {
    const controlId = `dateTime${ControlID}`;

    return (
        <FormControl
            variant="outlined"
            fullWidth
            margin="normal"
            className={className}
            style={style}
        >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                    label={title}
                    value={value ? dayjs(value) : null}
                    onChange={(newValue) => onChange(newValue ? newValue.toDate() : null)}
                    disabled={disabled || readOnly}
                    minDateTime={minDateTime ? dayjs(minDateTime) : undefined}
                    maxDateTime={maxDateTime ? dayjs(maxDateTime) : undefined}
                    format="DD/MM/YYYY HH:mm"
                    slotProps={{
                        textField: {
                            id: controlId,
                            size: size,
                            fullWidth: true,
                            error: !!errorMessage,
                            helperText: errorMessage,
                            placeholder: placeholder || title,
                            required: isMandatory,
                            InputProps: {
                                readOnly: readOnly,
                                ...InputProps,
                            },
                            InputLabelProps: InputLabelProps,
                        },
                    }}
                />
            </LocalizationProvider>
        </FormControl>
    );
};

export default CustomDateTimePicker;