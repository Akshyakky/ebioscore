import React, { useState, ReactNode } from "react";
import { Controller, Control, FieldValues, Path } from "react-hook-form";
import {
  TextField,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  InputAdornment,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Autocomplete,
  Box,
  IconButton,
  Chip,
  Stack,
  InputLabel,
  FormGroup,
  SelectChangeEvent,
  TextFieldProps,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import dayjs, { Dayjs } from "dayjs";

// Define the date format constant
const DATE_FORMAT = "DD/MM/YYYY";

// Define option type for select, radio, checkbox, etc.
export interface OptionType {
  value: string | number | boolean;
  label: string;
}

// Field types
export type FieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "search"
  | "tel"
  | "url"
  | "textarea"
  | "select"
  | "multiselect"
  | "autocomplete"
  | "radio"
  | "checkbox"
  | "datepicker"
  | "datetimepicker"
  | "file";

// Common props for all field types
interface FormFieldCommonProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  placeholder?: string;
  helperText?: string;
  variant?: "outlined" | "filled" | "standard";
  size?: "small" | "medium";
  defaultValue?: any;
  onChange?: (value: any) => void;
  onBlur?: (event: React.FocusEvent<HTMLElement>) => void;
  adornment?: ReactNode;
  adornmentPosition?: "start" | "end";
}

// Type guards for other props based on field type
type TextFieldTypeProps = {
  type: "text" | "email" | "password" | "number" | "search" | "tel" | "url";
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  InputProps?: Partial<TextFieldProps["InputProps"]>;
};

// Define other specific props types similarly to your original component
type TextareaTypeProps = {
  type: "textarea";
  rows?: number;
  inputProps?: React.InputHTMLAttributes<HTMLTextAreaElement>;
  InputProps?: Partial<TextFieldProps["InputProps"]>;
};

type SelectTypeProps = {
  type: "select";
  options: OptionType[];
  multiple?: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLSelectElement>;
  InputProps?: Partial<TextFieldProps["InputProps"]>;
};

type AutocompleteTypeProps = {
  type: "autocomplete" | "multiselect";
  options: OptionType[];
  multiple?: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  InputProps?: Partial<TextFieldProps["InputProps"]>;
};

type RadioTypeProps = {
  type: "radio";
  options: OptionType[];
  row?: boolean;
};

type CheckboxTypeProps = {
  type: "checkbox";
  options?: OptionType[];
  row?: boolean;
};

type DatePickerTypeProps = {
  type: "datepicker" | "datetimepicker";
  minDate?: Dayjs;
  maxDate?: Dayjs;
  format?: string;
};

type FileTypeProps = {
  type: "file";
  accept?: string;
  maxSize?: number;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  InputProps?: Partial<TextFieldProps["InputProps"]>;
};

// Combine all possible props using discriminated union
export type FormFieldProps<TFieldValues extends FieldValues> = FormFieldCommonProps<TFieldValues> &
  (TextFieldTypeProps | TextareaTypeProps | SelectTypeProps | AutocompleteTypeProps | RadioTypeProps | CheckboxTypeProps | DatePickerTypeProps | FileTypeProps);

/**
 * FormField - A comprehensive form field component for Material UI v7
 * Integrates with React Hook Form and Material UI
 */
const FormField = <TFieldValues extends FieldValues>({
  name,
  control,
  label,
  type = "text",
  required = false,
  disabled = false,
  fullWidth = true,
  placeholder = "",
  helperText = "",
  variant = "outlined",
  size = "medium",
  defaultValue,
  onChange: externalOnChange,
  onBlur: externalOnBlur,
  adornment,
  adornmentPosition = "end",
  ...rest
}: FormFieldProps<TFieldValues>) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string>("");

  // Type guards for checking field types
  const isTextField = (type: FieldType): type is TextFieldTypeProps["type"] => ["text", "email", "password", "number", "search", "tel", "url"].includes(type);
  const isTextArea = (type: FieldType): boolean => type === "textarea";
  const isSelect = (type: FieldType): boolean => type === "select";
  const isMultiSelect = (type: FieldType): boolean => type === "multiselect";
  const isAutocomplete = (type: FieldType): boolean => type === "autocomplete";
  const isRadio = (type: FieldType): boolean => type === "radio";
  const isCheckbox = (type: FieldType): boolean => type === "checkbox";
  const isDatePicker = (type: FieldType): boolean => type === "datepicker";
  const isDateTimePicker = (type: FieldType): boolean => type === "datetimepicker";
  const isFileInput = (type: FieldType): boolean => type === "file";

  // Helper functions to access properties based on field type
  const getOptions = (): OptionType[] => {
    if (isSelect(type) || isMultiSelect(type) || isAutocomplete(type) || isRadio(type) || isCheckbox(type)) {
      return (rest as any).options || [];
    }
    return [];
  };

  const getMultiple = (): boolean => {
    if (isSelect(type) || isMultiSelect(type) || isAutocomplete(type)) {
      return (rest as any).multiple || false;
    }
    return false;
  };

  const getRows = (): number => {
    if (isTextArea(type)) {
      return (rest as any).rows || 4;
    }
    return 4;
  };

  const getInputProps = (): any => {
    return (rest as any).inputProps || {};
  };

  const getInputPropsObj = (): any => {
    return (rest as any).InputProps || {};
  };

  // Get date format from props or use default
  const getDateFormat = (): string => {
    if (isDatePicker(type) || isDateTimePicker(type)) {
      return (rest as any).format || DATE_FORMAT;
    }
    return DATE_FORMAT;
  };

  // Other getter functions similar to your original component
  const getMin = (): number | undefined => (isTextField(type) && type === "number" ? (rest as any).min : undefined);

  const getMax = (): number | undefined => (isTextField(type) && type === "number" ? (rest as any).max : undefined);

  const getStep = (): number | undefined => (isTextField(type) && type === "number" ? (rest as any).step : undefined);

  const getAccept = (): string | undefined => (isFileInput(type) ? (rest as any).accept : undefined);

  const getMaxSize = (): number | undefined => (isFileInput(type) ? (rest as any).maxSize : undefined);

  const getRow = (): boolean => (isRadio(type) || isCheckbox(type) ? (rest as any).row || false : false);

  // Toggle password visibility
  const handleClickShowPassword = (): void => {
    setShowPassword(!showPassword);
  };

  // Validate file uploads
  const validateFile = (file: File | null): boolean => {
    if (!file) return true;

    const maxSize = getMaxSize();
    const accept = getAccept();

    if (maxSize && file.size > maxSize) {
      const sizeMB = Math.round(maxSize / 1048576);
      setFileError(`File size should not exceed ${sizeMB} MB`);
      return false;
    }

    if (accept) {
      const acceptedTypes = accept.split(",").map((type) => type.trim());
      const fileType = file.type;
      const fileExtension = `.${file.name.split(".").pop()}`;

      const isValidType = acceptedTypes.some((type) => type === fileType || type === fileExtension || (type.includes("/*") && fileType.startsWith(type.replace("/*", "/"))));

      if (!isValidType) {
        setFileError(`File type not supported. Accepted types: ${accept}`);
        return false;
      }
    }

    setFileError("");
    return true;
  };

  // Main render function for Controller
  const renderField = ({ field, fieldState }: { field: any; fieldState: { error?: { message?: string } } }) => {
    const { error } = fieldState;
    const errorMessage = error?.message || fileError;

    // Common props for text-based fields
    const commonProps = {
      id: `field-${name}`,
      label,
      error: !!errorMessage,
      helperText: errorMessage || helperText,
      disabled,
      fullWidth,
      required,
      placeholder,
      size,
      variant,
      InputProps: {
        ...getInputPropsObj(),
        ...(adornment && {
          [adornmentPosition === "start" ? "startAdornment" : "endAdornment"]: <InputAdornment position={adornmentPosition}>{adornment}</InputAdornment>,
        }),
      },
      inputProps: {
        ...getInputProps(),
      },
    };

    // Handle text fields (input, email, number, etc.)
    if (isTextField(type) && type !== "password") {
      return (
        <TextField
          {...commonProps}
          {...field}
          type={type}
          inputProps={{
            ...getInputProps(),
            ...(type === "number" && {
              min: getMin(),
              max: getMax(),
              step: getStep(),
            }),
          }}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            field.onChange(e);
            externalOnChange?.(e);
          }}
          onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
            field.onBlur(e);
            externalOnBlur?.(e);
          }}
          InputLabelProps={{
            shrink: field.value ? true : undefined,
          }}
        />
      );
    }

    // Password field with visibility toggle
    if (isTextField(type) && type === "password") {
      return (
        <TextField
          {...commonProps}
          {...field}
          type={showPassword ? "text" : "password"}
          InputProps={{
            ...getInputPropsObj(),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} edge="end">
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            field.onChange(e);
            externalOnChange?.(e);
          }}
          onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
            field.onBlur(e);
            externalOnBlur?.(e);
          }}
        />
      );
    }

    // Textarea
    if (isTextArea(type)) {
      return (
        <TextField
          {...commonProps}
          {...field}
          multiline
          rows={getRows()}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            field.onChange(e);
            externalOnChange?.(e);
          }}
          onBlur={(e: React.FocusEvent<HTMLTextAreaElement>) => {
            field.onBlur(e);
            externalOnBlur?.(e);
          }}
        />
      );
    }

    // Select field
    if (isSelect(type)) {
      const options = getOptions();
      const multiple = getMultiple();

      return (
        <FormControl error={!!errorMessage} disabled={disabled} fullWidth={fullWidth} required={required} variant={variant} size={size}>
          <InputLabel id={`${name}-label`}>{label}</InputLabel>
          <Select
            {...field}
            labelId={`${name}-label`}
            id={`field-${name}`}
            multiple={multiple}
            label={label}
            onChange={(e: SelectChangeEvent<unknown>) => {
              field.onChange(e);
              externalOnChange?.(e);
            }}
            onBlur={(e: React.FocusEvent<HTMLElement>) => {
              field.onBlur(e);
              externalOnBlur?.(e);
            }}
            renderValue={
              multiple
                ? (selected: any) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {(selected as Array<string | number>).map((value) => {
                        const option = options.find((opt) => opt.value === value) || { value: "", label: "" };
                        return <Chip key={String(value)} label={option.label || value} size="small" />;
                      })}
                    </Box>
                  )
                : undefined
            }
          >
            {options.map((option) => (
              <MenuItem key={String(option.value)} value={String(option.value)}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {(errorMessage || helperText) && <FormHelperText>{errorMessage || helperText}</FormHelperText>}
        </FormControl>
      );
    }

    // Autocomplete with multiselect support
    if (isMultiSelect(type) || isAutocomplete(type)) {
      const options = getOptions();
      const multiple = isMultiSelect(type) || getMultiple();

      return (
        <Autocomplete
          {...field}
          multiple={multiple}
          id={`field-${name}`}
          options={options}
          getOptionLabel={(option: any) => {
            if (typeof option === "object" && option !== null) {
              return option.label || "";
            }
            const foundOption = options.find((opt) => opt.value === option);
            return foundOption ? foundOption.label : String(option);
          }}
          isOptionEqualToValue={(option, value) => {
            if (typeof value === "object" && value !== null) {
              return (option as OptionType).value === (value as OptionType).value;
            }
            return (option as OptionType).value === value;
          }}
          value={field.value || (multiple ? [] : null)}
          disabled={disabled}
          onChange={(_, newValue) => {
            if (multiple) {
              const values = (newValue as Array<any>).map((item: any) => (typeof item === "object" ? item.value : item));
              field.onChange(values);
              externalOnChange?.(values);
            } else {
              const value = newValue ? (typeof newValue === "object" && "value" in newValue ? (newValue as OptionType).value : newValue) : null;
              field.onChange(value);
              externalOnChange?.(value);
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              variant={variant}
              error={!!errorMessage}
              helperText={errorMessage || helperText}
              required={required}
              size={size}
              InputLabelProps={{
                shrink: field.value ? true : undefined,
              }}
            />
          )}
        />
      );
    }

    // Radio group
    if (isRadio(type)) {
      const options = getOptions();
      const row = getRow();

      return (
        <FormControl component="fieldset" error={!!errorMessage} disabled={disabled} required={required} fullWidth={fullWidth}>
          <FormLabel component="legend">{label}</FormLabel>
          <RadioGroup
            {...field}
            aria-label={String(name)}
            name={String(name)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              field.onChange(e);
              externalOnChange?.(e);
            }}
            row={row}
          >
            {options.map((option) => (
              <FormControlLabel key={String(option.value)} value={option.value} control={<Radio size={size} />} label={option.label} />
            ))}
          </RadioGroup>
          {(errorMessage || helperText) && <FormHelperText>{errorMessage || helperText}</FormHelperText>}
        </FormControl>
      );
    }

    // Checkbox group or single checkbox
    if (isCheckbox(type)) {
      const options = getOptions();
      const row = getRow();

      if (options.length > 0) {
        // Multiple checkboxes
        return (
          <FormControl component="fieldset" error={!!errorMessage} disabled={disabled} required={required} fullWidth={fullWidth}>
            <FormLabel component="legend">{label}</FormLabel>
            <FormGroup row={row}>
              {options.map((option) => {
                const isChecked = Array.isArray(field.value) ? field.value.includes(option.value) : false;

                return (
                  <FormControlLabel
                    key={String(option.value)}
                    control={
                      <Checkbox
                        checked={isChecked}
                        onChange={(e) => {
                          let newValue = [...(field.value || [])];
                          if (e.target.checked) {
                            newValue.push(option.value);
                          } else {
                            newValue = newValue.filter((val) => val !== option.value);
                          }
                          field.onChange(newValue);
                          externalOnChange?.(newValue);
                        }}
                        size={size}
                      />
                    }
                    label={option.label}
                  />
                );
              })}
            </FormGroup>
            {(errorMessage || helperText) && <FormHelperText>{errorMessage || helperText}</FormHelperText>}
          </FormControl>
        );
      }

      // Single checkbox
      return (
        <FormControl error={!!errorMessage} disabled={disabled} required={required} fullWidth={fullWidth}>
          <FormControlLabel
            control={
              <Checkbox
                checked={field.value || false}
                onChange={(e) => {
                  field.onChange(e.target.checked);
                  externalOnChange?.(e.target.checked);
                }}
                size={size}
              />
            }
            label={label}
          />
          {(errorMessage || helperText) && <FormHelperText>{errorMessage || helperText}</FormHelperText>}
        </FormControl>
      );
    }

    // Date pickers
    if (isDatePicker(type) || isDateTimePicker(type)) {
      const PickerComponent = isDatePicker(type) ? DatePicker : DateTimePicker;
      const dateFormat = getDateFormat();

      return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <PickerComponent
            label={label}
            value={field.value ? (typeof field.value === "string" ? dayjs(field.value, dateFormat) : dayjs(field.value)) : null}
            onChange={(newValue) => {
              // Return actual Date object instead of formatted string
              const dateValue = newValue && dayjs.isDayjs(newValue) ? newValue.toDate() : null;
              field.onChange(dateValue);
              externalOnChange?.(dateValue);
            }}
            disabled={disabled}
            format={dateFormat}
            slotProps={{
              textField: {
                variant,
                fullWidth,
                required,
                error: !!errorMessage,
                helperText: errorMessage || helperText,
                size,
                InputLabelProps: {
                  shrink: true,
                },
              },
            }}
          />
        </LocalizationProvider>
      );
    }

    // File input
    if (isFileInput(type)) {
      const accept = getAccept();

      return (
        <TextField
          {...commonProps}
          type="file"
          InputLabelProps={{
            shrink: true,
          }}
          inputProps={{
            ...getInputProps(),
            accept,
          }}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0] || null;
            const isValid = validateFile(file);
            if (isValid) {
              field.onChange(file);
              externalOnChange?.(file);
            } else {
              e.target.value = "";
              field.onChange(null);
              externalOnChange?.(null);
            }
          }}
          onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
            field.onBlur(e);
            externalOnBlur?.(e);
          }}
        />
      );
    }

    // Default text field as fallback
    return (
      <TextField
        {...commonProps}
        {...field}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          field.onChange(e);
          externalOnChange?.(e);
        }}
        onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
          field.onBlur(e);
          externalOnBlur?.(e);
        }}
      />
    );
  };

  return <Controller name={name} control={control} defaultValue={defaultValue} render={renderField} />;
};

export default FormField;
